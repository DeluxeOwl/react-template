import { readFileSync } from "node:fs"
import { defineRule } from "@oxlint/plugins"
import { RuleTester } from "oxlint/plugins-dev"

// Prints the AST oxlint gives JS plugin rules (Oxc's ESTree): the nodes a rule's visitors receive.
// Positions, parents, comments and tokens are left out. Run with node from packages/lint
// (oxlint's RuleTester refuses Bun); the code comes from the argument, or from stdin without one:
//   node scripts/dump-ast.ts tsx '<div className="m-4" />'
//   node scripts/dump-ast.ts ts < src/custom/prefer-state-class.ts
const languages = ["js", "jsx", "ts", "tsx"] as const
const hiddenKeys = new Set(["end", "loc", "range", "start", "parent", "tokens", "comments"])
const JsonIndent = 2
// argv: the runtime and this file, then the language and the code.
const launcherArgumentCount = 2

type Language = typeof languages[number]

function isLanguage(value: string | undefined): value is Language {
    return languages.some((language) => language === value)
}

function dumpAST(lang: Language, code: string): void {
    RuleTester.describe = (_, callback) => {
        callback()
    }
    RuleTester.it = (_, callback) => {
        callback()
    }

    const dumpRule = defineRule({
        create: () => ({
            Program(node) {
                console.log(JSON.stringify(node, (key, value: unknown) => (hiddenKeys.has(key) ? undefined : value), JsonIndent))
            },
        }),
        meta: { schema: [] },
    })

    new RuleTester({ languageOptions: { parserOptions: { lang }, sourceType: "module" } })
        .run("dump-ast", dumpRule, { invalid: [], valid: [code] })
}

const cliArguments = process.argv.slice(launcherArgumentCount)
const lang = cliArguments.at(0)

if (isLanguage(lang)) {
    dumpAST(lang, cliArguments.at(1) ?? readFileSync(0, "utf8"))
} else {
    console.error("usage: node scripts/dump-ast.ts <js|jsx|ts|tsx> [code]   (code from stdin when omitted)")
    process.exitCode = 1
}
