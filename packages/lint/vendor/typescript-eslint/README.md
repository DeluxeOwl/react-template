# @typescript-eslint (vendored)

Copied from `typescript-eslint@8.59.1` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/typescript-eslint.ts`) or the tool, and run `bun run vendor typescript-eslint` in packages/lint.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (13): `ban-ts-comment`, `no-array-constructor`, `no-unnecessary-type-constraint`, `no-restricted-imports`, `array-type`, `consistent-generic-constructors`, `consistent-indexed-object-style`, `consistent-type-definitions`, `explicit-function-return-type`, `naming-convention`, `no-inferrable-types`, `no-magic-numbers`, `prefer-function-type`.

External runtime dependencies: `@typescript-eslint/types` (upstream range `?`), `eslint-visitor-keys` (upstream range `?`), `typescript` (upstream range `?`).

Imports of `@eslint-community/eslint-utils` load the bundled copies in `../_deps/` (see its README): those packages would install ESLint.

## Local patches

- `plugin.mjs`: naming-convention: the repo has no types selectors; skip the unconditional parser-services lookup only in that syntax-only case (ESNext quoting is equivalent for our ES2022/ESNext workspaces)
