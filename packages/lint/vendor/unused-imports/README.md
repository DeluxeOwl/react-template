# unused-imports (vendored)

Copied from `eslint-plugin-unused-imports@4.4.1` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/unused-imports.ts`) or the tool, and run `bun run vendor unused-imports` in packages/lint.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (2): `no-unused-imports`, `no-unused-vars`.

External runtime dependencies: `@typescript-eslint/types` (upstream range `?`), `eslint-visitor-keys` (upstream range `?`).

Imports of `@eslint-community/eslint-utils` load the bundled copies in `../_deps/` (see its README): those packages would install ESLint.

## Local patches

- `plugin.mjs`: Initialize inline /* global(s) */ comments before no-unused-vars creates its base-rule listeners; once per AST when the two wrapper rules run together.
- `plugin.mjs`: The dynamic base-rule loader is replaced while bundling with the exact base ESLint ran (@typescript-eslint/eslint-plugin@8.59.1 no-unused-vars); only original syntax-only helpers are included, with their licenses. No third-party ESLint plugin or ESLint runtime is loaded by the generated code. Restore ESLint's inline-global scope initialization using its original parser methods and oxc's GlobalScope.addVariables API.
