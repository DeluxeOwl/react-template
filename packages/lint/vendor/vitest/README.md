# vitest (vendored)

Copied from `@vitest/eslint-plugin@1.6.16` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/vitest.ts`) or the tool, and run `bun run vendor vitest` in packages/lint.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (68): `consistent-each-for`, `consistent-test-filename`, `consistent-test-it`, `consistent-vitest-vi`, `expect-expect`, `hoisted-apis-on-top`, `max-nested-describe`, `no-alias-methods`, `no-commented-out-tests`, `no-conditional-expect`, `no-conditional-in-test`, `no-conditional-tests`, `no-disabled-tests`, `no-duplicate-hooks`, `no-focused-tests`, `no-hooks`, `no-import-node-test`, `no-interpolation-in-snapshots`, `no-large-snapshots`, `no-mocks-import`, `no-restricted-matchers`, `no-restricted-vi-methods`, `no-standalone-expect`, `no-test-prefixes`, `no-test-return-statement`, `no-unneeded-async-expect-function`, `padding-around-after-all-blocks`, `padding-around-after-each-blocks`, `padding-around-all`, `padding-around-before-all-blocks`, `padding-around-before-each-blocks`, `padding-around-describe-blocks`, `padding-around-expect-groups`, `padding-around-test-blocks`, `prefer-called-exactly-once-with`, `prefer-called-times`, `prefer-called-with`, `prefer-comparison-matcher`, `prefer-each`, `prefer-equality-matcher`, `prefer-expect-assertions`, `prefer-expect-resolves`, `prefer-expect-type-of`, `prefer-hooks-in-order`, `prefer-hooks-on-top`, `prefer-import-in-mock`, `prefer-lowercase-title`, `prefer-mock-promise-shorthand`, `prefer-snapshot-hint`, `prefer-spy-on`, `prefer-strict-boolean-matchers`, `prefer-strict-equal`, `prefer-to-be-object`, `prefer-to-be`, `prefer-to-contain`, `prefer-to-have-been-called-times`, `prefer-to-have-length`, `prefer-todo`, `prefer-vi-mocked`, `require-awaited-expect-poll`, `require-hook`, `require-local-test-context-for-concurrent-snapshots`, `require-mock-type-parameters`, `require-to-throw-message`, `require-top-level-describe`, `valid-describe-callback`, `valid-expect-in-promise`, `valid-expect`.

External runtime dependencies: `typescript` (upstream range `?`).

Imports of `@typescript-eslint/utils` load the bundled copies in `../_deps/` (see its README): those packages would install ESLint.

## Local patches

- `index.mjs`: inline the only scope-manager constant the bundle reads; its ImportBinding value is exactly the string returned by both ESLint and oxlint scope definitions
- `index.mjs`: oxc uses null for absent CallExpression.typeArguments; typescript-estree uses undefined (nullish absence is equivalent)
- `index.mjs`: oxlint freezes nested options arrays; copy before adding the type-testing assertion names instead of mutating assertFunctionNames
- `index.mjs`: remove the eager @typescript-eslint/eslint-plugin import for the non-portable unbound-method rule (never enabled in the port preset)
- `index.mjs`: remove the unused espreeParser resolution so the port does not depend on ESLint at runtime
