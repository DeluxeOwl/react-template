# ts-typed-b — verdicts and evidence

## Result

**2 migrate-native, 13 keep-eslint, 0 migrate-port, 0 blocked.** Presets and shared harness files remain unchanged.

Proposed native values:

```json
{
    "typescript/no-unsafe-enum-comparison": ["error"],
    "typescript/no-unsafe-unary-minus": ["error"]
}
```

Both require type-aware mode. The enum verdict uses a primary-aware supplemental proof because the shared harness selects an explanatory label.

All results use oxlint **1.86.0**, tsgolint **7.0.2003** (`eb9339115edde6811ca94c3433adf69ea9852880`), and typescript-eslint **8.59.1** with TypeScript **6.0.3**. The tsgolint engine uses typescript-go. Source references explain rule differences without assuming that every difference comes from the checker.

The machine-readable result is [`ts-typed-b.json`](ts-typed-b.json). It contains commands, attempts, exact witness diagnostics, fixes, exclusions, and directives for each rule.

## Final numbers

All names in this table have the `@typescript-eslint/` prefix. Diagnostics use the unlabelled primary span. Messages do not affect native verdicts.

`E/O` means ESLint/oxlint. `Missing/extra` counts unmatched spans, not distinct findings. `Fix bytes` counts identical changed files.

| Rule                           | Verdict        | Real / cases | Diagnostics E/O | Missing/extra | Fix bytes |
| ------------------------------ | -------------- | -----------: | --------------: | ------------: | --------: |
| no-unsafe-argument             | keep-eslint    |      72 / 43 |           24/25 |           1/2 |       0/0 |
| no-unsafe-assignment           | keep-eslint    |      72 / 94 |           59/59 |         26/26 |       0/0 |
| no-unsafe-call                 | keep-eslint    |      72 / 40 |           28/29 |           2/3 |       0/0 |
| no-unsafe-enum-comparison      | migrate-native |      73 / 88 |           56/56 |           0/0 |       0/0 |
| no-unsafe-member-access        | keep-eslint    |      72 / 36 |           20/22 |           2/4 |       0/0 |
| no-unsafe-return               | keep-eslint    |      72 / 64 |           37/39 |         37/39 |       0/0 |
| no-unsafe-type-assertion       | keep-eslint    |     58 / 102 |           64/64 |         64/64 |       0/0 |
| no-unsafe-unary-minus          | migrate-native |      73 / 26 |           17/17 |           0/0 |       0/0 |
| no-useless-default-assignment  | keep-eslint    |      72 / 81 |           21/21 |           0/0 |      0/21 |
| prefer-promise-reject-errors   | keep-eslint    |     72 / 156 |           91/90 |           2/1 |       0/0 |
| prefer-string-starts-ends-with | keep-eslint    |     72 / 127 |           77/71 |         19/13 |     64/65 |
| require-await                  | keep-eslint    |      72 / 88 |           34/34 |           9/9 |       0/0 |
| restrict-plus-operands         | keep-eslint    |     72 / 110 |           40/38 |           2/0 |       0/0 |
| restrict-template-expressions  | keep-eslint    |      72 / 72 |           33/33 |           1/1 |       0/0 |
| unbound-method                 | keep-eslint    |     72 / 206 |           66/65 |           1/0 |       0/0 |

The retained-rule snapshot contains 72 real files. Final candidate runs contain 73 after the orchestrator added `packages/lint/src/oxlint/sweepit.ts`. Both candidate verdicts remain PASS.

Real/case counts include parser-rejected cases before exclusion. The JSON records every rejection. There are no ESLint crashes or compared-file runtime problems in these native runs.

`no-unsafe-type-assertion` remains off on 14 real test files and one explicit test-file control. This is the existing per-file policy, not a missing rule.

The migration candidates are non-vacuous: ESLint emits 56 enum diagnostics and 17 unary diagnostics. Neither rule is autofixable. Enum suggestions remain unapplied by `--fix` on both sides.

## Proof method and reproduction

Primary-aware reports use the name `ts-typed-b.<rule>.primary.full.json`. Each contains source, both outcomes, all diagnostic labels, byte-for-byte fixes, commands, and per-file options.

The reproducible runner is [`ts-typed-b.primary-parity.ts`](ts-typed-b.primary-parity.ts). It uses the existing ESLint runner, sandbox, native implementation, fixer loop, and comparison helpers. It changes only two aspects of the supplemental run:

1. It selects the unlabelled primary span, with the first label as fallback.
2. It writes each mangled variant at its original path in a separate sandbox.

It does not change the oracle, workspace configuration, rule options, or shared harness files. Every comparison uses type-aware ESLint and `oxlint --type-aware`.

```sh
# One rule, real files and all cases
bun scratch/oxlint-migration/results/ts-typed-b.primary-parity.ts \
  @typescript-eslint/no-unsafe-enum-comparison

# All 15 rules, each in its own parity run
bun scratch/oxlint-migration/results/ts-typed-b.run-primary.ts

# Both candidates on one set of mangled files
bun scratch/oxlint-migration/results/ts-typed-b.primary-parity.ts \
  @typescript-eslint/no-unsafe-enum-comparison \
  @typescript-eslint/no-unsafe-unary-minus \
  --mangled --seed 1 --variant 0 --tag candidates

# Explicit native defaults on minimal cases
bun scratch/oxlint-migration/results/ts-typed-b.run-defaults.ts
```

Run these commands inside `devbox shell`, or prefix them with `devbox run --`.

### Mangled coverage for both candidates

All variants use probability 0.15 and the existing seeded mangler. Separate sandboxes retain import resolution and the original configuration class.

| Seed / variant | Mangled files | Diagnostics E/O | Fix divergence | Result |
| -------------- | ------------: | --------------: | -------------: | ------ |
| 1 / 0          |            73 |             0/0 |              0 | PASS   |
| 1 / 1          |            72 |             0/0 |              0 | PASS   |
| 2 / 0          |            71 |             0/0 |              0 | PASS   |
| 3 / 0          |            72 |             0/0 |              0 | PASS   |

Total: **288 mangled files**, zero exclusions and zero runtime problems. These are clean type-safety variants, not the non-vacuous part of the proof. Real/case reports provide that part.

Reports: `ts-typed-b.final-candidates.primary.mangled.seed<seed>.variant<variant>.json`. The final candidate together run also passes: 73 real files, 114 cases, **73/73 diagnostics**, unchanged identical bytes (`ts-typed-b.final-candidates.primary.full.json`).

The enum debug run assigns all 88 cases to two programs: 85 web cases and three core cases, with zero unmatched files. Report: `ts-typed-b.enum-program-debug.json`.

The unmodified shared harness independently passes unary minus on 98 files with 17/17 diagnostics (`ts-typed-b.no-unsafe-unary-minus.final-native.json`). That run used the earlier 72-file real snapshot.

## Genuine differences after primary-span correction

Case paths in this section are relative to `scratch/oxlint-migration/harness/cases/@typescript-eslint__<rule>/`. Upstream Go paths are relative to `scratch/oxlint-migration/upstream/tsgolint/`.

### Parenthesized expression targets

- **no-unsafe-argument:** `packages/core/__parity__/proof-parenthesized-argument.ts:3` contains `accept((unsafe))`. ESLint reports `[79..85]`. Oxlint reports `[78..86]`. Native source reports the TS argument node at `internal/rules/no_unsafe_argument/no_unsafe_argument.go:300–312`.
- **no-unsafe-call:** `packages/core/__parity__/proof-parenthesized-callee.ts:2,4` contains `(unsafe)()` and a parenthesized template tag. ESLint omits parentheses in both spans. Native reports the callee/tag node at `internal/rules/no_unsafe_call/no_unsafe_call.go:118–139`. Constructor coverage matches.
- **no-unsafe-member-access:** `packages/core/__parity__/proof-parenthesized-key.ts:3` contains `object[(key += 1)]`. ESLint reports `[54..62]`. Oxlint reports `[53..63]`. Native reports the computed argument at `internal/rules/no_unsafe_member_access/no_unsafe_member_access.go:164–189`.
- **restrict-template-expressions:** `packages/core/__parity__/proof-parenthesized-template.ts:2` contains an unknown interpolation `${(value)}`. ESLint reports `[33..38]`. Oxlint reports `[32..39]`. `TrimNodeTextRange` removes trivia, not parentheses (`internal/rules/restrict_template_expressions/restrict_template_expressions.go:74–88`).

Explicit defaults retain the member-access and template mismatches. The argument and call rules have no options.

### Assignment, return, and assertion ranges

- **no-unsafe-assignment:** `packages/core/__parity__/proof-simple-assignment.ts:2` contains `const value = unsafe`. ESLint reports `[32..46]`. The actual native primary span is only the `=` at `[38..39]`. The RHS span is an explanatory label. `assignmentRelationRange` deliberately chooses `=` or `:` (`internal/rules/no_unsafe_assignment/no_unsafe_assignment.go:151–169`). Native listeners pass that range at `:584–647`.
- **no-unsafe-return:** `packages/core/__parity__/proof-return-statement.ts:1–2` compares a return statement and an arrow body. ESLint reports `[19..34]` and `[57..65]`. Native reports `return` at `[19..25]` and `=>` at `[54..56]`. Native listeners choose these tokens (`internal/rules/no_unsafe_return/no_unsafe_return.go:233–245`).
- **no-unsafe-type-assertion:** `packages/core/__parity__/proof-narrowing.ts:2` contains `value as string`. ESLint reports `[37..52]`. Native reports the `as string` portion at `[43..52]`. `getAssertionRange` deliberately excludes the original expression (`internal/rules/no_unsafe_type_assertion/no_unsafe_type_assertion.go:58–70`).

No native option changes these targets. Each JS-upstream attempt fails because oxlint does not provide TypeScript parser services.

### Return constraint handling — not an established TS7 checker bug

`no-unsafe-return/packages/core/__parity__/proof-conditional-generic.ts:1–2` is the smallest witness:

```ts
type Extract<D extends { inner: any }> = D extends { inner: infer T } ? T : never
const outer = <D extends { inner: any }>(value: Extract<D>) => () => value
```

ESLint emits no diagnostic. Native emits an unsafe `any` return diagnostic.

The TypeScript 6 checker reports the raw value and function return type as the same `Extract<D>` object. Its base constraint is `any`. The upstream ESLint rule passes the **raw** type to `isUnsafeAssignment`. Tsgolint passes its **constrained** type to `IsUnsafeAssignment` (`internal/rules/no_unsafe_return/no_unsafe_return.go:95–96,213–223`).

[`ts-typed-b.return-constraint-proof.json`](ts-typed-b.return-constraint-proof.json) demonstrates both outcomes with the same TS6 checker: raw comparison is safe, constrained comparison is unsafe. Thus the evidence identifies a rule-algorithm difference, not a TS7 checker bug. It supersedes the earlier provisional checker explanation.

The debug run assigns this witness to `packages/core/tsconfig.json`, with one program and zero unmatched files. Report: `ts-typed-b.conditional-generic.program-debug.json`.

### Fix behavior

- **no-useless-default-assignment:** `packages/core/__parity__/proof-fix-required.ts:2` has a required string property with a fallback. Diagnostics match. ESLint deletes the fallback. Native `--fix` leaves it. All 21 changed files differ. Native emits suggestions at `internal/rules/no_useless_default_assignment/no_useless_default_assignment.go:382–429`. There is no per-rule promotion option. Global suggestion application also changes enum/require-await behavior that ESLint `--fix` leaves unchanged.
- **prefer-string-starts-ends-with:** `packages/core/__parity__/proof-match-comparison.ts:2` has `value.match(/^prefix/) !== null`. ESLint reports the call `[28..50]`. Native reports the comparison `[28..59]`. Its fix matches, but the diagnostic does not.
- The string rule also misses six reports in `packages/core/__parity__/proof-regexp-static-patterns.ts:2–7,11`. These cover `g`/`y`, Unicode/hex escapes, a constant offset, and a concatenated `RegExp` pattern. ESLint fixes those expressions. Native leaves them. Native rejects selected flags/escapes at `internal/rules/prefer_string_starts_ends_with/prefer_string_starts_ends_with.go:327–387,414–439`. Its constant handling and match target differ at `:556–570,593–619`.

Explicit `allowSingleElementEquality: "never"` preserves the string differences. Final string fix coverage is **64/65 changed files identical**, rather than the preliminary all-identical result.

### Detection differences

- **prefer-promise-reject-errors:** `packages/core/__parity__/proof-default-executor-parameter.ts:1` has a default reject parameter. ESLint ignores it because the parameter is not an ESTree Identifier. Native follows its TS ParameterDeclaration and emits one extra report. The duplicate-name case at `proof-duplicate-parameter.ts:1` has the opposite result. Native uses `symbol.ValueDeclaration` and its parameter index (`internal/rules/prefer_promise_reject_errors/prefer_promise_reject_errors.go:65–99`). The installed ESLint source requires an Identifier and follows scope references (`dist/rules/prefer-promise-reject-errors.js:105–119`). Explicit rejection defaults preserve both differences.
- **restrict-plus-operands:** `packages/core/__parity__/proof-two-object-members.ts:2` adds an object union to a string. ESLint emits two reports, one per constituent, at `[51..56]`. Native emits one aggregate report at that same span. Native first finds invalid union members, then emits once per operand (`internal/rules/restrict_plus_operands/restrict_plus_operands.go:104–124,145–155`). Explicit defaults retain the missing report. Mixed bigint/number ranges match after correction of the primary label.
- **unbound-method:** `packages/core/__parity__/proof-collator.ts:2` extracts `Intl.Collator.compare`. ESLint reports `[54..70]`. Native emits nothing. Tsgolint intentionally exempts the default-library bound getter (`internal/rules/unbound_method/unbound_method.go:204–223`). `ignoreStatic: false` cannot disable that exemption. Other tested method spans match after correction of the primary label.
- **require-await:** `packages/core/__parity__/proof-arrow-head.ts:1–2` yields two range differences. The arrow range includes leading trivia, and the method-like function-expression range excludes the property key. `GetFunctionHeadLoc` returns `arrow.Loc` or the function's own start (`internal/utils/ts_eslint.go:193–222`). The rule uses that helper at `internal/rules/require_await/require_await.go:223–237`. Neither side applies its suggestions under `--fix`.

## Real-file TypeScript project mismatch

The native extra unsafe warnings on `packages/lint/eslint.config.ts:13` and `packages/lint/bin/oxlint-fix.js:9` need separate treatment.

`OXC_LOG=debug` assigns neither file to a TypeScript project: **zero programs, two unmatched files**. Supplying `--tsconfig packages/lint/tsconfig.json` does not change that result. Report: [`ts-typed-b.real-program-debug.json`](ts-typed-b.real-program-debug.json).

ESLint uses its default-project policy for these files. Therefore, the missing `ImportMeta.dirname` and error-typed `process` reports do not prove a TypeScript-Go checker regression. They identify a project-assignment/default-project limitation. The minimal in-project span witnesses already prove non-portability of the affected unsafe rules.

A small sandbox without the imported built file also reports an unsafe `runOxlintFix` call. The final full corpus does not. The result JSON counts only the final full run.

## JS port attempts and type-service audit

All 13 retained rules received a JS-upstream attempt with `--type-aware`. Each failed with one plugin problem and no native replacement for the missing parser services. Logs: `ts-typed-b.<rule>.upstream.log`.

The concrete error is: `You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file.` A vendored copy cannot create the missing compiler program. The playbook excludes type-aware JS ports, so no vendor files were created for this batch.

The orchestrator's optional-type-checker requirement also applies. [`ts-typed-b.type-service-audit.json`](ts-typed-b.type-service-audit.json) records upstream source lines for all 15 rules. The candidates call `getParserServices` and `program.getTypeChecker`. All final evidence uses type-aware ESLint and oxlint.

## Required fixable together runs

The batch has two autofixable rules: `no-useless-default-assignment` and `prefer-string-starts-ends-with`. Shared-harness together runs use seeds 1, 2, and 3. Each gives the same result:

- 72 real files + 208 cases.
- 98 ESLint / 92 native diagnostics.
- 19 missing / 13 extra diagnostic spans.
- **64/86** changed files have identical bytes.
- At most one native fix pass.

Reports: `ts-typed-b.together.seed1.log`, `seed2.log`, `seed3.log`. Failures come from the proven rule differences, not fix-order instability.

Supplemental type-aware mangled together runs add 72, 70, and 71 files for seeds 1, 2, and 3. They pass with zero diagnostics and unchanged identical bytes. Reports: `ts-typed-b.fixable-together.primary.mangled.seed<seed>.variant0.json`.

## Directives

No repository disable comment names either migrated candidate. No directive rewrite is necessary.

Retained rules keep their existing comments:

- `apps/server/todos/adapter-http.ts:118` — `no-unsafe-type-assertion`.
- `apps/server/todos/adapter-repo-sqlite.ts:119` — `no-unsafe-type-assertion`.
- `packages/lint/src/custom/no-margin-on-root-jsx.ts:188` — `no-unsafe-type-assertion`.
- `packages/core/todos/todo-repository.test.ts:430` — `require-await`.

## Harness requests and proposed facts

### Requests

1. **Select primary labels.** `harness/lib/oxlint-runner.ts:205` selects `labels[0]`. It must prefer the unlabelled primary range. Oxc appends that range after explanatory labels (`oxlint_v1.86.0`, `crates/oxc_linter/src/tsgolint.rs:951–974`). The enum candidate's shared-harness FAIL is false. The supplemental report proves its match without a shared edit.
2. **Permit type-aware mangled variants.** `harness/parity.ts` omits them and `sandbox.ts` rejects `kind: "mangled"`. Separate variant sandboxes at original paths avoid collisions and preserve type resolution. The supplemental reports supply the missing coverage for this batch.
3. **Expose unmatched TypeScript project assignments.** Do not interpret error-typed warnings on default-project files as checker failures without project evidence.

### Proposed F texts

- **F-new — Primary tsgolint labels:** Oxlint JSON places explanatory labels before the unlabelled primary label. `labels[0]` is not a reliable diagnostic span.
- **F-new — Native type-aware targets differ:** Tsgolint 7.0.2003 uses assignment-operator, return-token, assertion-type, and parenthesized-expression ranges where typescript-eslint 8.59.1 reports other AST ranges.
- **F-new — Default assignments are suggestions:** Native `no-useless-default-assignment` emits suggestions, while ESLint applies automatic fixes. Plain `--fix` cannot match.
- **F-new — Return constraints:** Native `no-unsafe-return` compares constrained types where ESLint compares raw types. A conditional type with an `any` constraint produces an extra report.
- **F-new — Default-project files:** Tsgolint can leave config/JS files unmatched to a TypeScript project and then produce error-typed unsafe warnings. Explicit `--tsconfig` did not repair the observed files.
- **F-new — Union reports:** Native `restrict-plus-operands` aggregates invalid union members, while ESLint emits one report per member.
- **F-new — Bound Collator getter:** Native `unbound-method` exempts default-library `Intl.Collator.compare`. ESLint 8.59.1 does not.

No unresolved licensing issue exists. No preset, shared harness, vendor specification, or git-state change was made by this batch.
