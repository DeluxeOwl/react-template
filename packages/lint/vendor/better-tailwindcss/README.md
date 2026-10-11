# better-tailwindcss (vendored)

Copied from `eslint-plugin-better-tailwindcss@4.5.0` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (8): `enforce-consistent-class-order`, `enforce-consistent-line-wrapping`, `no-deprecated-classes`, `no-duplicate-classes`, `no-unnecessary-whitespace`, `no-conflicting-classes`, `no-unknown-classes`, `no-restricted-classes`.

Enabled upstream rules not vendored:

- `enforce-canonical-classes`: Tailwind 4.2.4 canonicalization depends on earlier files' mutable design-system state. Parallel oxlint file order and fresh fix processes differ from ESLint's sequential cached history.

External runtime dependencies: `@eslint/css-tree` (upstream range `^4.0.1`), `@valibot/to-json-schema` (upstream range `^1.6.0`), `enhanced-resolve` (upstream range `^5.20.1`), `jiti` (upstream range `^2.6.1`), `synckit` (upstream range `^0.11.12`), `tailwind-csstree` (upstream range `^0.3.0`), `tsconfig-paths-webpack-plugin` (upstream range `^4.2.0`), `valibot` (upstream range `^1.3.1`).

## Local patches

None — files are byte-identical to upstream.
