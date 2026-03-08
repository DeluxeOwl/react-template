/* eslint-disable vitest/require-hook */
import tseslint from "typescript-eslint"
import {
    it, afterAll, describe,
} from "vitest"
import { RuleTester } from "@typescript-eslint/rule-tester"

import { type Options, enforceNamespaceImportRule } from "./enforce-namespace-import"

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
    languageOptions: {
        parser:        tseslint.parser,
        parserOptions: {
            ecmaVersion: 2020,
            sourceType:  "module",
        },
    },
})

const options: Options = [{ packages: ["@react-template"] }]

ruleTester.run("enforce-namespace-import", enforceNamespaceImportRule, {
    invalid: [
        // Named import — must use namespace
        {
            code:    `import { contract } from "@react-template/domain/todos"`,
            errors:  [{ messageId: "mustBeNamespace" }],
            options: options,
        },
        // Default import — must use namespace
        {
            code:    `import todos from "@react-template/domain/todos"`,
            errors:  [{ messageId: "mustBeNamespace" }],
            options: options,
        },
        // Side-effect with type import — must use namespace
        {
            code:    `import type { Contract } from "@react-template/domain/todos"`,
            errors:  [{ messageId: "mustBeNamespace" }],
            options: options,
        },
        // Namespace import but wrong local name (completely different name)
        {
            code:    `import * as foo from "@react-template/domain/todos"`,
            errors:  [{ messageId: "wrongLocalName" }],
            options: options,
        },
        // Wrong name — uppercase acronym style
        {
            code:    `import * as todosADAPTER from "@react-template/todos-adapter"`,
            errors:  [{ messageId: "wrongLocalName" }],
            options: options,
        },
        // Wrong name — partial name
        {
            code:    `import * as todo from "@react-template/todos-adapters"`,
            errors:  [{ messageId: "wrongLocalName" }],
            options: options,
        },
        // Wrong name — snake_case not converted to camelCase
        {
            code:    `import * as something_else from "@react-template/todos/something_else"`,
            errors:  [{ messageId: "wrongLocalName" }],
            options: options,
        },
        // Side-effect import (no specifiers) is still a plain import — not namespace
        {
            code:    `import "@react-template/domain/todos"`,
            errors:  [{ messageId: "mustBeNamespace" }],
            options: options,
        },
        // Multiple named imports
        {
            code:    `import { a, b, c } from "@react-template/utils"`,
            errors:  [{ messageId: "mustBeNamespace" }],
            options: options,
        },
    ],
    valid: [
        // Correct namespace import — simple last segment
        {
            code:    `import * as todos from "@react-template/domain/todos"`,
            options: options,
        },
        // Correct namespace import — kebab-case converted to camelCase
        {
            code:    `import * as todosAdapters from "@react-template/todos-adapters"`,
            options: options,
        },
        // Correct namespace import — snake_case last segment
        {
            code:    `import * as somethingElse from "@react-template/todos/something_else"`,
            options: options,
        },
        // Correct namespace import — single segment after scope
        {
            code:    `import * as utils from "@react-template/utils"`,
            options: options,
        },
        // Package not in the configured list — any import style is fine
        {
            code:    `import { contract } from "some-other-package"`,
            options: options,
        },
        // Different scoped package not in list
        {
            code:    `import { foo } from "@other-scope/domain/todos"`,
            options: options,
        },
        // Named import from a non-configured package
        {
            code:    `import * as bar from "@other-scope/bar"`,
            options: options,
        },
        // Multiple configured packages — each must follow the rule
        {
            code:    `import * as todos from "@react-template/domain/todos"`,
            options: [{ packages: ["@react-template", "@my-app"] }],
        },
        {
            code:    `import * as utils from "@my-app/utils"`,
            options: [{ packages: ["@react-template", "@my-app"] }],
        },
        // Kebab with multiple words
        {
            code:    `import * as myFeatureModule from "@react-template/my-feature-module"`,
            options: options,
        },
    ],
})
