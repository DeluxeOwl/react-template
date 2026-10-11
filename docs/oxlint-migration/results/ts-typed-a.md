# ts-typed-a — verdicts and evidence

## Result

**1 migrate-native, 15 keep-eslint, 0 migrate-port, 0 blocked.**

Proposed native value:

```json
{
    "typescript/no-for-in-array": ["error"]
}
```

This rule requires type-aware mode. Presets, shared harness files, and git state remain unchanged by this batch.

Versions: oxlint **1.86.0**, tsgolint **7.0.2003** (`eb9339115edde6811ca94c3433adf69ea9852880`), typescript-eslint **8.59.1**, TypeScript **6.0.3**. The native engine uses typescript-go.

The final array is [`ts-typed-a.json`](ts-typed-a.json). Every retained rule has a concrete witness and a failed typed JS-upstream probe.

## Final numbers

All rule names have the `@typescript-eslint/` prefix. E/O means ESLint/oxlint. Missing/extra counts unmatched rule-and-span pairs, not distinct behavior differences. Native messages are not a migration criterion.

| Rule                                   | Verdict        | Real / cases | E/O diagnostics | Missing/extra | Identical changed files |
| -------------------------------------- | -------------- | -----------: | --------------: | ------------: | ----------------------: |
| await-thenable                         | keep-eslint    |     72 / 123 |           45/45 |         13/13 |                     0/0 |
| consistent-type-exports                | keep-eslint    |      72 / 56 |           25/25 |         25/25 |                   23/25 |
| no-array-delete                        | keep-eslint    |      72 / 32 |           24/23 |         24/23 |                     0/0 |
| no-base-to-string                      | keep-eslint    |     72 / 315 |           94/96 |           3/5 |                     0/0 |
| no-confusing-void-expression           | keep-eslint    |     72 / 111 |         113/115 |           0/2 |                    0/71 |
| no-deprecated                          | keep-eslint    |     72 / 261 |         130/137 |           0/7 |                     0/0 |
| no-duplicate-type-constituents         | keep-eslint    |      72 / 83 |           61/58 |          10/7 |                   45/50 |
| no-floating-promises                   | keep-eslint    |     72 / 164 |         147/147 |       147/147 |                     0/0 |
| no-for-in-array                        | migrate-native |      73 / 26 |           23/23 |           0/0 |                     0/0 |
| no-implied-eval                        | keep-eslint    |      72 / 71 |           79/79 |           1/1 |                     0/0 |
| no-misused-promises                    | keep-eslint    |     72 / 193 |         109/110 |         76/77 |                     0/0 |
| no-redundant-type-constituents         | keep-eslint    |     72 / 105 |           51/51 |           9/9 |                     0/0 |
| no-unnecessary-boolean-literal-compare | keep-eslint    |      72 / 51 |           25/25 |           0/0 |                   17/23 |
| no-unnecessary-condition               | keep-eslint    |     72 / 285 |         182/182 |         56/56 |                     0/0 |
| no-unnecessary-template-expression     | keep-eslint    |     72 / 177 |         150/150 |           5/5 |                 118/118 |
| no-unnecessary-type-conversion         | keep-eslint    |      72 / 69 |           38/34 |           5/1 |                     0/0 |

These are primary-span audit numbers. Case totals precede exclusion of parser-rejected snippets. Each `ts-typed-a.<rule>.primary.json` lists the exclusions, exact source, diagnostics, labels, and fixed bytes.

The candidate received a later final run after the real corpus increased from 72 to 73 files. No candidate case was excluded. Its shared-harness and supplemental runs both pass.

## Three-corpus proof for no-for-in-array

The final typed real/case run covers **73 real files and 26 cases**, with **23/23 diagnostics** and identical unchanged bytes. This is non-vacuous. The rule is not autofixable.

Four supplemental typed mangled runs add **288 files**:

| Seed / variant | Mangled files | E/O diagnostics | Result |
| -------------- | ------------: | --------------: | ------ |
| 1 / 0          |            73 |             0/0 | PASS   |
| 1 / 1          |            72 |             0/0 | PASS   |
| 2 / 0          |            71 |             0/0 | PASS   |
| 3 / 0          |            72 |             0/0 | PASS   |

All four runs have zero exclusions, zero runtime problems, and identical unchanged bytes. Clean mangled files do not supply non-vacuity. The 23 case diagnostics supply it.

The runner [`ts-typed-a.primary-parity.ts`](ts-typed-a.primary-parity.ts) uses the existing sandbox, ESLint runner, native runner, fixer loop, and comparison helpers. It changes only the primary-label selection and the materialization of mangled variants. Each variant occupies its original project path in a separate sandbox. The shared harness stays unchanged.

```sh
# Real files and all cases, typed on both sides
bun scratch/oxlint-migration/harness/parity.ts \
  @typescript-eslint/no-for-in-array --impl native --type-aware

# Supplemental real/case proof
bun scratch/oxlint-migration/results/ts-typed-a.primary-parity.ts \
  @typescript-eslint/no-for-in-array

# Repeat with seed/variant pairs 1/0, 1/1, 2/0, 3/0
bun scratch/oxlint-migration/results/ts-typed-a.primary-parity.ts \
  @typescript-eslint/no-for-in-array --mangled --seed 1 --variant 0
```

Run commands inside `devbox shell`, or prefix them with `devbox run --`.

Upstream `no-for-in-array` calls `getParserServices(context)` and `program.getTypeChecker()`. The source audit in `ts-typed-a.catalog.json` records type-service references for all 16 rules. Every parity verdict uses typed ESLint and native type-aware mode.

`directives-a.tsx` covers block disable/enable and disable-next-line. No tracked repository directive names the migrated candidate.

## Concrete differences

Case paths here are relative to `harness/cases/@typescript-eslint__<rule>/apps/web/__parity__/`. Go paths are relative to `upstream/ts-typed-a-tsgolint/internal/rules/`.

### Diagnostic targets

- **await-thenable:** `cause-a.tsx:2`, `await 0`. ESLint reports `[10,17)`, native `[10,15)`. Native uses the keyword range at `await_thenable/await_thenable.go:107-111`.
- **consistent-type-exports:** `cause-a.tsx:2`, `export {T}`. ESLint reports the declaration. Native reports only `export`. Mixed exports also differ in their primary targets.
- **no-array-delete:** `cause-a.tsx:3-4`. Native reports only the `delete` keyword for array indexing and misses deletion of an optional named property. `no_array_delete/no_array_delete.go:54-55` accepts only element access.
- **no-floating-promises:** `cause-a.tsx:2,4`. Native reports the promise call, not the enclosing expression statement. This omits the semicolon and the logical-expression prefix. Its builder uses `result.node` at `no_floating_promises/no_floating_promises.go:384-385`.
- **no-redundant-type-constituents:** `upstream-0072.tsx:1`, `type T = (0 | 1) | number`. Native includes parentheses in `[9,16)`. ESLint reports `[10,15)`.
- **no-unnecessary-condition:** `cause-a.tsx:3-4`. Native reports the comparison operator or callback body. ESLint reports the full comparison or returned literal. The operator selection is explicit at `no_unnecessary_condition/no_unnecessary_condition.go:1765-1769`.
- **no-unnecessary-template-expression:** `cause-a.tsx:2`. Whitespace inside one interpolation yields ESLint `[15,21)`, native `[11,21)`. Both fix to the same string literal. Native derives the start from `interpolation.Pos()-2` at `no_unnecessary_template_expression/no_unnecessary_template_expression.go:111-114`.

### Detection

- **no-base-to-string:** `cause-a.tsx:2-4`. Native flags an object with an explicit `[Symbol.toPrimitive]` method. ESLint explicitly suppresses that case (`dist/rules/no-base-to-string.js:253-256`). Native checks three named conversion methods instead. Parenthesized object spans also differ.
- **no-confusing-void-expression:** `cause-a.tsx:5`, `return (x, console.log(x), x)`. Native reports the middle void expression. ESLint ignores non-final sequence members (`dist/rules/no-confusing-void-expression.js:239-241`). Native comma handling at `no_confusing_void_expression/no_confusing_void_expression.go:91-96` does not match the flattened ESTree sequence.
- **no-deprecated:** `cause-a.tsx:7-8`. Native reports the deprecated property in a contextual object initializer and on later use. ESLint reports only the use. Native explicitly checks contextual initializer properties at `no_deprecated/no_deprecated.go:345-368,864-877`. Six real-file extras concern custom-rule `defaultOptions` initializers.
- **no-duplicate-type-constituents:** `cause-a.tsx:2`, two identical object constituents. ESLint reports and deletes the duplicate. Native leaves it. The recursive AST-equality check remains a TODO at `no_duplicate_type_constituents/no_duplicate_type_constituents.go:202-204`.
- **no-implied-eval:** `coverage-a.tsx:4,7`. ESLint and native reverse their reports around shadowed `setTimeout` and `window` parameters. ESLint checks scope by the extracted function name. Native checks the callee symbol's declarations (`no_implied_eval/no_implied_eval.go:116-121`). This is a reference-policy difference.
- **no-misused-promises:** `cause-a.tsx:2-3`. Native reports an async `Promise.finally` callback that ESLint excludes. It also highlights only the arrow token for `forEach`. `cause-b.tsx:3` demonstrates a missed async object method under a union property type. Native `promiseRange` deliberately selects an annotation, arrow token, or function head (`no_misused_promises/no_misused_promises.go:177-190`).
- **no-unnecessary-type-conversion:** `cause-a.tsx:11-12` contains valid augmented conversion signatures with ignored arguments. Native misses both redundant conversions because it restricts argument counts (`no_unnecessary_type_conversion/no_unnecessary_type_conversion.go:274,336`). `cause-b.tsx:3,5` adds a missed property `+= ""` and an extra constrained-generic unary-plus report. Native uses a constrained unary type, while ESLint uses the raw type.

These witnesses identify rule-algorithm differences. No verdict depends on an unproven TypeScript-Go checker regression.

### Fix bytes

- **consistent-type-exports:** `cause-a.tsx:2` shows added spaces and a semicolon. `cause-b.tsx:4` shows `B, A` instead of ESLint's `A, B`. Native rebuilds declarations at `consistent_type_exports/consistent_type_exports.go:147-156,270-318`. The repository uses the same default `fixMixedExportsWithInlineTypeSpecifier: false` on both sides.
- **no-confusing-void-expression:** `cause-a.tsx:2-4` shows extra spaces and doubled semicolons. Every one of 71 changed files differs. Native fix ranges differ at `no_confusing_void_expression/no_confusing_void_expression.go:208-215,238-265`.
- **no-duplicate-type-constituents:** the missed object duplicate remains unchanged. Nested-constituent removal also retains different whitespace in `cause-b.tsx:3-4`.
- **no-unnecessary-boolean-literal-compare:** `cause-a.tsx:3-5`. ESLint produces `if (b)`, `if (!b)`, `if (b)`. Native retains spaces and parentheses. It copies raw `Pos..End` source at `no_unnecessary_boolean_literal_compare/no_unnecessary_boolean_literal_compare.go:217`.

Native suggestions are not automatic fixes. Both tools leave the suggestions for await, array deletion, floating promises, and type conversion unapplied under plain `--fix`.

The native catalog is not conclusive evidence about fixes. It lists `consistent-type-exports` as `fix:none`, but the runtime applies fixes.

## Port attempts

All 15 retained rules received a JS-upstream probe with `--type-aware` on a concrete witness. Reports and logs use `ts-typed-a.<rule>.upstream.{json,log}`.

Each probe fails because oxlint JS plugins do not receive a compiler program or the required TypeScript parser services. The error states: `You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file.`

These are setup failures, not additional native diagnostic evidence. Vendoring cannot repair the missing type-service API. The playbook excludes type-aware JS ports, so this batch created no vendor specification.

## Required fixable together runs

The five automatic-fix rules ran together with seeds 1, 2, and 3:

- 73 real files and 478 cases.
- 377 ESLint diagnostics and 376 native diagnostics.
- 77 ESLint-only and 76 native-only spans in the shared first-label report.
- **199/283** changed files have identical bytes.
- At most three native passes. Twenty-three files need more than one pass.

Reports: `ts-typed-a.together.seed1.json`, `seed2.json`, `seed3.json`. These runs retain the shared first-label limitation. Their fix-byte differences are independent of that limitation.

Supplemental typed mangled together runs cover 73, 71, and 72 files for seeds 1, 2, and 3. All pass with zero diagnostics and unchanged identical bytes. Reports use `ts-typed-a.fixable-together.primary.mangled.seed<seed>.variant0.json`.

The targeted `interplay-a.tsx` also combines duplicate constituents, exports, void returns, template whitespace, and boolean comparisons. Both three-rule interaction runs diverge in fixed bytes. No evidence shows that fix-order instability causes the single-rule failures.

## Harness requests

1. **Select the primary label.** `harness/lib/oxlint-runner.ts:205` uses `labels[0]`. Tsgolint can place explanatory labels first and append the unlabelled primary label. The supplemental audit prefers the last unlabelled label. This reduces false failures but leaves all 15 retained rules divergent.
2. **Permit typed mangled variants.** `harness/parity.ts` omits them and `sandbox.ts` rejects `kind: "mangled"`. Separate variant sandboxes at original paths supply the missing candidate coverage without a shared edit.
3. **Preserve relative fixture imports in together mode.** `caseCorpus(ruleId, true)` adds a rule-key directory to each path. Relative imports can then resolve differently. The added export-fixture files support single-rule resolution, but together mode needs a general fixture-preservation solution.

The previous `ENAMETOOLONG` report failure is resolved by the orchestrator's hashed report filenames. Final seeds 1-3 saved successfully. It is not an outstanding blocker.

## Proposed facts for the living document

- **F-new — Primary tsgolint labels:** Explanatory labels can precede the unlabelled primary range. `labels[0]` is not a reliable diagnostic target.
- **F-new — Native typed targets:** Tsgolint can report keyword, operator, parenthesized-constituent, or promise-subexpression ranges where typescript-eslint reports a different AST range.
- **F-new — Structural duplicate types:** Native `no-duplicate-type-constituents` lacks recursive AST equality and can miss identical object constituents.
- **F-new — Conversion methods:** Native `no-base-to-string` does not honor explicit `[Symbol.toPrimitive]` declarations in the tested version.
- **F-new — Promise finally:** Native `no-misused-promises` reports callbacks that ESLint excludes for recognized `Promise.finally` calls.
- **F-new — Conversion detection:** Native conversion argument-count restrictions, identifier-only compound assignment, and constrained unary types differ from ESLint.

The retained `no-unnecessary-condition` directive at `packages/lint/src/custom/require-jsx-return-type.ts:113` remains with ESLint. No migrated-candidate directive requires a rewrite.
