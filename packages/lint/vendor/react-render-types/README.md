# react-render-types (vendored)

Copied from `eslint-plugin-react-render-types@0.7.6` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/react-render-types.ts`) or the tool, and run `bun run vendor react-render-types` in packages/lint.
Only the rules enabled in our presets are included; they run inside oxlint as a JS plugin.

Rules (1): `renders-uses-vars`.

External runtime dependencies: none.

Imports of `@typescript-eslint/utils/eslint-utils` load the bundled copies in `../_deps/` (see its README): those packages would install ESLint.

## Local patches

- `utils/create-rule.js`: Import only rule-construction helpers; the utils root eagerly imports ESLint, but renders-uses-vars needs no ESLint runtime or type checker
