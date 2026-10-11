import type { PluginSpec } from "../spec.ts"

import eslint from "./eslint.ts"
import vitest from "./vitest.ts"
import sweepit from "./sweepit.ts"
import unicorn from "./unicorn.ts"
import importX from "./import-x.ts"
import stylistic from "./stylistic.ts"
import importZod from "./import-zod.ts"
import reactHooks from "./react-hooks.ts"
import eslintReact from "./eslint-react.ts"
import reactRefresh from "./react-refresh.ts"
import perfectionist from "./perfectionist.ts"
import tanstackQuery from "./tanstack-query.ts"
import unusedImports from "./unused-imports.ts"
import typescriptEslint from "./typescript-eslint.ts"
import reactRenderTypes from "./react-render-types.ts"
import betterTailwindcss from "./better-tailwindcss.ts"
import youMightNotNeedAnEffect from "./react-you-might-not-need-an-effect.ts"

// Every vendored plugin (packages/lint/vendor/<dir>).
export const specs: PluginSpec[] = [
    betterTailwindcss,
    eslint,
    eslintReact,
    importX,
    importZod,
    perfectionist,
    reactHooks,
    reactRefresh,
    reactRenderTypes,
    youMightNotNeedAnEffect,
    stylistic,
    sweepit,
    tanstackQuery,
    typescriptEslint,
    unicorn,
    unusedImports,
    vitest,
]
