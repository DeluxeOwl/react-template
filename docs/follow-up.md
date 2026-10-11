# Follow-up

What is left after ESLint and ast-grep were replaced by oxlint (`@deluxeowl/lint` 0.6.0, 2026-10-11),
most important first. The IDs (D-, F-, Q-) point into [the migration record](oxlint-migration.md).

## 1. Move vetsolution to `@deluxeowl/lint` (done)

Done on 2026-10-11 with 0.7.1, in five commits on vetsolution's `main` (`c0f7e1c` to `6186464`).
It runs only oxlint now, from one `oxlint.config.ts`, and reports nothing. Log: §3 Phase 11 of
[the migration record](oxlint-migration.md), with decisions D-039 to D-041.

## 2. Stale disable comments are not reported

ESLint warned about `eslint-disable` comments that suppress nothing (its default), and ast-grep
reported unused `ast-grep-ignore` comments. Nothing does now, so stale ones accumulate. oxlint has the
check (`reportUnusedDisableDirectives`), but it can't be turned on yet: for vendored rules,
`packages/lint/vendor/_compat/report-order.js` applies the disable comments itself and drops the
reports they suppress before oxlint sees them (its header says why), so oxlint would call those
comments unused. A probe gave 21 reports, many of them for comments that do suppress something.

The check can come back once oxc fixes what makes the wrapper suppress (item 5) and oxlint does all
the suppressing, or once the wrapper itself reports the vendored-rule comments that suppressed nothing.

## 3. Upgrades

oxlint is pinned at 1.86.0 because `.npmrc` holds new releases back for 7 days (D-002); 1.87.0 is
allowed from 2026-10-12. The vendored plugins are pinned in `packages/lint/scripts/vendor/specs/` and
change only when someone bumps them. After either bump: `bun run vendor --all` in `packages/lint`
(plugins), `bun run postinstall`, the gate and `bun run test`. A new oxlint can break what
`vendor/_compat/` works around, and the RuleTester from `oxlint/plugins-dev`.

The gate and the tests don't show whether the rules still behave like the ESLint and ast-grep
originals. The parity tools did, and they exist only in the gitignored `scratch/` on one machine
(D-006): `scratch/oxlint-migration/harness/` (with ESLint in `scratch/oxlint-migration/oracle/`) and
`scratch/ast-grep-port/` (needs `ast-grep` on `PATH`). Copy them somewhere durable, such as a private
repo or a branch that is never merged, if they should outlive that machine.

## 4. Check the editor (done)

Done in 0.7.0 (D-038, Phase 10 of the record). VS Code showed only oxlint's defaults, because every
workspace config set an option only the root config may set. Now the editor reports what
`bun run lint:oxlint` reports, and fixes on save. That was checked through the language server, the
way VS Code drives it, not by hand in VS Code. A save applies one round of fixes where `oxlint-fix`
runs up to 20 (D-019), so a file can need a second save.

## 5. File the oxc issues

Section 6b of the record lists six. Five fixes would let us delete a workaround: the fix-order shim in
`vendor/_compat/report-order.js` (F-016), the JSX entity decoding in `vendor/_compat/jsx-entities.js`
(F-013), `oxlint-fix` (F-001, F-022), `custom/no-bare-enable-directive` (F-028), and the suppressing in
`report-order.js` that blocks item 2 (F-030). The sixth would let a next-line comment suppress a
report that spans several lines; today that takes a disable/enable block (F-069).

## 6. Decide whether to close the ported rules' gaps

The view-only rules flag what ast-grep flagged, gaps included (D-032), so the move didn't change what
the gate reports. They miss, for example, `React.useState(0)`, `useState<number>(0)`,
`useState?.(0)` and `xs?.filter(f)` (F-056), `var` declarations, and components written as function
expressions such as `forwardRef(function Button() {…})` (F-055). Closing a gap is a small change in
`plain-call.ts` or `view-only-component.ts`, plus fixing whatever it then finds.

## 7. Smaller things

- Node isn't in `devbox.json`. Loading `oxlint.config.ts` needs Node 22.18 or later, and RuleTester
  refuses Bun, so the lint package's tests run on Node (`vitest-on-node.ts`). Locally that's the
  machine's own Node; CI installs Node 24 (`setup-node`). Adding `nodejs` to devbox would pin it in
  one place.
- `bun run lint:duplicates` lists 11 function names defined more than once. It has never been part of
  the gate: fix or allow-list them and add it, or keep it as a manual tool.
- Two root files are outside every workspace, so nothing lints them: `reset.d.ts` and
  `.scaffdog/config.js`.
