# unused-imports (vendored)

Copied from `eslint-plugin-unused-imports@4.4.1` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (2): `no-unused-imports`, `no-unused-vars`.

External runtime dependencies: `@eslint-community/eslint-utils` (upstream range `?`), `@typescript-eslint/types` (upstream range `?`), `eslint-visitor-keys` (upstream range `?`).

## Local patches

- `plugin.mjs`: The dynamic base-rule loader is replaced while bundling with the exact oracle base (@typescript-eslint/eslint-plugin@8.59.1 no-unused-vars); only original syntax-only helpers are included, with their licenses. No third-party ESLint plugin or ESLint runtime is loaded by the generated code. Restore ESLint's inline-global scope initialization using its original parser methods and oxc's GlobalScope.addVariables API.
- `plugin.mjs`: Initialize inline /* global(s) */ comments before no-unused-vars creates its base-rule listeners; once per AST when the two wrapper rules run together.
