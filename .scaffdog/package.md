---
name: "package"
root: "."
output: "packages"
ignore: []
questions:
  packageName: "What is the name of the package?"
---

# `{{ inputs.packageName | kebab }}/package.json`

```json
{
    "name": "@react-template/{{ inputs.packageName | kebab }}",
    "version": "0.0.1",
    "type": "module",
    "private": true,
    "devDependencies": {
        "@types/node": "catalog:",
        "vitest": "catalog:"
    },
    "peerDependencies": {
        "typescript": "catalog:"
    },
    "scripts": {
        "lint:oxlint": "oxlint --fix .",
        "lint:eslint": "eslint --fix .",
        "typecheck": "tsc --noEmit",
        "test": "vitest --run --passWithNoTests --reporter=tree"
    },
    "exports": {
        ".": "./index.ts"
    }
}
```

# `{{ inputs.packageName | kebab }}/.oxlintrc.json`

```json
{
    "extends": [
        "../../node_modules/@deluxeowl/lint/oxlint/typescript.json"
    ]
}
```

# `{{ inputs.packageName | kebab }}/eslint.config.ts`

```typescript
import config from "@deluxeowl/lint"
import {
    defineConfig,
} from "eslint/config"

export default defineConfig([
    {
        extends: [config(import.meta.dirname)],
    },
])
```

# `{{ inputs.packageName | kebab }}/tsconfig.json`

```json
{
    "extends": "../../tsconfig.base.json",
    "include": [
        "**/*.ts",
        "index.ts",
        "eslint.config.ts",
        "../../reset.d.ts"
    ],
    "exclude": []
}
```

# `{{ inputs.packageName | kebab }}/index.ts`

```typescript
export {}
```
