# Type-information audit

The audit uses the installed upstream versions and their import closures.
The final checks use `--type-aware`, including rules without a checker path.

| Rule family                                                        | Source search                                                                               | Result                                                                                                                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ESLint core, seven selected files under oracle `eslint/lib/rules/` | `parserServices`, `getParserServices`, `getTypeChecker`, `program`, `esTreeNodeToTSNodeMap` | No matches.                                                                                                                                                  |
| Import-x, oracle `lib/index.cjs` and vendored `index.cjs`          | Same terms                                                                                  | Only an AST `program` parameter in an unexposed rule. No checker path. The remote parser explicitly removes project/projectService options.                  |
| Unicorn, vendored rule and helper closure                          | Same terms                                                                                  | Vue template hooks in `utils/get-token-store.js` and `utils/rule.js`. No TypeScript checker path. The selected rule adapters use `rule/to-eslint-create.js`. |
| React Refresh, oracle `index.js`                                   | Same terms                                                                                  | Only the AST `Program(program)` listener. No checker path.                                                                                                   |

Typed parity checks:

- Core `no-restricted-globals`, `no-throw-literal`, `no-restricted-syntax`, and `prefer-const`: upstream together PASS, 211 matching diagnostics, 36/36 fixes.
- Unicorn: port together PASS, 114 matching diagnostics, 42/42 fixes.
- Native `prefer-rest-params` and `prefer-spread`: together PASS, 22 matching diagnostic spans. Native messages differ, as the playbook permits.
- React Refresh: upstream PASS, 40 matching diagnostics.
- Import-x: port together PASS, 558 matching diagnostics, 36/36 fixes.

The `no-var` module-scope adapter also passes the typed check: 59 matching diagnostics and 22/22 fixes.
The full typed batch probe matches all 20 rules and all 201 changed-file fixes.
The probe still uses upstream core and React Refresh implementations.
Those ports need the vendoring-tool capabilities recorded in `core-import-misc.md`.
The `no-var` adapter is saved as a patch in `vendor/specs/eslint.ts`.
