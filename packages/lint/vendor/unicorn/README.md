# unicorn (vendored)

Copied from `eslint-plugin-unicorn@64.0.0` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/unicorn.ts`) or the tool, and run `bun run vendor unicorn` in packages/lint.
Only the rules enabled in our presets are included; they run inside oxlint as a JS plugin.

Rules (3): `better-regex`, `consistent-destructuring`, `import-style`.

External runtime dependencies: `@babel/helper-validator-identifier` (upstream range `^7.28.5`), `clean-regexp` (upstream range `^1.0.0`), `jsesc` (upstream range `^3.1.0`), `regexp-tree` (upstream range `^0.1.27`).

Imports of `@eslint-community/eslint-utils` load the bundled copies in `../_deps/` (see its README): those packages would install ESLint.

## Local patches

- `better-regex.js`: Unicorn 64 rule modules use context.on() rather than returning ESLint listeners; apply the upstream adapter retained in the import closure.
- `consistent-destructuring.js`: Apply the upstream toEslintCreate adapter (already copied via the upstream utility closure); raw unicorn modules do not return ESLint listeners.
- `consistent-destructuring.js`: Use the two required utility modules directly; the utility barrel otherwise imports ESLint built-in rules and unrelated helpers at runtime.
- `import-style.js`: Unicorn 64 rule modules use context.on() rather than returning ESLint listeners; apply the upstream adapter retained in the import closure.
- `utils/get-builtin-rule.js`: This helper is not imported by the three vendored rules after narrowing the utility barrel; remove the dead module's third-party dependency too.
- `utils/index.js`: None of the three vendored rules uses getBuiltinRule; remove the runtime dependency on ESLint from the unused utility barrel.
