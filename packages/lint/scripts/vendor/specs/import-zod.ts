import type { PluginSpec } from "../spec.ts"

// Upstream declares MIT in package.json, but ships no separate LICENSE/copyright
// notice. Preserve its declared license, source attribution, and the MIT grant in
// the copied module, rather than invent an upstream copyright statement.
const licenseNotice = `/*
 * eslint-plugin-import-zod@1.2.1
 * Source: https://github.com/samchungy/eslint-plugin-import-zod/tree/v1.2.1
 * SPDX-License-Identifier: MIT (declared in upstream package.json)
 * Upstream ships no separate copyright notice or LICENSE file.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */`

export default {
    dir:     "import-zod",
    install: { "eslint-plugin-import-zod": "1.2.1" },
    layout:  { kind: "plugin", pluginFile: "dist/index.mjs" },
    patches: {
        "index.mjs": [
            [
                "import { ESLintUtils, TSESTree } from \"@typescript-eslint/utils\";",
                `${licenseNotice}\nimport * as ESLintUtils from "@typescript-eslint/utils/eslint-utils";\nimport { TSESTree } from "@typescript-eslint/types";`,
                "Keep upstream attribution and its declared MIT permission (the npm package and tagged repo omit LICENSE). Import the same RuleCreator and AST enums through pure helper entry points, avoiding the utils root's eager ESLint runtime import.",
            ],
        ],
    },
    pkg:    "eslint-plugin-import-zod",
    prefix: "import-zod",
} satisfies PluginSpec
