# eslint (vendored)

Copied from `eslint@10.3.0` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
Only the rules enabled in our presets are included; they run inside oxlint as a JS plugin.

Rules (5): `no-var`, `prefer-const`, `no-throw-literal`, `no-restricted-globals`, `no-restricted-syntax`.

Enabled upstream rules not vendored:

- `prefer-rest-params`: runs as oxlint's native eslint/prefer-rest-params (parity proven)
- `prefer-spread`: runs as oxlint's native eslint/prefer-spread (parity proven)

External runtime dependencies: `@typescript-eslint/scope-manager` (upstream range `?`), `escape-string-regexp` (upstream range `^4.0.0`), `eslint-visitor-keys` (upstream range `^5.0.1`), `espree` (upstream range `^11.2.0`), `esutils` (upstream range `^2.0.2`).

## Local patches

- `upstream/lib/rules/no-var.js`: ESLint treats the configured JS/TS file families as modules, including files without imports/exports. Oxlint infers those files as scripts, so no-var refuses fixes for their global variables. Re-analyze the same AST nodes with the oracle's module-scope policy for this rule only; retain every upstream safety predicate.
