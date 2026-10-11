---
name: oxlint-rule-write
description: Custom lint rules — ours, the `custom/*` oxlint rules in packages/lint/src/custom. Load before writing, changing or testing one.
---

# Custom lint rules

Ours live in `packages/lint/src/custom/`: `<rule-id>.ts` and `<rule-id>.test.ts`. oxlint runs them as the JS plugin `custom` (`src/custom/oxlint-plugin.ts`), and the presets in `src/oxlint/custom.ts` switch them on. They use oxlint's plugin API (`@oxlint/plugins`), which has ESLint's rule shape: `meta`, plus `create(context)` returning visitors keyed by node type. `packages/lint/vendor/` holds generated copies of upstream plugins, not ours: they change only through `bun run vendor`.

## Steps

Run the commands in `packages/lint` unless a step says the repo root.

1. **Check the rule is new.** From the repo root, `node_modules/.bin/oxlint --rules -f json` lists oxlint's native rules (`scope` is the plugin, `value` the name, `type_aware` whether it needs types); without `-f` it can print nothing. The presets in `packages/lint/src/oxlint/*.ts` name the vendored rules they switch on. Done when no rule, with its options, already does the job. If one does, switch it on in its preset instead.
2. **Dump the AST** of a snippet the rule must report and of one it must accept: `bun run dump-ast tsx '<div className="m-4" />'` (or `ts`, `jsx`, `js`; without the code argument it reads stdin, e.g. `< src/file.ts`). It prints the nodes your visitors receive, as oxlint parses them, without what every node has: `parent`, positions (`range`, `loc`, `start`, `end`), comments and tokens. Done when every node type and other property the rule reads appears in a dump.
3. **Write the rule** in `src/custom/<rule-id>.ts` with `defineRule` from `@oxlint/plugins`, or with a helper built on it such as `createViewOnlyRule`, exported as `<camelCaseId>Rule`, starting with a comment that says what it flags and what it leaves alone. Start from the closest existing rule:
   - code inside React components only: the rules in `view-only-rules.ts`, built with `createViewOnlyRule` from `view-only-component.ts`. It decides what counts as a component, more narrowly than React does (its header comment has the definition), and reports at `Program:exit`, because the JSX that makes a function a component usually comes after the code being checked. Calls by name: `plain-call.ts`.
   - a statement and the statements after it: `use-abort-controller-for-multiple-listeners.ts`
   - comments, or the whole file: `no-bare-enable-directive.ts`
   - options (`meta.schema`, `meta.defaultOptions`): `enforce-namespace-import.ts`
   - autofix (`meta.fixable`, `fix`): `require-jsx-return-type.ts`
   - variable lookups through scopes: `no-provider-with-static-children.ts`
   - class names in JSX strings: `no-margin-on-root-jsx.ts`
4. **Switch it on.** Add it to the `rules` of `src/custom/oxlint-plugin.ts`, then give it a severity in `src/oxlint/custom.ts`: in `customConfig` for every file, or in `customReactConfig` for React components (`**/*.tsx`). A rule about style or structure also goes `"off"` in `vendoredRules` (`src/oxlint/vendored.ts`): generated UI, such as shadcn components, doesn't follow our conventions.
5. **Test it** in `src/custom/<rule-id>.test.ts`: `createRuleTester("ts" | "tsx")` from `./rule-tester.ts`, then `ruleTester.run(id, rule, { valid, invalid })` at the top level, under the same `oxlint-disable vitest-js/require-hook` comment as the other suites (RuleTester registers its own `describe`/`it`). Invalid cases give `messageId` (plus `data`, `line` or `column` where they matter) and `output` when the rule fixes. Columns count from 0 in oxlint's RuleTester, where ESLint's count from 1. Run one file with `bun run test -- src/custom/<rule-id>.test.ts`. Done when every branch of the rule has a case, and every near miss has a valid case.
6. **Check it on real code.** In `packages/lint`: `bun run test`, `bun run lint:oxlint`, `bun run typecheck`. Then from the repo root: `bun run postinstall`, which rebuilds the package (the workspaces load its built `dist/`, so without it they run the old rules), and `bun run lint:oxlint`. Done when the root run passes, with every new report fixed or suppressed with a reason (`// oxlint-disable-next-line custom/<rule-id> -- <reason>`).
7. **Bump the version** in `packages/lint/package.json` and, to match, the `version` under `"packages/lint"` in `bun.lock` (`bun install` leaves that one stale), in the same change. A rule that reports errors is a minor bump while the package is 0.x. The `lint-vX.Y.Z` tag that publishes it is pushed once the change is on `main` (AGENTS.md, Tooling Notes).

## Where oxlint differs from ESLint

- Node types come from `ESTree` in `@oxlint/plugins`: `ESTree.Node` is the union of all nodes, and node types with the same shape share an interface: `ESTree.Function` for `FunctionDeclaration` and `FunctionExpression`, `ESTree.Class` for both class nodes (the `type` unions in the package's `index.d.ts` list them). The package's top-level `Node` is only a span, which is what `report` takes.
- JSX strings keep their HTML entities: `className="m-&#45;4"` arrives as `m-&#45;4` (ESLint's parser gave `m--4`). Decode with `decodeJsxEntities` before matching, as `no-margin-on-root-jsx.ts` does. A string literal's `raw` can be `null`.
- oxlint validates options against `meta.schema` and merges `meta.defaultOptions` before `create` runs, but `context.options` is typed as plain JSON: narrow it with a type guard.
- Rules see syntax only: no type checker, no parser services. A check that needs types belongs to oxlint's type-aware rules (`"type_aware": true` in the rule list), not to a custom rule.
- RuleTester refuses to run on Bun. `bun run test` starts vitest on Node through `vitest-on-node.ts`, and `dump-ast` runs on Node too.
