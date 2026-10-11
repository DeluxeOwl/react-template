import type { PluginSpec } from "../spec.ts"

export default {
    dir:     "vitest",
    install: { "@vitest/eslint-plugin": "1.6.16" },
    layout:  { kind: "plugin", pluginFile: "dist/index.mjs" },
    patches: {
        "index.mjs": [
            [
                `import { DefinitionType } from "@typescript-eslint/scope-manager";`,
                `const DefinitionType = { ImportBinding: "ImportBinding" };`,
                "inline the only scope-manager constant the bundle reads; its ImportBinding value is exactly the string returned by both ESLint and oxlint scope definitions",
            ],
            [
                `if (parsePluginSettings(context.settings).typecheck) assertFunctionNames.push("expectTypeOf", "assertType");`,
                `if (parsePluginSettings(context.settings).typecheck) assertFunctionNames = [...assertFunctionNames, "expectTypeOf", "assertType"];`,
                "oxlint freezes nested options arrays; copy before adding the type-testing assertion names instead of mutating assertFunctionNames",
            ],
            [
                `member.parent.parent.typeArguments !== void 0`,
                `member.parent.parent.typeArguments != null`,
                "oxc uses null for absent CallExpression.typeArguments; typescript-estree uses undefined (nullish absence is equivalent)",
            ],
            [
                `const eslintRequire = createRequire(createRequire(import.meta.url).resolve("eslint"));\nconst espreeParser = eslintRequire.resolve("espree");`,
                `// The bundled espreeParser export is unused by the enabled rules.\n// Do not resolve ESLint just to construct that unused path.`,
                "remove the unused espreeParser resolution so the port does not depend on ESLint at runtime",
            ],
            [
                `const baseRule = (() => {\n\ttry {\n\t\treturn require$1("@typescript-eslint/eslint-plugin").rules["unbound-method"];\n\t} catch (error) {\n\t\tconst errorCode = typeof error === "object" && error !== null && "code" in error ? error.code : void 0;\n\t\tif (errorCode === "MODULE_NOT_FOUND" || errorCode === "ERR_REQUIRE_ESM") return null;\n\t\tthrow error;\n\t}\n})();`,
                `// unbound-method is not vendored: oxlint JS plugins have no parser services.\n// Do not import a third-party ESLint plugin merely to load the other rules.\nconst baseRule = null;`,
                "remove the eager @typescript-eslint/eslint-plugin import for the non-portable unbound-method rule (never enabled in the port preset)",
            ],
        ],
    },
    pkg:    "@vitest/eslint-plugin",
    prefix: "vitest",
} satisfies PluginSpec
