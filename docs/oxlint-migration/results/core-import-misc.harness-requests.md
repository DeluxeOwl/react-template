# Remaining harness and vendoring requests

These requests block six final vendored ports, not their runtime compatibility.
The agent does not change shared tooling under the playbook.

## 1. Select unprefixed ESLint core rules

`vendor/vendor.ts:100–108` filters IDs with `id.startsWith(`${prefix}/`)`.
For the ESLint spec, `prefix` is empty.
The filter selects zero rules and `commonDir([])` fails at line 127.

Reproduction:

```sh
bun scratch/oxlint-migration/vendor/vendor.ts ''
```

Result: `TypeError: The "path" property must be of type string, got undefined`.

The closure also needs extensionless CommonJS resolution (`.js`, `.cjs`, `index.js`).
Rule files must stay CommonJS, while the generated entry must stay ESM.
The original `utils/ast-utils.js` resolves `../../../conf/globals` beyond `lib/`.
The closure must retain that file rather than depend on the installed ESLint package.

`vendor/specs/eslint.ts` includes the tested `no-var` module-scope adapter.
The patch targets `lib/rules/no-var.js` because the complete closure includes files under both `lib/` and `conf/`.
The closure root must therefore be the package root.
The adapter uses the generic `@typescript-eslint/scope-manager@8.59.1` helper.
It matches all 59 diagnostic spans/messages and all 22 fix outputs, with and without types.

## 2. Avoid overwriting a single plugin bundle

`vendor/vendor.ts:170–263` copies React Refresh's `index.js`, then overwrites it with the generated entry.
The entry imports itself and fails during initialization.

Reproduction:

```sh
bun scratch/oxlint-migration/vendor/vendor.ts react-refresh
bun scratch/oxlint-migration/harness/parity.ts react-refresh/only-export-components --impl port
```

Result: `ReferenceError: Cannot access 'default' before initialization`.
The normal report contains 103 configuration errors and zero oxlint findings.
The typed report contains 89 configuration errors and zero oxlint findings.
The upstream runtime check matches all 40 findings, both without types and with `--type-aware`.

Copy the bundle under another name and point the generated entry at that name.

## 3. Declare generic helper dependencies before production integration

The successful import-x and Unicorn port checks use an allowlisted resolver preload at `/tmp/core-import-misc-resolve.mjs`.
It resolves generic helpers from the oracle's dependency tree.
It does not import ESLint or an ESLint plugin into a port.
The vendored source has no runtime ESLint/plugin imports after the spec patches.

Required top-level helper sets:

- Import-x: `@typescript-eslint/parser`, `@typescript-eslint/types`, `eslint-import-resolver-typescript`, `eslint-import-context`, `stable-hash-x`, `unrs-resolver`, `semver`, `debug`, `is-glob`, `minimatch`.
- Unicorn: `clean-regexp`, `regexp-tree`, `@babel/helper-validator-identifier`, `@eslint-community/eslint-utils`, `jsesc`.
- Core `no-var` adapter: `@typescript-eslint/scope-manager`.

Parser and resolver packages are generic helpers, not ESLint plugins.
Their peer metadata still names ESLint.
If the package manager installs those peers, dependency cleanup needs an explicit peer policy.
No agent installation or node_modules edit occurred.

The orchestrator repaired the import scanner and the post-patch dependency scan during this investigation.
Fresh vendor output now lists the parser/resolver helpers and removes the false ESLint dependency.
The Unicorn scan also lists `pluralize` in a copied but unimported helper.
The selected plugin entry does not load that helper.

## 4. Harvesting and corpus limitations

The upstream harvester required a temporary shim for core CommonJS suites, import-x test helpers, and Unicorn's tester API.
The cases reside under the supported workspace directory layout.
The repaired `// parity-path:` marker therefore does not change their paths.

The standard `--type-aware` builder skips mangled files.
The batch separately checks typed mangled imports in sandbox copies, one variant per path.
Repeated standard import runs with seeds 2 and 3 check determinism, not additional variants.

Remote JS fixtures cannot be direct lint targets in web's TypeScript project (`allowJs` is false).
They remain on disk for both remote import analyzers.
All individual import checks exclude 13 such files, except `no-dynamic-require`, which has no fixtures.
The together import check excludes 104 fixture targets and 11 OXC-rejected cases.
The full typed batch probe excludes 104 fixture targets and 14 OXC-rejected cases.
