/**
 * Syncs TypeScript project references across the monorepo.
 *
 * This script:
 * 1. Discovers all workspace packages (apps/* and packages/*)
 * 2. Builds a dependency graph from package.json files
 * 3. Updates tsconfig references in:
 *    - Root tsconfig.json (references all projects)
 *    - Each project's tsconfig that has a "references" field (based on workspace deps)
 *
 * Run: bun run scripts/sync-tsconfig-references.ts
 */

import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, relative, dirname } from "node:path"

const ROOT = join(import.meta.dirname, "..")

interface PackageJson {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface TsConfig {
  references?: { path: string }[]
  [key: string]: unknown
}

interface WorkspacePackage {
  name: string
  path: string // relative to root, e.g., "apps/web"
  packageJson: PackageJson
  tsconfigPaths: string[] // tsconfig files that have references
}

async function findWorkspacePackages(): Promise<WorkspacePackage[]> {
  const packages: WorkspacePackage[] = []

  for (const dir of ["apps", "packages"]) {
    const dirPath = join(ROOT, dir)
    let entries: string[]
    try {
      entries = await readdir(dirPath)
    } catch {
      continue
    }

    for (const entry of entries) {
      const pkgJsonPath = join(dirPath, entry, "package.json")
      try {
        const content = await readFile(pkgJsonPath, "utf-8")
        const packageJson = JSON.parse(content) as PackageJson

        // Find all tsconfig files with references
        const tsconfigPaths = await findTsconfigsWithReferences(
          join(dirPath, entry)
        )

        packages.push({
          name: packageJson.name,
          path: `${dir}/${entry}`,
          packageJson,
          tsconfigPaths,
        })
      } catch {
        // Skip if no package.json
      }
    }
  }

  return packages
}

async function findTsconfigsWithReferences(dir: string): Promise<string[]> {
  const results: string[] = []
  let entries: string[]

  try {
    entries = await readdir(dir)
  } catch {
    return results
  }

  for (const entry of entries) {
    if (entry.startsWith("tsconfig") && entry.endsWith(".json")) {
      const fullPath = join(dir, entry)
      try {
        const content = await readFile(fullPath, "utf-8")
        const tsconfig = parseJsonWithComments(content)
        // Include if it has references OR if it's a solution-style tsconfig (files: [])
        if (
          tsconfig.references !== undefined ||
          (Array.isArray(tsconfig.files) && tsconfig.files.length === 0)
        ) {
          results.push(fullPath)
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return results
}

function parseJsonWithComments(content: string): TsConfig {
  // Strip single-line comments and trailing commas for JSON.parse compatibility
  const stripped = content
    .replace(/\/\/.*$/gm, "")
    .replace(/,(\s*[}\]])/g, "$1")
  return JSON.parse(stripped)
}

async function readTsconfig(path: string): Promise<{ content: string; parsed: TsConfig }> {
  const content = await readFile(path, "utf-8")
  const parsed = parseJsonWithComments(content)
  return { content, parsed }
}

function updateReferences(
  content: string,
  newRefs: { path: string }[]
): string {
  // Find the references array and replace it while preserving formatting
  const refsRegex = /"references"\s*:\s*\[[\s\S]*?\]/

  const newRefsStr =
    newRefs.length === 0
      ? '"references": []'
      : `"references": [\n${newRefs.map((r) => `    { "path": "${r.path}" }`).join(",\n")}\n  ]`

  if (refsRegex.test(content)) {
    return content.replace(refsRegex, newRefsStr)
  }

  // If no references exist, add before the closing brace
  const lastBrace = content.lastIndexOf("}")
  const before = content.slice(0, lastBrace).trimEnd()
  const needsComma = before.endsWith("}") || before.endsWith("]") || before.endsWith('"')
  return `${before}${needsComma ? "," : ""}\n  ${newRefsStr}\n}`
}

async function syncRootTsconfig(packages: WorkspacePackage[]): Promise<void> {
  const rootTsconfigPath = join(ROOT, "tsconfig.json")
  const { content } = await readTsconfig(rootTsconfigPath)

  // Root references all workspace packages
  const refs = packages
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((pkg) => ({ path: `./${pkg.path}` }))

  const updated = updateReferences(content, refs)

  if (updated !== content) {
    await writeFile(rootTsconfigPath, updated)
    console.log(`Updated: tsconfig.json`)
  } else {
    console.log(`No changes: tsconfig.json`)
  }
}

async function syncPackageTsconfigs(
  packages: WorkspacePackage[]
): Promise<void> {
  const packageByName = new Map(packages.map((p) => [p.name, p]))

  for (const pkg of packages) {
    // Get all workspace dependencies
    const allDeps = {
      ...pkg.packageJson.dependencies,
      ...pkg.packageJson.devDependencies,
    }

    const workspaceDeps = Object.entries(allDeps)
      .filter(([_, version]) => version.startsWith("workspace:"))
      .map(([name]) => packageByName.get(name))
      .filter((dep): dep is WorkspacePackage => dep !== undefined)
      .sort((a, b) => a.path.localeCompare(b.path))

    // Update each tsconfig that has references
    for (const tsconfigPath of pkg.tsconfigPaths) {
      const { content, parsed } = await readTsconfig(tsconfigPath)
      const tsconfigDir = dirname(tsconfigPath)

      // Check if this is a solution-style tsconfig (references other tsconfigs in same dir)
      const isSolutionStyle =
        Array.isArray(parsed.files) &&
        parsed.files.length === 0 &&
        parsed.references?.some((r) => r.path.startsWith("./tsconfig"))

      if (isSolutionStyle) {
        // Don't modify solution-style tsconfigs - they reference local tsconfigs, not packages
        console.log(`Skipped (solution-style): ${relative(ROOT, tsconfigPath)}`)
        continue
      }

      // Calculate relative paths from this tsconfig to workspace deps
      const refs = workspaceDeps.map((dep) => {
        const relPath = relative(tsconfigDir, join(ROOT, dep.path))
        return { path: relPath.startsWith(".") ? relPath : `./${relPath}` }
      })

      const updated = updateReferences(content, refs)

      if (updated !== content) {
        await writeFile(tsconfigPath, updated)
        console.log(`Updated: ${relative(ROOT, tsconfigPath)}`)
      } else {
        console.log(`No changes: ${relative(ROOT, tsconfigPath)}`)
      }
    }
  }
}

async function main() {
  console.log("Syncing tsconfig references...\n")

  const packages = await findWorkspacePackages()
  console.log(
    `Found ${packages.length} workspace packages: ${packages.map((p) => p.name).join(", ")}\n`
  )

  await syncRootTsconfig(packages)
  await syncPackageTsconfigs(packages)

  console.log("\nDone!")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
