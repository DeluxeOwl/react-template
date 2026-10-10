# react-render-types (vendored)

Copied from `eslint-plugin-react-render-types@0.7.6` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
Only the rules enabled in our presets are included; they run inside oxlint as a JS plugin.

Rules (1): `renders-uses-vars`.

Enabled upstream rules not vendored:

- `valid-render-prop`: stays in ESLint: it reads types from the TypeScript type checker (parserServices), which oxlint JS plugins do not get
- `valid-render-return`: stays in ESLint: it reads types from the TypeScript type checker (parserServices), which oxlint JS plugins do not get
- `valid-renders-jsdoc`: stays in ESLint: it reads types from the TypeScript type checker (parserServices), which oxlint JS plugins do not get

External runtime dependencies: `@typescript-eslint/utils` (upstream range `^8.53.1`).

## Local patches

- `utils/create-rule.js`: Import only rule-construction helpers; the utils root eagerly imports ESLint, but renders-uses-vars needs no ESLint runtime or type checker
