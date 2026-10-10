# @typescript-eslint (vendored)

Copied from `typescript-eslint@8.59.1` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (13): `ban-ts-comment`, `no-array-constructor`, `no-unnecessary-type-constraint`, `no-restricted-imports`, `array-type`, `consistent-generic-constructors`, `consistent-indexed-object-style`, `consistent-type-definitions`, `explicit-function-return-type`, `naming-convention`, `no-inferrable-types`, `no-magic-numbers`, `prefer-function-type`.

Enabled upstream rules not vendored:

- `await-thenable`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `consistent-type-exports`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `consistent-type-imports`: runs as oxlint's native `typescript/consistent-type-imports`.
- `no-array-delete`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-base-to-string`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-confusing-void-expression`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-deprecated`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-duplicate-type-constituents`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-floating-promises`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-for-in-array`: runs as oxlint's native `typescript/no-for-in-array`.
- `no-implied-eval`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-misused-promises`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-redundant-type-constituents`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unnecessary-boolean-literal-compare`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unnecessary-condition`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unnecessary-template-expression`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unnecessary-type-assertion`: runs as oxlint's native `typescript/no-unnecessary-type-assertion`.
- `no-unnecessary-type-conversion`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unsafe-argument`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unsafe-assignment`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unsafe-call`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unsafe-enum-comparison`: runs as oxlint's native `typescript/no-unsafe-enum-comparison`.
- `no-unsafe-function-type`: runs as oxlint's native `typescript/no-unsafe-function-type`.
- `no-unsafe-member-access`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unsafe-return`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unsafe-type-assertion`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `no-unsafe-unary-minus`: runs as oxlint's native `typescript/no-unsafe-unary-minus`.
- `no-useless-default-assignment`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `prefer-promise-reject-errors`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `prefer-string-starts-ends-with`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `require-await`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `restrict-plus-operands`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `restrict-template-expressions`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `unbound-method`: stays in ESLint: it needs type information, which oxlint JS plugins do not get, and oxlint's native version does not match ESLint.
- `unified-signatures`: runs as oxlint's native `typescript/unified-signatures`.

External runtime dependencies: `@eslint-community/eslint-utils` (upstream range `?`), `@typescript-eslint/types` (upstream range `?`), `eslint-visitor-keys` (upstream range `?`), `typescript` (upstream range `?`).

## Local patches

- `plugin.mjs`: naming-convention: the repo has no types selectors; skip the unconditional parser-services lookup only in that syntax-only case (ESNext quoting is equivalent for our ES2022/ESNext workspaces)
