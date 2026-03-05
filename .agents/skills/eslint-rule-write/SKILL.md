---
name: eslint-rule-write
description: Write eslint rules and test them.
---

Testing Custom ESLint Rules (ESLint v9 + typescript-eslint + Vitest)

IMPORTANT: We use `@typescript-eslint/rule-tester` — NOT `eslint`'s built-in `RuleTester`.
The built-in ESLint v9 `RuleTester` expects `RuleDefinition` from `@eslint/core`, which is
incompatible with the `RuleModule` type returned by `ESLintUtils.RuleCreator` from
`@typescript-eslint/utils`. Using the wrong one causes type errors about missing context
methods (`getAncestors`, `getDeclaredVariables`, etc.).

Writing a custom rule:
1. Create the rule file (e.g., `my-rule.ts`) using `ESLintUtils.RuleCreator` from
   `@typescript-eslint/utils`. This gives you typed `context`, `node`, and `messageId`.
   See `no-margin-on-root-jsx.ts` for a full example.
2. Export the rule as a named constant (e.g., `export const myRule = ...`).

Writing the test file:
1. Import `RuleTester` from `@typescript-eslint/rule-tester` (NOT from `eslint`).
2. Import `afterAll`, `describe`, `it` from `vitest` and wire them up:
     RuleTester.afterAll = afterAll
     RuleTester.describe = describe
     RuleTester.it = it
3. Create a `RuleTester` instance with `languageOptions` (flat config style).
4. Call `ruleTester.run()` at the TOP LEVEL of the file (or directly inside a `describe`).
   Do NOT wrap it inside an `it()` block — `@typescript-eslint/rule-tester` generates
   its own `describe`/`it` blocks internally, and nesting causes vitest errors.
5. Provide `valid` (code that should pass) and `invalid` (code that should fail) test cases.
   Use `messageId` strings that match the rule's `meta.messages` keys.

Example:

```ts
/* eslint-disable vitest/require-hook */
import { RuleTester } from "@typescript-eslint/rule-tester"
import { afterAll, describe, it } from "vitest"
import tseslint from "typescript-eslint"
import { myRule } from "./my-rule"

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: 2020, sourceType: "module", ecmaFeatures: { jsx: true } },
  },
})

ruleTester.run("my-rule", myRule, {
  valid: [{ code: `...` }],
  invalid: [{ code: `...`, errors: [{ messageId: "myMessageId" }] }],
})
```

---

## How to get the AST efficiently

When writing custom ESLint rules you need to know the exact node types, property names,
and tree structure that the parser produces for a given snippet of code. Instead of
guessing, dump the AST first, then write your visitor against it.

All commands below must be run from **`packages/eslint/`** (the package that has
`typescript-eslint` installed).

### 1 — Inline snippet (simplest)

Pass the code as a CLI argument:

```bash
cd packages/eslint

bun -e '
import tseslint from "typescript-eslint";
const code = process.argv[1];
const { ast } = tseslint.parser.parseForESLint(code, {
  ecmaVersion: 2020,
  sourceType: "module",
  ecmaFeatures: { jsx: true },
});
console.log(JSON.stringify(ast, (k, v) =>
  k === "loc" || k === "range" || k === "tokens" || k === "comments" ? undefined : v
, 2));
' 'const x: string = "hello"'
```

The `JSON.stringify` replacer strips `loc`, `range`, `tokens`, and `comments` so you
only see the structural nodes — much easier to read.

#### Example output

```json
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "x",
            "typeAnnotation": {
              "type": "TSTypeAnnotation",
              "typeAnnotation": { "type": "TSStringKeyword" }
            }
          },
          "init": { "type": "Literal", "value": "hello" }
        }
      ],
      "kind": "const"
    }
  ],
  "sourceType": "module"
}
```

### 2 — JSX snippet

Same command, just change the argument. Use single-quotes around the argument so the
shell doesn't eat the JSX angle brackets:

```bash
bun -e '
import tseslint from "typescript-eslint";
const code = process.argv[1];
const { ast } = tseslint.parser.parseForESLint(code, {
  ecmaVersion: 2020,
  sourceType: "module",
  ecmaFeatures: { jsx: true },
});
console.log(JSON.stringify(ast, (k, v) =>
  k === "loc" || k === "range" || k === "tokens" || k === "comments" ? undefined : v
, 2));
' 'export const Comp = () => <div className="m-4"><span>hi</span></div>'
```

Look at the output to find the node types you'll target in your rule — for example
`JSXOpeningElement`, `JSXAttribute`, `JSXIdentifier`, etc.

### 3 — Multiline code via stdin

For longer snippets, pipe them in:

```bash
echo 'function greet(name: string): JSX.Element {
  return (
    <div className="p-4">
      <h1>Hello {name}</h1>
    </div>
  )
}' | bun -e '
import tseslint from "typescript-eslint";
const code = await Bun.stdin.text();
const { ast } = tseslint.parser.parseForESLint(code, {
  ecmaVersion: 2020,
  sourceType: "module",
  ecmaFeatures: { jsx: true },
});
console.log(JSON.stringify(ast, (k, v) =>
  k === "loc" || k === "range" || k === "tokens" || k === "comments" ? undefined : v
, 2));
'
```

### 4 — Parse an existing file

Point it at any `.ts` / `.tsx` file in the repo:

```bash
bun -e '
import tseslint from "typescript-eslint";
const code = await Bun.file(process.argv[1]).text();
const { ast } = tseslint.parser.parseForESLint(code, {
  ecmaVersion: 2020,
  sourceType: "module",
  ecmaFeatures: { jsx: true },
});
console.log(JSON.stringify(ast, (k, v) =>
  k === "loc" || k === "range" || k === "tokens" || k === "comments" ? undefined : v
, 2));
' custom/discriminated-union.ts
```

### Tips

- **Pipe into `less` or `head`** for large outputs: append `| head -100` or `| less`.
- **Search for a node type** quickly: pipe into `grep -i "JSXAttribute"`.
- The node `type` strings (e.g. `"JSXOpeningElement"`, `"TSTypeAnnotation"`) map
  directly to `TSESTree.AST_NODE_TYPES.*` and to the visitor keys you use in your
  rule's `create()` method.
- Always dump the AST for **both** your valid and invalid test cases before writing the
  rule — it removes all guesswork about the tree shape.