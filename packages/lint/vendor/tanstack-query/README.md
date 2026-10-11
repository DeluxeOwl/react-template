# @tanstack/query (vendored)

Copied from `@tanstack/eslint-plugin-query@5.100.9` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/tanstack-query.ts`) or the tool, and run `bun run vendor tanstack-query` in packages/lint.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (6): `exhaustive-deps`, `no-rest-destructuring`, `stable-query-client`, `no-unstable-deps`, `infinite-query-property-order`, `mutation-property-order`.

External runtime dependencies: `@typescript-eslint/types` (upstream range `?`), `@typescript-eslint/utils` (upstream range `^8.58.1`).

## Local patches

- `chunk-CI2SSAE2.js`: Import AST constants directly rather than the utils root that eagerly imports ESLint
- `chunk-CI2SSAE2.js`: Import only AST constants and rule-construction helpers; the utils root eagerly loads ESLint/RuleTester, which a vendored oxlint plugin must not require
- `chunk-CI2SSAE2.js`: Use the lightweight rule-construction helper subpath; no-void-query-fn remains disabled in oxlint because it needs parser services
