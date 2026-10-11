# Tailwind batch — verdicts and evidence

## Verdicts

**0 migrate-native, 0 migrate-port, 1 keep-eslint, 8 blocked.** The eight blocked rules are compatible candidates, not completed migrations.

All rule names in this document use the `better-tailwindcss/` prefix. Installed source: `eslint-plugin-better-tailwindcss@4.5.0` (MIT).
Upstream tag: `v4.5.0`, commit `cc05c4eeee710ea20a7ac2f45af653d4635ac902`, under `scratch/oxlint-migration/upstream/better-tailwindcss`.

The table records independent, cwd-corrected upstream evidence. These supplemental runs use the shared harness primitives but do not count as official migration proof.

| Rule                               | Verdict     | Diagnostics | Fixed files identical | Max passes | Corpus                        |
| ---------------------------------- | ----------- | ----------: | --------------------: | ---------: | ----------------------------- |
| `enforce-canonical-classes`        | keep-eslint |   297 = 297 |                 99/99 |          1 | real 7, mangled 40, cases 110 |
| `enforce-consistent-class-order`   | blocked     |   105 = 105 |                 90/90 |          1 | real 7, mangled 40, cases 114 |
| `enforce-consistent-line-wrapping` | blocked     |     99 = 99 |                 79/79 |          2 | real 7, mangled 40, cases 128 |
| `no-conflicting-classes`           | blocked     |   229 = 229 |                   0/0 |          0 | real 7, mangled 40, cases 119 |
| `no-deprecated-classes`            | blocked     | 1436 = 1436 |               256/256 |          1 | real 7, mangled 40, cases 343 |
| `no-duplicate-classes`             | blocked     |   157 = 157 |                 90/90 |          1 | real 7, mangled 40, cases 101 |
| `no-restricted-classes`            | blocked     | 1319 = 1319 |                 78/78 |          1 | real 7, mangled 40, cases 367 |
| `no-unknown-classes`               | blocked     |   111 = 111 |                   0/0 |          0 | real 7, mangled 40, cases 127 |
| `no-unnecessary-whitespace`        | blocked     |   289 = 289 |                 93/93 |          1 | real 7, mangled 40, cases 123 |

`no-conflicting-classes` and `no-unknown-classes` have no actual fixer. Their `meta.fixable` value is misleading.
The rules never return a `fix` field from their `lintClasses` callbacks (`oracle/.../lib/rules/no-conflicting-classes.js:24–67`, `no-unknown-classes.js:57–84`).
Their diagnostic evidence is non-vacuous. The other seven rules also change files.

## Loader and runtime findings

The plugin resolves `tailwindcss/package.json` from `context.cwd` (`oracle/packages/lint/node_modules/eslint-plugin-better-tailwindcss/lib/utils/rule.js:91–100`).
It merges the shared settings with rule options before resolution (`lib/utils/rule.js:39–46`).
The `entryPoint` is relative to that cwd (`lib/utils/context.js:39–59`). The web configuration supplies `entryPoint: "index.css"` (`oracle/apps/web/eslint.config.ts:19–20`).

It calls `synckit.createSyncFn` with a dynamically selected worker path (`lib/tailwindcss/canonical-classes.js:5–13`).
The worker loads Tailwind's `__unstable__loadDesignSystem`, Jiti modules, CSS imports, and tsconfig aliases (`lib/tailwindcss/context.async.v4.js:8–47`).
This works inside oxlint. The direct sandbox probe with only `settings["better-tailwindcss"].cwd = "apps/web"` restored all four oracle diagnostics.

The first clean upstream run passed vacuously (real 7, mangled 14, zero diagnostics/fixes). A targeted case exposed the cwd mismatch.
The official unknown-class probe reported 1/0 diagnostics. The sandbox nine-rule probe reported 4/0 diagnostics and 0/1 identical changed files.

A canonical-rule probe initially hit the synckit 30-second timeout under machine load. A rerun with `SYNCKIT_TIMEOUT=300000` passed.
No timeout was classified as a semantic failure.

## Fix interactions

| Supplemental run                                    |     Diagnostics | Changed files identical | Max passes | Verdict               |
| --------------------------------------------------- | --------------: | ----------------------: | ---------: | --------------------- |
| Upstream 9 rules, seed 1                            |   9,669 = 9,669 |             1,261/1,307 |          6 | FAIL: fix order       |
| Complete generated 9-rule port, seed 1              |   9,669 = 9,669 |             1,307/1,307 |          7 | PASS                  |
| Complete generated 9-rule port + @stylistic, seed 1 | 11,148 = 11,148 |             1,466/1,475 |          8 | FAIL: canonical state |
| Complete generated 9-rule port, seed 2              |   9,669 = 9,669 |             1,296/1,307 |          7 | FAIL: canonical state |
| Eight candidates + @stylistic, seed 1               |   9,324 = 9,324 |             1,365/1,365 |         10 | PASS                  |
| Eight candidates + @stylistic, seed 2               |   9,254 = 9,254 |             1,365/1,365 |         10 | PASS                  |
| Eight candidates + @stylistic, seed 3               |   9,387 = 9,387 |             1,366/1,366 |         10 | PASS                  |
| Typed sandbox, 9 rules + @stylistic                 | 10,337 = 10,337 |             1,435/1,435 |          8 | PASS                  |

The existing `deferReports` wrapper and oracle rule registration order remove all 46 upstream fix-order divergences.
Examples include canonical inset collapse versus RTL replacement, and class-order versus line-wrapping fixes.
No additional rule patch is necessary for the eight candidates.

The temporary complete port exists only under `/tmp`. `tailwind.shadow.ts` copies the generated directory, supplies missing workers, and links runtime helpers.
It does not modify the production vendor files. Its entry path and the 21 missing closure files are recorded in `tailwind.shadow.json`.

## Why canonical classes stay in ESLint

Tailwind 4.2.4 caches a mutable design system across files. The initial diagnostics match, but later fixed bytes depend on earlier candidate compilation.
For `const classes = "bg-[var(--background)] h-[20px] w-[20px]"`, the outputs differ:

```ts
// ESLint in the failing together run
const classes = "size-[20px] bg-(--background)"
// oxlint in the failing together run
const classes = "size-[20px] bg-background"
```

`tailwind.state-probe.mjs` reproduces this directly through the installed Tailwind engine, without either lint runtime:

- Fresh design: canonicalization emits `bg-(--background)`.
- Compile `bg-background` first with canonicalization, `getClassOrder`, or `candidatesToCss`: the same target emits `bg-background`.
- Parse `bg-background` with `parseCandidate` only: the target still emits `bg-(--background)`.

The shared design cache lives in `lib/async-utils/cache.js:3–29` and `lib/tailwindcss/context.async.v4.js:8`.
Unknown-class checking calls `candidatesToCss` (`lib/tailwindcss/unknown-classes.async.v4.js:1–4`).
Canonicalization first calls that checker (`lib/tailwindcss/canonical-classes.async.v4.js:13–17`).

The offending cases pass in isolation. They also passed in one full typed sandbox run. This is file-history sensitivity, not checker behavior.
oxlint visits files in parallel and starts a fresh JS process for each fix round. ESLint retains sequential candidate history in one process.
An option mapping cannot reproduce that history. A reset or preload patch changes the oracle's behavior, rather than preserves it.
The compatibility wrapper was tested and ruled out. Keeping canonical classes in ESLint isolates the blocker from the eight candidates.

## Type-information audit

The source grep found only `sourceCode.parserServices.defineTemplateBodyVisitor` (`lib/utils/rule.js:308,317`), which dispatches Vue template visitors.
No rule or helper calls `getParserServices`, `getTypeChecker`, `program`, or `esTreeNodeToTSNodeMap`.
The full typed sandbox run used the same options and matched all 9 rules plus 71 @stylistic rules.
The port does not require TypeScript checker services.

## Harness requests

1. **Preserve the web workspace cwd.** ESLint uses `oracle/apps/web` (`harness/lib/eslint-child.ts:84`). oxlint uses the group directory or sandbox root (`harness/lib/oxlint-runner.ts:162,181`).
   The oracle root has no Tailwind installation. Its web workspace does. Sandbox mode alone does not correct this.
   Run oxlint from the matching workspace, or forward an equivalent resolved Tailwind cwd without changing the rule options.
2. **Seed dynamic worker files in vendor.ts.** Add extra roots `lib/tailwindcss/tailwind.async.worker.v3.js` and `lib/tailwindcss/tailwind.async.worker.v4.js` to the static import closure.
   `vendor.ts:110–120,169–180` follows only static imports. Its generated port omits 21 worker/closure files.
   The `plugin` layout handles nested rule exports correctly. A future rule-files layout can unwrap each module's `.rule` to trim unused rules.
3. **Provide direct runtime dependencies.** Required installed versions: `@eslint/css-tree@4.0.3`, `@valibot/to-json-schema@1.6.0`, `enhanced-resolve@5.21.0`, `jiti@2.6.1`, `synckit@0.11.12`, `tailwind-csstree@0.3.1`, `tsconfig-paths-webpack-plugin@4.2.0`, `valibot@1.3.1`.
   The generated port currently fails before linting with `Cannot find package 'valibot'`. These helpers are not ESLint plugins.
   The agent did not edit the manifest or install packages. Tailwind itself remains a consumer/workspace dependency (web 4.2.4).
4. **Harvest this plugin's format.** Support `lint(rule, {valid/invalid: [{jsx: code}]})`, `describe.runIf/skipIf`, `it.runIf`, and three-argument `it`.
   Every standard harvest attempt returned zero cases. A batch-local adapter extracted 263 unique parseable JSX cases with no callback warnings.
5. **Do not treat a cached-engine pass as stable canonical proof.** Shared-machine scheduling changes the cached candidate history.
   A matched file-order/state proof mode requires an explicit decision. No silent oracle reset was used.

## Reproduction and result files

```sh
# Cases: 263 upstream + 1,268 targeted + 1 loader probe
devbox run -- bun scratch/oxlint-migration/results/tailwind.harvest.ts
devbox run -- bun scratch/oxlint-migration/results/tailwind.cases.ts

# Supplemental independent proofs in separate processes
SYNCKIT_TIMEOUT=300000 devbox run -- bun scratch/oxlint-migration/results/tailwind.run.ts

# Temporary complete-port proof; not a production migration
devbox run -- bun scratch/oxlint-migration/results/tailwind.shadow.ts
SYNCKIT_TIMEOUT=300000 devbox run -- bun scratch/oxlint-migration/results/tailwind.parity.ts --impl shadow --together --stylistic --without-canonical --seed 2

# Direct engine-state probe
devbox run -- node scratch/oxlint-migration/results/tailwind.state-probe.mjs
```

- Verdict array: `scratch/oxlint-migration/results/tailwind.json`.
- Independent reports: `scratch/oxlint-migration/results/tailwind.<rule-name>.upstream.seed1.json`.
- Independent logs: `scratch/oxlint-migration/results/tailwind.<rule-name>.upstream.expanded.log`.
- Together reports: `tailwind.together*.{upstream,shadow}.seed*.json` in the same results directory.
- Case extraction counts: `tailwind.harvest.json`, `tailwind.cases.json`.
- Vendoring spec: `scratch/oxlint-migration/vendor/specs/better-tailwindcss.ts` (canonical excluded).
- Generated partial port: `packages/lint/vendor/better-tailwindcss/` (MIT license retained, 8 exposed rules, 74 files).

The plugin prefix is not reserved. No source `eslint-disable` directive names a Tailwind rule, so no directive rename is necessary.
No presets, shared harness files, dependency manifests, or git state were changed.

## Proposed new facts for the living document

- **F-XXX — Tailwind's synchronous worker loader runs inside oxlint.** better-tailwindcss 4.5.0 uses synckit and Tailwind 4.2.4's design-system loader. Preserve the consumer workspace cwd.
- **F-XXX — Dynamic workers are outside a static vendoring closure.** Seed both Tailwind worker entry files explicitly and retain their helper dependencies.
- **F-XXX — Tailwind 4.2.4 canonicalization is candidate-history-sensitive.** Earlier compilation of a semantic color utility changes later canonical output. Parallel file order and fresh fix processes can differ from ESLint's cached sequential history.
