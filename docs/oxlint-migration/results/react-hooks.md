# react-hooks migration evidence

## Verdict

- **14 migrate-port**, **0 migrate-native**, **0 keep-eslint**, **2 blocked**.
- All 14 native candidates fail the expanded corpus. The six early passes are superseded.
- `config` and `gating` remain blocked by vacuous default-option evidence, not runtime incompatibility.
- The orchestrator owns preset edits, dependency declarations, and commits. None were performed here.

## Per-rule results

Counts are ESLint / oxlint. Every typed port run has exact spans and messages and unchanged `--fix` bytes.

| Rule                                      | Verdict      | Cases | Native diagnostics | Typed port diagnostics |
| ----------------------------------------- | ------------ | ----: | -----------------: | ---------------------: |
| `react-hooks/config`                      | blocked      |    41 |               none |                  0 / 0 |
| `react-hooks/error-boundaries`            | migrate-port |    26 |            13 / 18 |                13 / 13 |
| `react-hooks/gating`                      | blocked      |    30 |               none |                  0 / 0 |
| `react-hooks/globals`                     | migrate-port |    48 |             8 / 13 |                  8 / 8 |
| `react-hooks/immutability`                | migrate-port |   107 |            80 / 87 |                80 / 80 |
| `react-hooks/incompatible-library`        | migrate-port |    21 |             8 / 13 |                  8 / 8 |
| `react-hooks/preserve-manual-memoization` | migrate-port |   110 |            14 / 14 |                14 / 14 |
| `react-hooks/purity`                      | migrate-port |    23 |            16 / 22 |                16 / 16 |
| `react-hooks/refs`                        | migrate-port |    79 |            47 / 46 |                47 / 47 |
| `react-hooks/rules-of-hooks`              | migrate-port |   115 |            102 / 0 |              102 / 102 |
| `react-hooks/set-state-in-effect`         | migrate-port |    67 |            45 / 50 |                45 / 45 |
| `react-hooks/set-state-in-render`         | migrate-port |    31 |            19 / 24 |                19 / 19 |
| `react-hooks/static-components`           | migrate-port |    22 |            11 / 16 |                11 / 11 |
| `react-hooks/todo`                        | migrate-port |   101 |            32 / 30 |                32 / 32 |
| `react-hooks/unsupported-syntax`          | migrate-port |    25 |              4 / 9 |                  4 / 4 |
| `react-hooks/use-memo`                    | migrate-port |    44 |             9 / 14 |                  9 / 9 |

## Proof and provenance

- Upstream tag: `eslint-plugin-react-hooks@7.1.1`, commit `d1727fbf987392749b374f3afe62227d2c70fc41`.
- Clone: `scratch/oxlint-migration/upstream/react/`. MIT attribution remains in `packages/lint/vendor/react-hooks/`.
- Harvester shims produced 115 hook cases and 11 compiler cases. A scan added relevant cases from 1,670 parseable compiler fixtures.
- Additional coverage: 106 hand cases and 130 component-discovery/suppression cases. Typed together corpus: 890 cases and 7 real files.
- Typed single-rule proof: `harness/reports/batch-react-hooks-port-type-aware.json`. Fourteen non-vacuous exact passes.
- Compiler-only typed together proof: `scratch/oxlint-migration/harness/reports/together-react-hooks__error-boundaries+14-f19cb93a.json`. PASS, 382 findings, 775 cases, 7 real files.
- Full typed together: `/tmp/react-hooks-together.port-type-aware.log`. 547 findings on each side, no missing/extra findings, two directive-code-frame mismatches.
- Real+mangled seeds 1–3: `/tmp/react-hooks-real-mangled.port-seed{1,2,3}.log`. Exact unchanged output, respectively 14, 14, and 13 mangled files.
- Supplemental full proof: `results/react-hooks.normalized-port.seed3.json`. 547 matching findings and no differences after narrow filename/directive-code-frame normalization. This is not a canonical harness PASS.
- Grep of upstream rule source finds no `parserServices`, `getParserServices`, `getTypeChecker`, or `esTreeNodeToTSNodeMap`. The variable `program` in `ReactCompiler.ts:95` is a compiler result, not a TypeScript program.

## Causes of native failures

- `rules-of-hooks`: Native JSON uses react-hooks namespace, then alias probe exposes 69/69 mismatched spans (whole call instead of callee).
- `error-boundaries`: Native highlights JSX opening tags instead of complete JSX expressions, plus discovery/suppression false positives.
- `globals`: Five native-only diagnostics: memo/forwardRef-only files, lowercase use-memo opt-in, and both Flow suppression comments.
- `incompatible-library`: Five native-only diagnostics from component-discovery and Flow-suppression differences.
- `set-state-in-effect`: Five native-only diagnostics from component-discovery and Flow-suppression differences.
- `set-state-in-render`: Five native-only diagnostics from component-discovery and Flow-suppression differences.
- `static-components`: Five native-only diagnostics from component-discovery and Flow-suppression differences.
- `unsupported-syntax`: Five native-only diagnostics from component-discovery and Flow-suppression differences.
- `immutability`: Native anchors escaping mutable functions at mutation sites instead of escaping functions, plus discovery/suppression differences.
- `preserve-manual-memoization`: Native anchors at hook callees/dependency arrays instead of full callbacks: 11/11 unmatched spans.
- `purity`: Native also diagnoses new Date(), which upstream does not, plus five discovery/suppression false positives.
- `refs`: Native differs in write/read spans and transitive ref analysis, plus discovery/suppression false positives.
- `todo`: Native misses unsupported initializers, tagged interpolated templates, empty loop tests, and context destructuring; also differs for try/finally, getter/setter spans, local fbt require, discovery and suppression.
- `use-memo`: Native shortens async/generator callback spans to keywords/signatures, plus discovery/suppression false positives.

The shared discovery difference comes from upstream `RunReactCompiler.ts:20-124` and `:318-345`.
The ESLint plugin skips files without top-level direct PascalCase/hook function declarations. It does not discover memo/forwardRef call initializers.
Oxlint analyzes these files and lowercase functions with a `use memo` directive. Its shared runner lacks the upstream file prefilter.
The upstream reporter also honors both Flow comment suppressions on the preceding line (`ReactCompiler.ts:94-137`), including TypeScript files.
Concrete five-case evidence: `/tmp/react-hooks-globals.heuristics-native.log`; cases live under `harness/cases/react-hooks__globals/apps/web/__parity__/heuristic-*.tsx`.
Other span evidence: `/tmp/react-hooks-{error-boundaries,preserve-manual-memoization,refs,use-memo,immutability}.native-detailed.log` (immutability expanded log has detail).

## Harness requests and uncertainties

1. Normalize only known physical filename-coordinate lines. Normal mode gives ESLint and oxlint different absolute filenames inside compiler messages. Typed sandbox mode avoids this artifact.
2. Map native `react/rules-of-hooks` to JSON `react-hooks(rules-of-hooks)`. The alias probe shows the real 69/69 span mismatch.
3. Add an ESLint rule-option override for supplemental `config` and `gating` probes. Default-option runs are vacuous. Positive probes are in `results/react-hooks.option-probes.json`.
4. Normalize only renamed rule identifiers inside source-code-frame comment lines. In a full together run the harness rewrites `react-hooks/rules-of-hooks` to `react-hooks-js/rules-of-hooks`; two refs messages therefore differ despite identical behavior.
5. Treat suggestion fixes separately from automatic fixes. All 15 compiler rules declare `fixable: code`, but `ReactCompiler.ts:110-162` supplies only `suggest`, never `fix`. No changed-file example exists for `--fix`.

`config` positive probe: invalid `environment.moduleTypeProvider` reports one exact finding. Invalid target/environment values instead crash both implementations.
`gating` positive probes: invalid identifier and duplicate directives report two exact findings when `dynamicGating.source` is configured.
Default `dynamicGating` is null (`Entrypoint/Options.ts:312`); `Program.ts:97-129` explains why default gating evidence is vacuous.

## Port and packaging

- Spec: `scratch/oxlint-migration/vendor/specs/react-hooks.ts`; generated entry: `packages/lint/vendor/react-hooks/index.js`.
- Two patches change only the outer CommonJS wrapper to ESM and remove the development-only loading guard. Compiler analysis remains upstream.
- Alias: `react-hooks-js`. No tracked ESLint disable directive names a batch rule. `exhaustive-deps` remains outside this batch.
- Required generic runtime helpers: `@babel/core@7.29.0`, `@babel/parser@7.29.0`, `hermes-parser@0.25.1`, `zod@4.4.3`, `zod-validation-error@4.0.2`.
- Reproducible proof environment: `NODE_PATH=$(node scratch/oxlint-migration/results/react-hooks.runtime-env.mjs)`.
- The orchestrator must declare these helpers before normal/published usage. Without them the port fails to load `@babel/core`.
- Preserve warning severity for `incompatible-library` and `unsupported-syntax`. Other rules use error severity. Preserve vendored-file exclusions for `set-state-in-effect` and `todo`.

## Runtime cost

`results/react-hooks.cost.json` contains one warmup and five timed no-fix runs on `apps/web`, with nested configs disabled.
Median: empty 0.370 s, native 0.193 s, full port 4.326 s, hook-only port 2.969 s.
The shared machine introduces large variance. These are individual process costs, not a full-gate speedup claim.

## Proposed facts

- **F-new: React Compiler natives are not equivalent to react-hooks 7.1.1.** Rust compiler ports differ in discovery, Flow comment suppression, analysis, and diagnostic spans. All 14 candidates fail this corpus.
- **F-new: Babel compiler rules run inside oxlint JS plugins.** The unchanged upstream compiler port reproduces all 547 findings. Generic runtime helpers are required.
- **F-new: Embedded source filenames and renamed disable comments create message-only harness differences.** Typed shared sandboxes avoid filename differences; code-frame comment normalization must remain narrow.
