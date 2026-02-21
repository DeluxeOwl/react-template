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
    "module": "index.ts",
    "type": "module",
    "private": true,
    "devDependencies": {},
    "peerDependencies": {
        "typescript": "^5"
    },
    "scripts": {
        "lint:oxlint": "oxlint --fix .",
        "lint:eslint": "eslint --fix .",
        "typecheck": "tsc -b --noEmit"
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
        "../../oxlint.typescript.json"
    ]
}
```

# `{{ inputs.packageName | kebab }}/eslint.config.ts`

```typescript
import config from "@react-template/eslint"
import {
    defineConfig,
} from "eslint/config"

export default defineConfig([
    {
        extends: [config(import.meta.dir)],
    },
])
```

# `{{ inputs.packageName | kebab }}/tsconfig.json`

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "composite": true,
        "noEmit": false,
        "outDir": "./dist"
    },
    "include": [
        "src",
        "*.ts",
        "index.ts",
        "eslint.config.ts",
        "../../reset.d.ts"
    ],
    "exclude": []
}
```

# `{{ inputs.packageName | kebab }}/index.ts`

```typescript
export * from "./src"
```

# `{{ inputs.packageName | kebab }}/src/index.ts`

```typescript
export {}
```
