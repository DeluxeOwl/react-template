# ts-plain — parity verdicts

**15 rules: 2 migrate-native, 13 migrate-port, 0 keep-eslint, 0 blocked.**
These are investigation verdicts. The orchestrator applies the presets and the directive changes.

Every rule has a non-vacuous diagnostic pass against the pinned ESLint oracle.
All seven autofixable rules have at least one changed file and byte-identical fixes.
The final runs use the trimmed, 13-rule artifact in `packages/lint/vendor/typescript-eslint/`.

## Final per-rule evidence

The diagnostic counts come from ESLint **with type information** versus oxlint 1.86.0.
Ports also match messages. Native messages are outside the agreed parity bar.
The case column lists submitted active cases, then Oxc rejections.
The harness counts rejected cases as submitted but excludes them from comparisons.

| Rule (`@typescript-eslint/`)      | Verdict | Diagnostics | Changed files, identical | Cases / Oxc rejected | Max fix passes |
| --------------------------------- | ------- | ----------: | -----------------------: | -------------------: | -------------: |
| `array-type`                      | port    |     36 = 36 |                    34/34 |               63 / 0 |              2 |
| `ban-ts-comment`                  | port    |     40 = 40 |                      0/0 |               93 / 0 |              0 |
| `consistent-generic-constructors` | port    |     20 = 20 |                    20/20 |               64 / 0 |              1 |
| `consistent-indexed-object-style` | port    |     47 = 47 |                    42/42 |              102 / 5 |              1 |
| `consistent-type-definitions`     | port    |     12 = 12 |                    12/12 |               32 / 1 |              1 |
| `explicit-function-return-type`   | port    |     29 = 29 |                      0/0 |              118 / 5 |              0 |
| `no-inferrable-types`             | port    |     53 = 53 |                    45/45 |               97 / 2 |              1 |
| `no-unnecessary-type-constraint`  | port    |     20 = 20 |                      0/0 |               31 / 0 |              0 |
| `no-unsafe-function-type`         | native  |       8 = 8 |                      0/0 |                9 / 0 |              0 |
| `prefer-function-type`            | port    |     18 = 18 |                    15/15 |               23 / 0 |              1 |
| `unified-signatures`              | native  |     64 = 64 |                      0/0 |               87 / 3 |              0 |
| `no-array-constructor`            | port    |   118 = 118 |                  116/116 |              150 / 2 |              1 |
| `no-magic-numbers`                | port    |   109 = 109 |                      0/0 |              156 / 0 |              0 |
| `no-restricted-imports`           | port    |     18 = 18 |                      0/0 |              165 / 2 |              0 |
| `naming-convention`               | port    | 4543 = 4543 |                      0/0 |           9278 / 287 |              0 |

The normal runs include 73 real files and 145 mangled variants, except for file-class exemptions.
Handler exemptions reduce `explicit-function-return-type` to 70 real files and 139 variants.
Test exemptions reduce `no-magic-numbers` to 59 real files and 118 variants.
The typed runs omit mangled variants. Naming-convention has a separate typed mangled proof at original paths: 73 + 72 files, no exclusions.
The mangled files are clean. The case diagnostics establish non-vacuity.

Evidence files:

- `results/ts-plain.json`: exact oxlint values, overrides, directives, source audits, attempts, and report paths.
- `results/ts-plain.<rule>.normal.json` and `.typed.json`: final snapshots, with matching logs.
- `results/ts-plain.attempts.json`: preserved native, upstream, and initial-port attempts.
- `results/ts-plain.mangled.{ts,json}`: original-path typed proof for naming-convention.
- `results/ts-plain.run.ts`: reproducible final-run collector.

All paths in this section are relative to `scratch/oxlint-migration/`.

## Together proof

All seven autofixable ports run together. Each seed includes the real corpus, mangled variants, and the union of their cases.
Every run has zero missing diagnostics, extra diagnostics, message differences, or runtime errors.

| Seed | Real | Mangled | Cases | Diagnostics | Changed files, identical | Max fix passes |
| ---- | ---: | ------: | ----: | ----------: | -----------------------: | -------------: |
| 1    |   73 |     145 |   531 |   331 = 331 |                  299/299 |              2 |
| 2    |   73 |     142 |   531 |   331 = 331 |                  299/299 |              2 |
| 3    |   73 |     143 |   531 |   331 = 331 |                  299/299 |              2 |

Reports: `results/ts-plain.together.seed{1,2,3}.json` and corresponding logs.
Earlier 12-port together runs also matched on seeds 1–3: 689/690/689 diagnostics and 309/309 identical changed files.
Those runs failed only at report creation with `ENAMETOOLONG`.
The orchestrator fixed long report names, and final together reports now save normally.

## Why native candidates failed

The complete counters for each attempt are in `ts-plain.attempts.json`.
The initial default configs already match the oracle, so no option mapping fixes these differences.

- **array-type:** Native misses Readonly<T[]> conversions, rewrites shadowed Array/ReadonlyArray identifiers, and converts bare Array to any[]. Cases upstream-0038,0039,0040,0041,0042,0060,0061. No option changes native symbol handling or adds the missing Readonly path.
- **ban-ts-comment:** Native starts spans after the comment delimiter. It automatically fixes @ts-ignore instead of leaving the upstream suggestion unapplied. It counts Unicode descriptions differently and reports @ts-nocheck after executable code. Cases upstream-0007,0023,0031,0033,0072. The repo has no config that reconciles these algorithms.
- **consistent-generic-constructors:** All 20 native diagnostics target a different declaration span: upstream targets the declared identifier, native highlights a different declaration portion. Fixes match 20/20 but spans fail. No span option exists.
- **consistent-indexed-object-style:** Native highlights index signatures rather than the enclosing object/interface (33 unmatched per side). It converts -readonly mapped types to Readonly<Record<...>>. It also converts an exported interface where upstream leaves only a suggestion. Cases upstream-0057,0058,0092. No native option controls these range/fix differences.
- **consistent-type-definitions:** Native highlights the type keyword instead of the alias identifier and loses a comment in upstream-0014. The interface config is already identical on both engines.
- **explicit-function-return-type:** Generic function heads have different end ranges: upstream-0110 function log<A>(a: A) yields [1,16) in ESLint vs [1,13) native. No range option exists.
- **no-inferrable-types:** Native highlights a different annotation span in all 53 cases and exposes fixes as suggestions, so ordinary --fix leaves 45 upstream-fixed files unchanged. No fix-config mapping is available.
- **no-unnecessary-type-constraint:** Native targets only the constrained identifier instead of the complete type parameter. All 20 spans fail. Upstream suggestions remain unapplied by --fix on both engines.
- **prefer-function-type:** Native reports additional callable interfaces (including an interface with Function heritage). It converts polymorphic this types that upstream deliberately leaves alone. It also loses or changes comments. Cases upstream-0007,0011,0019,0020.
- **no-array-constructor:** Native misses optional and parenthesized/shadowed Array calls. It reports single spread arguments that the TS extension permits. Its fix bytes differ in 79 files (leading semicolons or lost argument comments). Cases upstream-0027,0043,0044,0049,0051,0053,0110,0111,0138. No native option repairs these TS-extension differences.
- **no-magic-numbers:** Native omits BigInt values and uses a different unary-plus span. Expanded corpus: 109 ESLint vs 91 native reports, 25 missing and seven extra. Cases upstream-0038,0039 illustrate the algorithms. Both engines receive the configured numeric exemptions and TS ignore flags.
- **no-restricted-imports:** Native additionally flags import("bun") and misses import " bun " because the TS extension trims source strings. Expanded native run has 18 reports each but one unmatched per side. The port preserves the exact custom Bun message.
- **naming-convention:** No native candidate. Unmodified upstream crashes on the unconditional getParserServices(context,true) compiler-options lookup. If no option has types, the patch skips that lookup. Type validation itself is unreachable under the repo config. The requiresQuoting helper uses the same identifier table for ES2022 and ESNext. The final ESLint-with-types proof matches.

The two native verdicts have no behavior differences in the final corpus.
`no-unsafe-function-type` includes a regression for locally shadowed `Function` names in type references, heritage, and implementations.
`unified-signatures` covers functions, methods, constructors, call signatures, generic parameters, and optional/rest parameters.

## Naming-convention and optional type information

Source audit: `@typescript-eslint/eslint-plugin@8.59.1/dist/rules/naming-convention.js:62` reads compiler options through parser services.
The checker path in `naming-convention-utils/validator.js:307–334` only runs after the guard at lines 301–305.
None of the four repository selectors has `types` or type-sensitive modifiers.
If no config entry has `types`, the port skips the unconditional compiler-options lookup.
It does not emulate a TypeScript checker.

Compiler options only affect the `requiresQuotes` flag (`naming-convention.js:65,402`).
`@typescript-eslint/type-utils/dist/requiresQuoting.js:40–55` calls TypeScript identifier helpers.
TypeScript 6.0.3 uses the same Unicode identifier table for every target from ES2015 onward (`typescript.js:11632–11636`).
The oracle targets ESNext in `tsconfig.base.json:3` and ES2022 in `apps/web/tsconfig.app.json:4`.
The patch therefore preserves the repository behavior.
**Adding type selectors requires a new verdict. The syntax-only port cannot support them.**

Final typed proof: 4543 matching diagnostics across 73 real files and 9278 cases.
Oxc rejects 287 invalid snippets. No ESLint crash or type-service exclusion remains.
The earlier unsplit corpus had 11,453 Oxc rejections because concatenated test arrays redeclared identifiers.
The harvest now splits each code-array element and removes option-only comments before deduplication.
It collects 9,277 unique upstream snippets. The repository selector regression adds one fixture.

A direct grep of the other 14 rule modules finds no checker access.
`collectUnusedVariables.js` uses an ESTree `Program` parameter, not a TypeScript program.
The final type-aware runs cover every proposed migration, not only naming-convention.

## Vendored artifact

- Spec: `scratch/oxlint-migration/vendor/specs/typescript-eslint.ts`.
- Generated files: `packages/lint/vendor/typescript-eslint/{index.js,index.d.ts,plugin.mjs,README.md,LICENSE}`.
- Registered alias: `typescript-eslint-js` (oxlint reserves `@typescript-eslint`).
- The entry exposes only the 13 proposed ports. Native and type-dependent rules are excluded.
- The ESM bundle contains copied rule code and helper code, including the two required ESLint core implementations.
- It has no runtime import of ESLint, an ESLint plugin, or a TypeScript parser.
- Runtime packages: `@eslint-community/eslint-utils`, `@typescript-eslint/types`, `eslint-visitor-keys`, `typescript`.
- Each bundled package keeps its complete license inside `plugin.mjs`. The upstream rules use MIT.
- Acorn's AMD `exports` is a pseudo-dependency, not a package. A value-preserving expression prevents a false dependency in the scanner.
- SHA-256: `90dcab283a0e4f8f3878343d0890ba2ba5fa9e2e42d335372540390464e7db0f`.

Generation command:

`devbox run -- bun scratch/oxlint-migration/vendor/vendor.ts @typescript-eslint`

The proposed presets must disable each replaced native candidate to avoid double reports.
The no-magic-numbers test exemption and explicit-return handler exemption must follow the ports.
`ts-plain.json` records their exact glob patterns.

## ESLint config locations (D-014)

The fixed oracle references use `scratch/oxlint-migration/oracle/packages/lint/src/index.ts`.
Working references use `packages/lint/src/index.ts` at the time of investigation. Parallel edits can move these lines.
Inherited rules leave ESLint through `migratedToOxlint()`, not by editing the upstream preset.

| Rule                              | Oracle lines                                                                        | Working lines at investigation                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `array-type`                      | 174                                                                                 | 82                                                                                              |
| `ban-ts-comment`                  | recommendedTypeChecked extends at 56 (upstream flat/recommended-type-checked.js:25) | recommendedTypeChecked preset (remove through migratedToOxlint, do not edit third-party config) |
| `consistent-generic-constructors` | 175                                                                                 | 83                                                                                              |
| `consistent-indexed-object-style` | 176                                                                                 | 84                                                                                              |
| `consistent-type-definitions`     | 177                                                                                 | 85                                                                                              |
| `explicit-function-return-type`   | 180-185, handler override 537-539                                                   | 87-92, handler override 334-336                                                                 |
| `no-inferrable-types`             | 237                                                                                 | 144                                                                                             |
| `no-unnecessary-type-constraint`  | recommendedTypeChecked extends at 56 (upstream flat/recommended-type-checked.js:47) | recommendedTypeChecked preset (remove through migratedToOxlint, do not edit third-party config) |
| `no-unsafe-function-type`         | recommendedTypeChecked extends at 56 (upstream flat/recommended-type-checked.js:53) | recommendedTypeChecked preset (remove through migratedToOxlint, do not edit third-party config) |
| `prefer-function-type`            | 270                                                                                 | 177                                                                                             |
| `unified-signatures`              | 274                                                                                 | 181                                                                                             |
| `no-array-constructor`            | recommendedTypeChecked extends at 56 (upstream flat/recommended-type-checked.js:27) | recommendedTypeChecked preset (remove through migratedToOxlint, do not edit third-party config) |
| `no-magic-numbers`                | 238-246, test override 529-531                                                      | 145-153, test override 326-328                                                                  |
| `no-restricted-imports`           | 249-259                                                                             | 156-166                                                                                         |
| `naming-convention`               | 198-232                                                                             | 105-139                                                                                         |

The four inherited rules come from `tseslint.configs.recommendedTypeChecked`.
The upstream references name `@typescript-eslint/eslint-plugin/dist/configs/flat/recommended-type-checked.js`.

## Existing directives to change (D-007, D-015)

The harness automatically renames these directives in its oxlint copies. The repository still needs the actual edits.

| Current path:line                                                  | New directive rule                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `apps/server/todos/adapter-repo-sqlite.ts:1`                       | `oxlint-disable typescript-eslint-js/explicit-function-return-type`           |
| `packages/core/todos/app.ts:10`                                    | `oxlint-disable-next-line typescript-eslint-js/explicit-function-return-type` |
| `packages/kernel/id-utils/index.ts:54,62`                          | `oxlint-disable-next-line typescript-eslint-js/no-magic-numbers`              |
| `packages/lint/src/custom/no-provider-with-static-children.ts:214` | `oxlint-disable-next-line typescript-eslint-js/naming-convention`             |
| `packages/lint/src/custom/require-jsx-return-type.ts:195`          | `oxlint-disable-next-line typescript-eslint-js/naming-convention`             |

## Harness requests and limits

1. **Resolved: long together report names.** Final reports use the shared hash-based naming fix.
2. **Open: type-aware mangled files.** `harness/parity.ts:136` skips variants in typed mode.
   The supplemental runner uses one sandbox per variant at original paths.
   Synthetic fixture paths excluded 74 files through projectService and produced two unknown-rule directive errors.
   Those 145 frozen fixtures were removed. The original-path proof replaces them without exclusions.
3. **Open: PASS with ESLint-side problems.** `harness/parity.ts:261` does not include `eslintProblems` in its PASS condition.
   The rejected synthetic-path probe printed PASS with two ESLint problems. It is not parity evidence.
   The final collector rejects either engine's runtime problems, unparseable files, or ESLint crashes.
4. **Open: core RuleTester harvesting.** Core tests assign `RuleTester = require(...)`, whereas the shim exposes `{ RuleTester }`.
   Temporary adapted test copies repair the import without changing shared tooling.
5. **Coverage limit: Oxc parse rejections.** The reports list each rejected fixture.
   These include invalid modifiers, duplicate declarations, invalid signatures, and `with` statements.
   The verdicts do not claim parity on these invalid snippets.
6. **Integration still belongs to the orchestrator.** This batch did not edit presets, package versions, shared harness code, or repository directives.

## Proposed new facts

- **F-TSPLAIN-1 proposal:** Native `typescript/ban-ts-comment` fixes `@ts-ignore` under ordinary `--fix`, while upstream ESLint exposes only a suggestion.
  The native rule also uses comment-content spans instead of full-comment spans.
- **F-TSPLAIN-2 proposal:** Native `eslint/no-array-constructor` is not equivalent to the TS extension.
  It treats optional, parenthesized, shadowed, and single-spread Array calls differently, and its fixes can add semicolons or lose comments.
- **F-TSPLAIN-3 proposal:** Syntax-only naming-convention config can run as a JS port after its unconditional compiler-options lookup is guarded.
  This exception needs an ESLint-with-types proof and a config with no type selectors.
