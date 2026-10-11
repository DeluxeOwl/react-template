# eslint (vendored)

Copied from `eslint@10.3.0` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/eslint.ts`) or the tool, and run `bun run vendor eslint` in packages/lint.
Only the rules enabled in our presets are included; they run inside oxlint as a JS plugin.

Rules (5): `no-var`, `prefer-const`, `no-throw-literal`, `no-restricted-globals`, `no-restricted-syntax`.

External runtime dependencies: `@typescript-eslint/scope-manager` (upstream range `?`), `escape-string-regexp` (upstream range `^4.0.0`), `eslint-visitor-keys` (upstream range `^5.0.1`), `espree` (upstream range `^11.2.0`), `esutils` (upstream range `^2.0.2`).

## Local patches

- `upstream/lib/rules/no-var.js`: ESLint treats the configured JS/TS file families as modules, including files without imports/exports. Oxlint infers those files as scripts, so no-var refuses fixes for their global variables. Re-analyze the same AST nodes with ESLint's module-scope policy for this rule only; retain every upstream safety predicate.
