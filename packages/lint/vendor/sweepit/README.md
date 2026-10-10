# sweepit (vendored)

Copied from `eslint-plugin-sweepit@0.0.23` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (20): `complexity`, `no-return-object-repetition`, `jsx-bem-compound-naming`, `jsx-flat-owner-tree`, `jsx-server-action-prop-suffix`, `max-custom-props`, `no-boolean-capability-props`, `no-componenttype-props`, `no-custom-kebab-case-props`, `no-element-props`, `no-exported-context-hooks`, `no-handle-prefix-utils`, `no-handler-return-type`, `no-hook-jsx`, `no-optional-props-without-defaults`, `no-prefixed-prop-bundles`, `no-prop-drilling`, `no-render-helper-functions`, `no-set-prefix-utils`, `no-title-case-props`.

Enabled upstream rules not vendored:

- `no-object-props`: stays in ESLint: it uses the TypeScript type checker when available (imported/derived prop types), and oxlint JS plugins get no type information.
- `no-array-props`: stays in ESLint: it uses the TypeScript type checker when available (imported/derived prop types), and oxlint JS plugins get no type information.

External runtime dependencies: none.

## Local patches

- `index.cjs`: Remove upstream config constructors and their eager third-party ESLint plugin imports; oxlint presets supply options and settings.
- `index.cjs`: Remove no-useless-hook, which the inventory does not enable.
- `index.cjs`: Remove the unused no-useless-hook registration.
- `index.cjs`: Remove jsx-on-handler-verb-suffix, which the inventory does not enable.
- `index.cjs`: Remove the unused jsx-on-handler-verb-suffix registration.
- `index.cjs`: Remove no-external-binding-mutation, which the inventory does not enable.
- `index.cjs`: Remove the unused no-external-binding-mutation registration.
- `index.cjs`: Remove jsx-compound-part-export-naming, which the inventory does not enable.
- `index.cjs`: Remove the unused jsx-compound-part-export-naming registration.
- `index.cjs`: Remove no-inline-call-expressions, which the inventory does not enable.
- `index.cjs`: Remove the unused no-inline-call-expressions registration.
- `index.cjs`: Remove no-object-props, which stays in ESLint: it uses the TypeScript type checker when available (imported/derived prop types), and oxlint JS plugins get no type information.
- `index.cjs`: Remove the no-object-props registration.
- `index.cjs`: Remove no-array-props, which stays in ESLint: it uses the TypeScript type checker when available (imported/derived prop types), and oxlint JS plugins get no type information.
- `index.cjs`: Remove the no-array-props registration.
- `index.cjs`: Export only rule definitions, not the deleted ESLint configs.
