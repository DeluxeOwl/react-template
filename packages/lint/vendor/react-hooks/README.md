# react-hooks (vendored)

Copied from `eslint-plugin-react-hooks@7.1.1` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (16): `rules-of-hooks`, `static-components`, `use-memo`, `preserve-manual-memoization`, `incompatible-library`, `immutability`, `globals`, `refs`, `set-state-in-effect`, `error-boundaries`, `purity`, `set-state-in-render`, `unsupported-syntax`, `config`, `gating`, `todo`.

External runtime dependencies: `@babel/core` (upstream range `^7.24.4`), `@babel/parser` (upstream range `^7.24.4`), `hermes-parser` (upstream range `^0.25.1`), `zod` (upstream range `^3.25.0 || ^4.0.0`), `zod-validation-error` (upstream range `^3.5.0 || ^4.0.0`).

## Local patches

- `upstream/eslint-plugin-react-hooks.development.js`: Remove the development-only guard: the package's index.js picks this build only when NODE_ENV is not production, and we vendor only this build, so without the edit the copy would export nothing under NODE_ENV=production. The compiler and rule code are unchanged.
