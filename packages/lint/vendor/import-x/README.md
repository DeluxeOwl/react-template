# import-x (vendored)

Copied from `eslint-plugin-import-x@4.16.2` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/import-x.ts`) or the tool, and run `bun run vendor import-x` in packages/lint.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (9): `no-unresolved`, `named`, `namespace`, `default`, `export`, `no-named-as-default`, `no-named-as-default-member`, `no-duplicates`, `no-dynamic-require`.

External runtime dependencies: `@typescript-eslint/types` (upstream range `^8.56.0`), `debug` (upstream range `^4.4.1`), `eslint-import-context` (upstream range `^0.1.9`), `is-glob` (upstream range `^4.0.3`), `minimatch` (upstream range `^9.0.3 || ^10.1.2`), `semver` (upstream range `^7.7.2`), `stable-hash-x` (upstream range `^0.2.0`), `unrs-resolver` (upstream range `^1.9.2`).

Imports of `@typescript-eslint/parser`, `eslint-import-resolver-typescript` load the bundled copies in `../_deps/` (see its README): those packages would install ESLint.

## Local patches

- `index.cjs`: No exposed rule reads the lazy doc metadata. A comment-only facade removes the otherwise eager ESLint SourceCode construction without changing any exposed rule's diagnostics or fixes.
- `index.cjs`: Oxlint settings cannot carry ESLint resolver functions; recreate the repo's exact alwaysTryTypes/bun/project resolver options per importing workspace when no callable resolver was supplied.
- `index.cjs`: Oxlint supplies a parser-shaped stub whose parse() method throws. Use the repo's typescript-eslint parser for remote modules, while retaining the upstream alternate-parser settings branch.
- `index.cjs`: Pin metadata to the installed upstream version without requiring package.json outside the vendored bundle.
- `index.cjs`: The copied bundle includes no-unused-modules but index.js does not expose it; no exposed rule uses ESLint's FileEnumerator. Remove that unused third-party import.
- `index.cjs`: These rules only use ESLint SourceCode for lazily captured documentation, never for diagnostics. Remove ESLint; use the repo's original parser and resolver as generic runtime helpers for remote modules.
