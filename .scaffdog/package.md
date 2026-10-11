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
        "lint:oxlint": "oxlint-fix .",
        "typecheck": "tsc --noEmit",
        "test": "vitest --run --passWithNoTests --reporter=tree"
    },
    "exports": {
        ".": "./index.ts"
    }
}
```

# `{{ inputs.packageName | kebab }}/oxlint.config.ts`

```typescript
import { createOxlintConfig } from "@deluxeowl/lint/oxlint"

export default createOxlintConfig()
```

# `{{ inputs.packageName | kebab }}/tsconfig.json`

```json
{
    "extends": "../../tsconfig.base.json",
    "include": [
        "**/*.ts",
        "index.ts",
        "../../reset.d.ts"
    ],
    "exclude": []
}
```

# `{{ inputs.packageName | kebab }}/index.ts`

```typescript
export {}
```
