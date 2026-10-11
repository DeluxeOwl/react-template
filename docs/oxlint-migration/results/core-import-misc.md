# core-import-misc — batch verdicts

**20 rules: 2 native migrations, 12 vendored migrations, 6 blocked, 0 proven non-portable.**

The six blocked rules pass runtime probes but cannot yet generate valid vendored entries.
They must remain in ESLint until the shared-tool requests are complete.
The agent did not change presets, shared harness code, dependencies, or git state.

## Verdicts and final typed evidence

Counts show ESLint / oxlint diagnostics.
Fix counts show byte-identical outputs / changed files.
All rows have non-vacuous diagnostic evidence.

| Rule                                   | Verdict        | Diagnostics |   Fixes | Implementation                           |
| -------------------------------------- | -------------- | ----------: | ------: | ---------------------------------------- |
| `no-restricted-globals`                | blocked        |     10 / 10 |       — | Upstream runtime                         |
| `no-throw-literal`                     | blocked        |     23 / 23 |       — | Upstream runtime                         |
| `no-var`                               | blocked        |     59 / 59 | 22 / 22 | Upstream + module-scope probe            |
| `prefer-const`                         | blocked        |   101 / 101 | 36 / 36 | Upstream runtime                         |
| `prefer-rest-params`                   | migrate-native |       4 / 4 |       — | `eslint/prefer-rest-params`              |
| `prefer-spread`                        | migrate-native |     18 / 18 |       — | `eslint/prefer-spread`                   |
| `no-restricted-syntax`                 | blocked        |     19 / 19 |       — | Upstream runtime                         |
| `import-x/default`                     | migrate-port   |       6 / 6 |       — | `import-x-js/default`                    |
| `import-x/export`                      | migrate-port   |     26 / 26 |       — | `import-x-js/export`                     |
| `import-x/named`                       | migrate-port   |     28 / 28 |       — | `import-x-js/named`                      |
| `import-x/namespace`                   | migrate-port   |     22 / 22 |       — | `import-x-js/namespace`                  |
| `import-x/no-duplicates`               | migrate-port   |   118 / 118 | 36 / 36 | `import-x-js/no-duplicates`              |
| `import-x/no-dynamic-require`          | migrate-port   |     10 / 10 |       — | `import-x-js/no-dynamic-require`         |
| `import-x/no-named-as-default`         | migrate-port   |       5 / 5 |       — | `import-x-js/no-named-as-default`        |
| `import-x/no-named-as-default-member`  | migrate-port   |     10 / 10 |       — | `import-x-js/no-named-as-default-member` |
| `import-x/no-unresolved`               | migrate-port   |     34 / 34 |       — | `import-x-js/no-unresolved`              |
| `unicorn/import-style`                 | migrate-port   |     41 / 41 |       — | `unicorn-js/import-style`                |
| `unicorn/better-regex`                 | migrate-port   |     45 / 45 | 42 / 42 | `unicorn-js/better-regex`                |
| `unicorn/consistent-destructuring`     | migrate-port   |     28 / 28 |       — | `unicorn-js/consistent-destructuring`    |
| `react-refresh/only-export-components` | blocked        |     40 / 40 |       — | Upstream runtime                         |

`core-import-misc.json` contains exact preset values, commands, exclusions, attempts, directives, and report paths.
For blocked rows, `oxlint` is null and `proposedOxlint` records the intended value.

## Together checks

| Run                                               | Corpus                                | Matching diagnostics | Matching fixes | Maximum passes |
| ------------------------------------------------- | ------------------------------------- | -------------------: | -------------: | -------------: |
| Native core, normal                               | real 72 + mangled 143 + cases 44      |                   22 |              — |              0 |
| Unicorn, normal                                   | real 73 + mangled 145 + cases 321     |                  114 |        42 / 42 |              1 |
| Unicorn, typed, regenerated                       | real 73 + cases 321                   |                  114 |        42 / 42 |              1 |
| Import-x, typed, regenerated                      | real 73 + cases 643                   |                  560 |        36 / 36 |              1 |
| Core + Unicorn fix probes, normal seeds 1 / 2 / 3 | real 73 + mangled 142–145 + cases 264 |             217 each | 108 / 108 each |              2 |
| Full batch, typed probe                           | real 73 + cases 1,578                 |                1,241 |      201 / 201 |              2 |

The full probe combines actual import/Unicorn ports, native core rules, upstream core/React Refresh rules, and the `no-var` adapter.
It proves compatibility across implementations, not completion of the six blocked ports.

The standard typed harness skips mangled files.
Separate sandbox probes check imported-module rules on 73, 71, and 72 mangled files for seeds 1, 2, and 3.
They match zero diagnostics and change no files because the real import corpus is clean.
Their role is regression coverage, not the non-vacuous proof.

Earlier import together runs match 558 diagnostics.
One new real file adds two unresolved imports, so the final run matches 560.
The source tree changed from 72 to 73 tracked lint targets during parallel work.

Reports:

- `core-import-misc.import.together.final-typed.json`
- `core-import-misc.unicorn.together.final-typed.json`
- `core-import-misc.unicorn.together.normal.json`
- `core-import-misc.native-core.together.normal.json`
- `core-import-misc.core-unicorn-seed-{1,2,3}.normal-probe.json`
- `core-import-misc.import.typed-mangled.json`
- `core-import-misc.full-batch.typed-probe.json`

## Causes and adapters

### Core rules

- Native `no-restricted-globals` reports 7 findings against ESLint's 10. It misses `export { Bun }`, heritage references, and type exports. It adds a `typeof Bun` finding. Cases: `harness/cases/no-restricted-globals/apps/web/__parity__/repo-options-{011,012,013,015,016}.tsx:1`.
- Native `no-throw-literal` finds the same 17 initial violations but labels the argument instead of the entire statement. Example: `harness/cases/no-throw-literal/apps/web/__parity__/upstream-0028.tsx:1` (`throw null;`).
- Native `no-var` reports 57 findings against ESLint's 59 and matches only 5 of 47 fix outputs. It chooses `const` instead of `let` and changes declarations with earlier references. Example: `harness/cases/no-var/apps/web/__parity__/upstream-0049.tsx:1`.
- Native `prefer-const` matches the aggregate count but differs on 19 spans in each direction. It matches 36 of 39 fix outputs. Example: `harness/cases/prefer-const/apps/web/__parity__/upstream-0110.tsx:1` changes `let x = 'x', y = 'y'; x = 1` into a `const` reassignment.

The unpatched upstream `no-var` runtime matches all diagnostics but only 3 of 22 fixes.
Oxlint infers a file without imports/exports as a script, whereas the ESLint config treats that file as a module.
The upstream rule refuses fixes for global variables.
The initial hypothesis about `getEnclosingFunctionScope()` was incorrect.

The tested adapter re-analyzes the same AST with module scopes for the configured JS/TS file families.
It overrides only `sourceCode.getDeclaredVariables` and retains all upstream safety predicates.
Normal and typed probes match all 59 findings and all 22 fixes.
The patch is in `vendor/specs/eslint.ts:3–27` and uses `@typescript-eslint/scope-manager@8.59.1`.

`prefer-const` needs two passes for one file.
Its two ESLint-only harness problems come from upstream snippets with an undefined `custom/use-x` directive.
Those are `harness/cases/prefer-const/apps/web/__parity__/upstream-0101.tsx:1` and `upstream-0102.tsx:1`.
The target diagnostics and fixes still match, but the harness does not treat these unrelated ESLint errors as failures.

### Import-x

The native candidates fail across resolver semantics, export analysis, spans, and fixes.
Exact counts and attempts are in the JSON artifact.
Representative cases:

- `default`: native diagnoses ignored TS targets (`resolved-case-002.tsx:1`).
- `export`: native misses repeated exports and differs on default overloads (`upstream-0031.tsx:2–4`).
- `named`: native misses JS fixture exports (`upstream-0064.tsx:1`).
- `namespace`: native labels only the member on assignments, not the entire assignment (`resolved-case-001.tsx:1`).
- `no-duplicates`: native changes type-only import style and merge whitespace (`upstream-0070.tsx:1`, `upstream-0049.tsx:1–2`).
- `no-dynamic-require`: native labels `require` rather than the whole call (`upstream-0024.tsx:1`).
- `no-named-as-default`: native reports a collision without a default export (`resolved-case-004.tsx:1`).
- `no-named-as-default-member`: computed accesses and destructuring spans differ (`resolved-case-001.tsx:1`, `resolved-case-002.tsx:1`).

These paths are under `harness/cases/import-x__<rule>/apps/web/__parity__/`.

The port copies `eslint-plugin-import-x@4.16.2`'s CommonJS bundle and exposes only nine rules.
This avoids illegal generated `default` and `export` import bindings.
The patches in `vendor/specs/import-x.ts`:

1. Pin bundle metadata instead of resolving an absent `../package.json`.
2. Remove unused runtime ESLint `SourceCode` and `FileEnumerator` imports.
3. Bypass oxlint's parser-shaped stub for remote modules with the oracle's TypeScript parser.
4. Recreate `alwaysTryTypes: true`, `bun: true`, and `project: [workspace]` in the TypeScript resolver.

Oxlint's parser object exists, so a missing-parser fallback does not work.
Its `parse()` method throws `context.languageOptions.parser.parse not implemented yet`.
The unconditional remote-parser adapter resolves the six affected import-rule failures.
See `packages/lint/vendor/import-x/index.cjs:31–32`, `:624`, `:1151–1175`, and `:1520`.

The repo has no `import-x/extensions` or alternate parser map.
ExportMap therefore ignores `.ts` targets, which the port must preserve.
JS fixtures provide non-vacuous remote export evidence.

### Unicorn and React Refresh

Native `unicorn/import-style` reports 37 findings against ESLint's 41.
It misses const-propagated dynamic module names and adds a finding for a quoted destructuring key.
Cases: `harness/cases/unicorn__import-style/apps/web/__parity__/repo-options-014.tsx:1` and `repo-options-022.tsx:1`.

Unicorn 64 modules use `context.on()` instead of returning ESLint listeners.
The port applies the upstream `rule/to-eslint-create.js` adapter and avoids unused ESLint imports from the utility barrel.
The `@react-template/core` style and `sortCharacterClasses: true` remain unchanged.

Native React Refresh reports 38 findings against ESLint's 40.
Styled templates, unknown HOCs, anonymous exports, and enum spans differ.
Cases: `harness/cases/react-refresh__only-export-components/apps/web/__parity__/upstream-{0015,0048,0067,0070}.tsx:1`.
The upstream runtime matches all 40 findings, but the generated vendor entry overwrites its own source bundle.

## Config, types, directives, and exclusions

All five core/Unicorn/import rule families keep their exact effective config from the inventory.
In particular:

- `no-restricted-globals` keeps the Bun name and exact guidance message across web, base, test, and handler classes.
- `no-restricted-syntax` keeps all 14 selector/message objects and `warn` severity, including Promise helpers, constructors, private identifiers, throw/reject, directives, handlers, query hooks, JSX IIFEs, and `instanceof Error`.
- React Refresh stays web-only with `['error', {}]`. Its permissive options remain false or empty.

Every proposed migration received a final typed check.
The source audit finds no optional TypeScript checker path in these rules.
Unicorn's parser-service references are Vue template hooks, not type information.
See `core-import-misc.type-information-audit.md`.

No repo directive names an import-x or Unicorn rule from this batch.
An eventual core port must rename `no-restricted-syntax` directives to `eslint-js/no-restricted-syntax` at:

- `apps/server/todos/adapter-http.ts:2`
- `apps/web/app.tsx:51`
- `packages/kernel/ctx/index.ts:37`
- `scripts/subcommands/local-https.ts:194`
- `scripts/subcommands/local-https.ts:271`

The individual remote-import checks exclude 13 JS fixture targets because web's TypeScript project has `allowJs: false`.
The fixtures remain on disk for both remote analyzers.
The full typed probe excludes 104 such targets and 14 OXC-rejected cases.
The rejected cases are listed in each report, not counted as compatible.

## Remaining harness requests

Details and reproductions: `core-import-misc.harness-requests.md`.

1. Core vendoring must select unprefixed rule IDs and resolve extensionless CommonJS closure files.
2. Core CJS rule files need a CJS boundary while the generated entry remains ESM.
3. React Refresh's source bundle needs a non-colliding output name.
4. Production integration must declare generic parser/resolver/regex helpers. Successful proofs currently use an allowlisted resolver preload.

The orchestrator repaired import scanning and post-patch dependency metadata during the investigation.
Fresh import-x and Unicorn vendor output has MIT attribution and no runtime imports of ESLint or third-party ESLint plugins.

## Proposed facts for the living document

- **F-proposed — Source type changes scope-dependent fixes.** Oxlint infers import/export-free TSX as scripts. The ESLint config treats those files as modules. Upstream `no-var` then sees globals and refuses otherwise valid fixes. Re-analysis with module scopes restores 22/22 fixes.
- **F-proposed — The JS parser facade is not a remote parser.** Oxlint's `context.languageOptions.parser` exists, but `parse()` is unimplemented. Import-analyzer ports need a generic remote parser, not a fallback only for absent parser objects.
- **F-proposed — Type-aware harness runs need separate mangled coverage.** The standard sandbox builder skips mangled variants. The batch checked import variants in separate sandbox copies, one variant per original path.

## Artifacts and reproduction

Specs: `vendor/specs/{eslint,import-x,unicorn,react-refresh}.ts`.
Generated working ports: `packages/lint/vendor/{import-x,unicorn}/index.js`.
The React Refresh vendor directory is an intentionally recorded failed generation, not a working port.

```sh
NODE_OPTIONS='--import=/tmp/core-import-misc-resolve.mjs' bun scratch/oxlint-migration/harness/parity.ts --plugin import-x --impl port --type-aware
NODE_OPTIONS='--import=/tmp/core-import-misc-resolve.mjs' bun scratch/oxlint-migration/harness/parity.ts --plugin unicorn --impl port --type-aware
bun scratch/oxlint-migration/harness/parity.ts prefer-rest-params prefer-spread --impl native --type-aware
NODE_OPTIONS='--import=/tmp/core-import-misc-resolve.mjs' bun /tmp/core-import-misc-full-check.ts
```

Temporary probes and resolver source are copied to `core-import-misc.probes/` for reference.
The `/tmp` originals remain necessary for the recorded commands because the probe scripts contain their absolute paths.
