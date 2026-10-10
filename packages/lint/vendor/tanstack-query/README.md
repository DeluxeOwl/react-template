# @tanstack/query (vendored)

Copied from `@tanstack/eslint-plugin-query@5.100.9` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (6): `exhaustive-deps`, `no-rest-destructuring`, `stable-query-client`, `no-unstable-deps`, `infinite-query-property-order`, `mutation-property-order`.

Enabled upstream rules not vendored:

- `no-void-query-fn`: stays in ESLint: it reads return types from the TypeScript type checker, which oxlint JS plugins do not get (without it the rule reports nothing).

External runtime dependencies: `@typescript-eslint/types` (upstream range `?`), `@typescript-eslint/utils` (upstream range `^8.58.1`).

## Local patches

- `chunk-CI2SSAE2.js`: Import only AST constants and rule-construction helpers; the utils root eagerly loads ESLint/RuleTester, which a vendored oxlint plugin must not require
- `chunk-CI2SSAE2.js`: Import AST constants directly rather than the utils root that eagerly imports ESLint
- `chunk-CI2SSAE2.js`: Use the lightweight rule-construction helper subpath; no-void-query-fn remains disabled in oxlint because it needs parser services
