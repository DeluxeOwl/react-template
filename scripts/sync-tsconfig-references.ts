#!/usr/bin/env bun
/**
 * Syncs TypeScript project references across the monorepo.
 *
 * This script:
 * 1. Discovers all workspace packages from root package.json workspaces field
 * 2. Builds a dependency graph from package.json files
 * 3. Updates tsconfig references in:
 *    - Root tsconfig.json (references all projects)
 *    - Each project's tsconfig that has a "references" field (based on workspace deps)
 *
 * Run: bun scripts/sync-tsconfig
 */

import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, relative, dirname } from "node:path"
import { Glob } from "bun"

const ROOT = join(import.meta.dirname, "..")

interface PackageJson {
  name: string
  workspaces?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface TsConfig {
  references?: { path: string }[]
  [key: string]: unknown
}

interface WorkspacePackage {
  name: string
  /** Relative to root, e.g., "apps/web" */
  path: string
  packageJson: PackageJson
  /** Tsconfig files that have references */
  tsconfigPaths: string[]
}

async function getWorkspacePatterns(): Promise<string[]> {
  const rootPkgContent = await readFile(join(ROOT, "package.json"), "utf8")
  const rootPkg = JSON.parse(rootPkgContent) as PackageJson
  return rootPkg.workspaces ?? []
}

async function parseWorkspacePackage(pkgJsonPath: string): Promise<WorkspacePackage | null> {
  try {
    const content = await readFile(pkgJsonPath, "utf8")
    const packageJson = JSON.parse(content) as PackageJson
    const pkgDir = dirname(pkgJsonPath)
    const relativePath = relative(ROOT, pkgDir)
    const tsconfigPaths = await findTsconfigsWithReferences(pkgDir)

    return { name: packageJson.name, path: relativePath, packageJson, tsconfigPaths }
  } catch {
    // Skip if invalid package.json
    return null
  }
}

async function findWorkspacePackages(): Promise<WorkspacePackage[]> {
  const workspacePatterns = await getWorkspacePatterns()
  const packages: WorkspacePackage[] = []

  for (const pattern of workspacePatterns) {
    const glob = new Glob(join(pattern, "package.json"))

    for await (const pkgJsonPath of glob.scan({ cwd: ROOT, absolute: true })) {
      const pkg = await parseWorkspacePackage(pkgJsonPath)
      if (pkg) {
        packages.push(pkg)
      }
    }
  }

  return packages
}

function isTsconfigFile(entry: string): boolean {
  return entry.startsWith("tsconfig") && entry.endsWith(".json")
}

function hasTsconfigReferences(tsconfig: TsConfig): boolean {
  return (
    tsconfig.references !== undefined ||
    (Array.isArray(tsconfig.files) && tsconfig.files.length === 0)
  )
}

async function checkTsconfigHasReferences(fullPath: string): Promise<boolean> {
  try {
    const content = await readFile(fullPath, "utf8")
    const tsconfig = parseJsonWithComments(content)
    return hasTsconfigReferences(tsconfig)
  } catch {
    return false
  }
}

async function findTsconfigsWithReferences(dir: string): Promise<string[]> {
  let entries: string[]
  try {
    entries = await readdir(dir)
  } catch {
    return []
  }

  const tsconfigFiles = entries.filter((e) => isTsconfigFile(e)).map((entry) => join(dir, entry))
  const checks = await Promise.all(tsconfigFiles.map((f) => checkTsconfigHasReferences(f)))
  return tsconfigFiles.filter((_, i) => checks[i])
}

function parseJsonWithComments(content: string): TsConfig {
  // Strip single-line comments and trailing commas for JSON.parse compatibility
  const stripped = content
    .replaceAll(/\/\/.*$/gm, "")
    .replaceAll(/,(\s*[}\]])/g, "$1")
  return JSON.parse(stripped)
}

async function readTsconfig(path: string): Promise<{ content: string; parsed: TsConfig }> {
  const content = await readFile(path, "utf8")
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
    .toSorted((a, b) => a.path.localeCompare(b.path))
    .map((pkg) => ({ path: `./${pkg.path}` }))

  const updated = updateReferences(content, refs)

  if (updated !== content) {
    await writeFile(rootTsconfigPath, updated)
    console.log(`Updated: tsconfig.json`)
  } else {
    console.log(`No changes: tsconfig.json`)
  }
}

function getWorkspaceDeps(
  pkg: WorkspacePackage,
  packageByName: Map<string, WorkspacePackage>
): WorkspacePackage[] {
  const allDeps = { ...pkg.packageJson.dependencies, ...pkg.packageJson.devDependencies }

  return Object.entries(allDeps)
    .filter(([_, version]) => version.startsWith("workspace:"))
    .map(([name]) => packageByName.get(name))
    .filter((dep): dep is WorkspacePackage => dep !== undefined)
    .toSorted((a, b) => a.path.localeCompare(b.path))
}

function isSolutionStyleTsconfig(parsed: TsConfig): boolean {
  return (
    Array.isArray(parsed.files) &&
    parsed.files.length === 0 &&
    (parsed.references?.some((r) => r.path.startsWith("./tsconfig")) ?? false)
  )
}

function buildTsconfigRefs(workspaceDeps: WorkspacePackage[], tsconfigDir: string) {
  return workspaceDeps.map((dep) => {
    const relPath = relative(tsconfigDir, join(ROOT, dep.path))
    return { path: relPath.startsWith(".") ? relPath : `./${relPath}` }
  })
}

async function syncSingleTsconfig(
  tsconfigPath: string,
  workspaceDeps: WorkspacePackage[]
): Promise<void> {
  const { content, parsed } = await readTsconfig(tsconfigPath)

  if (isSolutionStyleTsconfig(parsed)) {
    console.log(`Skipped (solution-style): ${relative(ROOT, tsconfigPath)}`)
    return
  }

  const refs = buildTsconfigRefs(workspaceDeps, dirname(tsconfigPath))
  const updated = updateReferences(content, refs)

  if (updated !== content) {
    await writeFile(tsconfigPath, updated)
    console.log(`Updated: ${relative(ROOT, tsconfigPath)}`)
  } else {
    console.log(`No changes: ${relative(ROOT, tsconfigPath)}`)
  }
}

async function syncPackageTsconfigs(packages: WorkspacePackage[]): Promise<void> {
  const packageByName = new Map(packages.map((p) => [p.name, p]))

  for (const pkg of packages) {
    const workspaceDeps = getWorkspaceDeps(pkg, packageByName)
    for (const tsconfigPath of pkg.tsconfigPaths) {
      await syncSingleTsconfig(tsconfigPath, workspaceDeps)
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

try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
