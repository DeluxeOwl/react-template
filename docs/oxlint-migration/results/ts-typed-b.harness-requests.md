# ts-typed-b — harness requests

## Primary spans are not `labels[0]` for tsgolint diagnostics

`harness/lib/oxlint-runner.ts:205` (line may shift) reads `diagnostic.labels?.[0]?.span`. tsgolint 7.0.2003 emits explanatory labels first and appends the **unlabelled primary** range last. This creates false failures for at least `no-unsafe-enum-comparison`, `restrict-plus-operands`, and `unbound-method`, and hides the real primary range for `no-unsafe-assignment`, `no-unsafe-return`, and `no-unsafe-type-assertion`.

Direct reproduction from the kept sandbox (same oxlint binary and generated config):

```json
{
    "message": "The two values in this comparison do not have a shared enum type.",
    "code": "typescript(no-unsafe-enum-comparison)",
    "filename": "apps/web/__parity__/upstream-0044.tsx",
    "labels": [
        {
            "label": "Left operand: Fruit",
            "span": { "offset": 57, "length": 11, "line": 5, "column": 9 }
        },
        {
            "label": "Right operand: 1",
            "span": { "offset": 72, "length": 1, "line": 5, "column": 24 }
        },
        { "span": { "offset": 57, "length": 16, "line": 5, "column": 9 } }
    ]
}
```

ESLint reports `[57..73]`, exactly the last label. Current harness compares `[57..68]` and FAILs.

Source: `upstream/tsgolint/internal/rules/no_unsafe_enum_comparison/no_unsafe_enum_comparison.go:46–52` deliberately separates `Range` from `LabeledRanges`; `upstream/tsgolint/cmd/tsgolint/headless.go:347–362` serializes both separately. oxlint tag `oxlint_v1.86.0`, `crates/oxc_linter/src/tsgolint.rs:951–974` explicitly appends `val.span.primary()` **after** the explanatory labels (obtain with `git show`, checkout is sparse).

Request: select the unlabelled primary label when present (fallback to first for implementations without one), then re-run native reports. The shared harness remains unchanged.

Final primary-aware proof: `results/ts-typed-b.primary-parity.ts` selects the primary label and retains the existing sandbox, ESLint runner, native fixer, and comparison helpers. `no-unsafe-enum-comparison` matches all 56 diagnostics on 73 real files and 88 cases, including parenthesized operands. `restrict-plus-operands` and `unbound-method` still fail because of genuine detection differences. Full findings are in `results/ts-typed-b.md`.

## Type-aware mangled coverage

`harness/parity.ts` omits mangled files in type-aware mode. `harness/lib/sandbox.ts` rejects `kind: "mangled"`.

Request: run each variant in a separate sandbox at the original path. This avoids path collisions and keeps imports and configuration classes intact. The supplemental runner does this without a shared edit.

Both migration candidates match on 288 mangled files across seeds 1, 2, and 3. Reports: `results/ts-typed-b.final-candidates.primary.mangled.seed<seed>.variant<variant>.json`. The cases make each rule's proof non-vacuous.

## Unmatched TypeScript projects

`OXC_LOG=debug` assigns neither `packages/lint/eslint.config.ts` nor `packages/lint/bin/oxlint-fix.js` to a TypeScript program. Explicit `--tsconfig` does not repair this. Error-typed unsafe reports on those files are therefore not evidence of a TS7 checker regression.

Request: surface unmatched project assignments in type-aware parity reports. Exact evidence: `results/ts-typed-b.real-program-debug.json`.

The conditional-return witness has a valid program. Its cause is constrained versus raw type comparison, demonstrated with the same TS6 checker in `results/ts-typed-b.return-constraint-proof.json`. It supersedes the preliminary checker-bug explanation.
