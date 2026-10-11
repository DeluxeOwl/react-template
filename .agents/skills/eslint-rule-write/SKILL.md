---
name: eslint-rule-write
description: Custom lint rules — our oxlint JS plugin rules (ESLint's rule API) in packages/lint/src/custom, tested with oxlint's RuleTester. Load before writing or changing one.
---

# Custom lint rules

Our rules live in `packages/lint/src/custom/`, as `<rule>.ts` plus `<rule>.test.ts`. oxlint runs them as the JS plugin `custom` (`src/custom/oxlint-plugin.ts`), and `src/oxlint/custom.ts` sets their severities. They use oxlint's plugin API (`@oxlint/plugins`), which has ESLint's rule shape: `meta` plus `create(context)` returning visitors keyed by node type. The rules in `packages/lint/vendor/` are generated copies of upstream plugins; this skill is for ours.

## Steps

Run the commands in `packages/lint`.

1. **Dump the AST** of a snippet the rule must report and of one it must accept: `bun run dump-ast tsx '<div className="m-4" />'` (or `ts`; without a code argument it reads stdin, e.g. `< src/file.ts`). It prints the nodes your visitors receive, as oxlint parses them. Done when every node type and property the rule reads appears in a dump.
2. **Write the rule** with `defineRule` from `@oxlint/plugins`, exported as `<name>Rule`. Register it in `src/custom/oxlint-plugin.ts` and give it a severity in `src/oxlint/custom.ts`. Start from the closest existing rule:
   - comments, or the whole file: `no-bare-enable-directive.ts`
   - options (`meta.schema`, `meta.defaultOptions`): `enforce-namespace-import.ts`
   - autofix (`meta.fixable`, `fix`): `require-jsx-return-type.ts`
   - variable lookups through scopes: `no-provider-with-static-children.ts`
   - class names in JSX strings: `no-margin-on-root-jsx.ts`
3. **Test it** in `<rule>.test.ts`: `createRuleTester("ts" | "tsx")` from `./rule-tester.ts`, then `ruleTester.run(name, rule, { valid, invalid })` at the top level of the file, under the same `oxlint-disable vitest-js/require-hook` comment as the other suites (RuleTester registers its own `describe`/`it`). Invalid cases give `messageId` (plus `data` or `line` where they matter) and `output` when the rule fixes. Done when every branch of the rule has a case, and every near miss has a valid case.
4. **Check**: `bun run test`, `bun run lint:oxlint`, `bun run typecheck`. Then `bun run build`, because the other workspaces load the built plugin (`dist/custom/oxlint-plugin.js`), and `bun run lint:oxlint` from the repo root to see the rule on real code.

## Where oxlint differs from ESLint

- Node types come from `ESTree` in `@oxlint/plugins`: `ESTree.Node` is the union of all nodes. The package's top-level `Node` is only a span, which is what `report` takes.
- JSX strings keep their HTML entities: `className="m-&#45;4"` arrives as `m-&#45;4` (ESLint's parser gave `m--4`). Decode with `decodeJsxEntities` before matching, as `no-margin-on-root-jsx.ts` does. A string literal's `raw` can be `null`.
- oxlint validates options against `meta.schema` and merges `meta.defaultOptions` before `create` runs, but `context.options` is typed as plain JSON: narrow it with a type guard.
- Rules see syntax only: no type checker, no parser services.
- RuleTester refuses to run on Bun. `bun run test` starts vitest on Node through `vitest-on-node.ts`, and `dump-ast` runs on Node too.
