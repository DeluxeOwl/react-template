# import-zod (vendored)

Copied from `eslint-plugin-import-zod@1.2.1` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (1): `prefer-zod-namespace`.

External runtime dependencies: `@typescript-eslint/types` (upstream range `?`), `@typescript-eslint/utils` (upstream range `?`).

## Local patches

- `index.mjs`: Keep upstream attribution and its declared MIT permission (the npm package and tagged repo omit LICENSE). Import the same RuleCreator and AST enums through pure helper entry points, avoiding the utils root's eager ESLint runtime import.
