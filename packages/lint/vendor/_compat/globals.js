// Gives JS-plugin rules the browser globals ESLint gave them, without changing oxlint's native rules.
//
// In ESLint, every JS/TS file of a React workspace had the browser globals of the `globals` package
// (`languageOptions.globals`, which came from react-you-might-not-need-an-effect's preset), so scope
// analysis declared `window`, `name`, `event`, ... as global variables. Some rules depend on that:
// unicorn/consistent-destructuring does not ask to destructure `props.name` when the name `name` is
// already taken by a global. oxlint's own `globals`/`env` config would reach its native rules too,
// which never had these globals: native no-redeclare would then report every `name` or `event`
// binding, and no-implied-eval `setTimeout(foo, 0)`.
//
// So a preset asks for them in its settings (`settings["@deluxeowl/lint"].globals: "browser"`), and
// the first JS-plugin rule created for a file adds them to the file's scope, which all JS-plugin
// rules share. This is what ESLint does with configured globals when the parser is typescript-eslint
// (scopeManager.addGlobals → globalScope.addVariables, then `writeable` from the config). Names the
// scope already declares (oxlint's `builtin` env and `globals` config) are left as they are.

import globals from "globals"

const sets = { browser: globals.browser }
const done = new WeakSet()

export function addConfiguredGlobals(context) {
    const name = context.settings?.["@deluxeowl/lint"]?.globals
    if (typeof name !== "string" || !Object.hasOwn(sets, name)) {
        return
    }
    const set = sets[name]
    const { globalScope } = context.sourceCode.scopeManager
    if (globalScope === null || done.has(globalScope)) {
        return
    }
    done.add(globalScope)
    const names = Object.keys(set).filter((global) => !globalScope.set.has(global))
    globalScope.addVariables(names)
    for (const global of names) {
        const variable = globalScope.set.get(global)
        variable.writeable = set[global]
        variable.eslintImplicitGlobalSetting = set[global] ? "writable" : "readonly"
        variable.eslintExplicitGlobal = false
    }
}
