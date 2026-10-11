# import-zod (vendored)

Copied from `eslint-plugin-import-zod@1.2.1` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/import-zod.ts`) or the tool, and run `bun run vendor import-zod` in packages/lint.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (1): `prefer-zod-namespace`.

External runtime dependencies: `@typescript-eslint/types` (upstream range `?`).

Imports of `@typescript-eslint/utils/eslint-utils` load the bundled copies in `../_deps/` (see its README): those packages would install ESLint.

## Local patches

- `index.mjs`: Keep upstream attribution and its declared MIT permission (the npm package and tagged repo omit LICENSE). Import the same RuleCreator and AST enums through pure helper entry points, avoiding the utils root's eager ESLint runtime import.
