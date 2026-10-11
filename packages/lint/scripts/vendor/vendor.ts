// Vendors the rules our oxlint presets use from upstream ESLint plugins into packages/lint/vendor/<dir>/.
//
//   bun run vendor <dir>...     e.g. bun run vendor stylistic perfectionist (in packages/lint)
//   bun run vendor --all
//
// For each plugin, specs/<dir>.ts says which package (pinned version) to install, how it ships its
// rules, and which local patches to apply. The tool installs the package in a cache directory outside
// the repo, copies the rule modules our presets configure, plus the transitive closure of their
// relative imports, byte for byte, applies the patches, and writes:
//   index.js    plugin entry: { meta: { name }, rules } with only those rules, registered in the order
//               the committed index.js has them (oxlint calls rules in registration order; the order
//               decides which of two same-range fixes wins), new ones last
//   index.d.ts  types for the entry
//   README.md   provenance (package, version, files, external deps, local patches)
//   LICENSE     upstream license
// Never edit vendored files by hand: change the spec and regenerate.
import { parseArgs } from "node:util"

import { fail } from "./fail.ts"
import { specs } from "./specs/index.ts"
import { vendorPlugin } from "./vendor-plugin.ts"

const { positionals, values } = parseArgs({ allowPositionals: true, options: { all: { type: "boolean" } } })
const selected = values.all === true ? specs : specs.filter((spec) => positionals.includes(spec.dir))
const unknown = positionals.filter((name) => !specs.some((spec) => spec.dir === name))
if (selected.length === 0 || unknown.length > 0) {
    fail(`usage: bun run vendor <${specs.map((spec) => spec.dir).join("|")}>... | --all${unknown.length > 0 ? ` (unknown: ${unknown.join(", ")})` : ""}`)
}
for (const spec of selected) {
    await vendorPlugin(spec)
}
