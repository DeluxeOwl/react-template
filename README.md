A template for building web, mobile (Expo), and server applications in a single repository with shared packages. Uses Bun as the package manager and runtime.

```bash
bun create github.com/DeluxeOwl/react-template <your-app>
```

- [Repository Structure](#repository-structure)
- [Core Concepts](#core-concepts)
  - [What is a Monorepo?](#what-is-a-monorepo)
  - [What are Workspaces?](#what-are-workspaces)
  - [What is Hoisting?](#what-is-hoisting)
- [Workspaces Configuration](#workspaces-configuration)
  - [How Internal Dependencies Work](#how-internal-dependencies-work)
  - [Why Package Names Must Be Explicit](#why-package-names-must-be-explicit)
- [TypeScript Configuration](#typescript-configuration)
  - [The Base Configuration](#the-base-configuration)
  - [Project References](#project-references)
  - [The sync-tsconfig Script](#the-sync-tsconfig-script)
  - [Type Augmentation with reset.d.ts](#type-augmentation-with-resetdts)
  - [Per-Package Configuration](#per-package-configuration)
- [Linting Architecture](#linting-architecture)
  - [Why Two Linters?](#why-two-linters)
  - [OxLint Configuration](#oxlint-configuration)
  - [ESLint Shared Package](#eslint-shared-package)
  - [How the Linters Work Together](#how-the-linters-work-together)
- [Type Checking with tsgo](#type-checking-with-tsgo)
- [Dead Code Detection with Knip](#dead-code-detection-with-knip)
- [Development Environment](#development-environment)
  - [Devbox](#devbox)
  - [direnv](#direnv)
  - [Git Hooks with Lefthook](#git-hooks-with-lefthook)
- [Scripts Reference](#scripts-reference)
  - [Root `package.json` scripts](#root-packagejson-scripts)
  - [Per-package scripts](#per-package-scripts)
- [VS Code Integration](#vs-code-integration)
- [Adding New Packages](#adding-new-packages)
  - [Adding a Library Package](#adding-a-library-package)
  - [Adding a React Application](#adding-a-react-application)
- [Troubleshooting](#troubleshooting)
  - ["Cannot find module '@react-template/xxx'"](#cannot-find-module-react-templatexxx)
  - [Type errors about missing references](#type-errors-about-missing-references)
  - [ESLint errors about missing tsconfig](#eslint-errors-about-missing-tsconfig)
  - [OxLint not finding the config](#oxlint-not-finding-the-config)
  - [Changes to shared package not reflecting in app](#changes-to-shared-package-not-reflecting-in-app)
  - [VS Code not recognizing types from internal packages](#vs-code-not-recognizing-types-from-internal-packages)
  - [Lefthook hooks not running](#lefthook-hooks-not-running)

---

## Repository Structure

```
react-template/
├── apps/
│   └── web/                    # React web application (Vite + React 19)
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json       # Solution-style (references app + server configs)
│       ├── tsconfig.app.json   # For React source code
│       ├── tsconfig.server.json# For Node.js files (vite.config.ts)
│       ├── eslint.config.ts    # Uses React ESLint config
│       └── .oxlintrc.json      # Extends oxlint.react.json
│
├── packages/
│   ├── eslint/                 # Shared ESLint configuration package
│   │   ├── index.ts            # Base config (for libs/server)
│   │   ├── react/index.ts      # React config (extends base)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .oxlintrc.json
│   │
│   └── math/                   # Example shared library package
│       ├── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── eslint.config.ts    # Uses base ESLint config
│       └── .oxlintrc.json      # Extends oxlint.typescript.json
│
├── scripts/                    # Monorepo utility scripts
│   ├── sync-tsconfig-references.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .oxlintrc.json
│
├── package.json                # Root package.json (workspaces + shared dev deps)
├── tsconfig.json               # Root tsconfig (references all projects)
├── tsconfig.base.json          # Shared TypeScript compiler options
├── oxlint.typescript.json      # Base OxLint config for all TypeScript
├── oxlint.react.json           # OxLint config for React (extends base)
├── reset.d.ts                  # TypeScript type augmentations
├── knip.json                   # Dead code detection config
├── devbox.json                 # Development environment definition
├── lefthook.yml                # Git hooks configuration
└── .vscode/settings.json       # VS Code workspace settings
```

---

## Core Concepts

### What is a Monorepo?

A monorepo (monolithic repository) is a single Git repository that contains multiple projects. Instead of having separate repositories for your web app, mobile app, and shared utilities, everything lives together.

**Benefits:**

- Share code easily between projects (e.g., validation logic, types, utilities)
- Make atomic changes across multiple packages in one commit
- Single set of tooling configuration (linters, TypeScript, etc.)
- Easier dependency management

**In this template:**

- `apps/` contains deployable applications (web, future mobile/server)
- `packages/` contains shared libraries used by apps

### What are Workspaces?

Workspaces are a feature of package managers (Bun, npm, yarn, pnpm) that lets you manage multiple packages in a single repository. When you run `bun install` at the root, Bun:

1. Reads the `workspaces` field in the root `package.json`
2. Finds all packages matching those patterns
3. Links them together so they can import each other
4. Installs all dependencies for all packages

The root `package.json` defines workspaces like this:

```json
{
    "workspaces": [
        "apps/*",
        "packages/*",
        "scripts"
    ]
}
```

This tells Bun: "Everything inside `apps/`, `packages/`, and the `scripts` folder is a workspace package."

### What is Hoisting?

When Bun installs dependencies, it "hoists" them to the root `node_modules/` directory when possible. This means:

1. **Shared dependencies are installed once** - If both `apps/web` and `packages/math` need `typescript`, it's installed once at the root.
2. **Binaries are available everywhere** - Tools like `eslint`, `oxlint`, and `tsgo` are installed as root dev dependencies, making them available to all packages without each package needing to install them.
3. **Disk space is saved** - No duplicate copies of the same package version.

```
react-template/
├── node_modules/           # Hoisted dependencies live here
│   ├── .bin/               # All CLI tools (eslint, oxlint, tsgo, etc.)
│   ├── react/
│   ├── typescript/
│   └── ...
├── apps/web/
│   └── node_modules/       # Only web-specific or conflicting versions
└── packages/math/
    └── node_modules/       # Only math-specific or conflicting versions
```

---

## Workspaces Configuration

### How Internal Dependencies Work

To use one internal package from another, you:

1. Add it as a dependency using the `workspace:*` protocol
2. Import it by its package name

Example: `apps/web` uses the `@react-template/math` package:

```json
// apps/web/package.json
{
    "dependencies": {
        "@react-template/math": "workspace:*"
    }
}
```

```typescript
// apps/web/src/app.tsx
import { sum } from "@react-template/math"
```

The `workspace:*` protocol tells Bun: "This dependency is another package in this monorepo, use whatever version it has."

### Why Package Names Must Be Explicit

**Important:** You must manually set the `name` field in each package's `package.json`. There's no automatic way for Bun (or any package manager) to "discover" that a package is internal.

```json
// packages/math/package.json
{
  "name": "@react-template/math",  // You must set this explicitly
  "version": "0.0.1",
  ...
}
```

When another package imports `@react-template/math`, Bun looks for a package with that exact name. The folder name (`math`) doesn't matter - only the `name` field does.

**Convention:** Use a scope (`@react-template/`) for all internal packages. This:

- Prevents name collisions with npm packages
- Makes it clear which imports are internal vs external
- Groups your packages together in `node_modules/@react-template/`

---

## TypeScript Configuration

TypeScript configuration in a monorepo has two main challenges:

1. Sharing compiler options across all packages
2. Making TypeScript understand the relationships between packages

### The Base Configuration

All packages extend from `tsconfig.base.json` at the root:

```json
// tsconfig.base.json
{
    "compilerOptions": {
        // Build output location for incremental compilation cache
        "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo",

        // Use modern ES modules
        "module": "ESNext",

        // "bundler" works with Vite, Bun, and other modern bundlers
        "moduleResolution": "bundler",

        // Don't type-check node_modules (faster)
        "skipLibCheck": true,

        // Require explicit `type` keyword for type-only imports
        "verbatimModuleSyntax": true,

        // Treat all files as modules (not scripts)
        "moduleDetection": "force",

        // Generate .d.ts files
        "declaration": true,

        // Source maps for declarations (better IDE navigation)
        "declarationMap": true,

        // Don't emit .js (Bun runs .ts directly)
        "emitDeclarationOnly": true,

        // Maximum type safety
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedSideEffectImports": true,

        // Only allow syntax that can be erased (no enums, namespaces)
        "erasableSyntaxOnly": true
    }
}
```

This base configuration is intentionally generic - it works for:

- Library packages (like `packages/math`)
- React applications (like `apps/web`)
- Server code (future Node.js/Bun servers)
- Scripts (like `scripts/`)

Each package extends this and adds its specific needs:

```
tsconfig.base.json (shared compiler options)
       │
       ├── packages/math/tsconfig.json      (adds: composite, outDir)
       ├── packages/eslint/tsconfig.json    (adds: composite, outDir)
       ├── scripts/tsconfig.json            (adds: composite, lib: ESNext, types: bun)
       │
       └── apps/web/
           ├── tsconfig.app.json            (adds: jsx, lib: DOM, types: vite/client)
           └── tsconfig.server.json         (adds: lib: ES2023, types: node)
```

### Project References

The root `tsconfig.json` is a "solution-style" configuration that doesn't compile anything itself. It just lists all the projects:

```json
// tsconfig.json (root)
{
    "files": [],
    "references": [
        { "path": "./apps/web" },
        { "path": "./packages/eslint" },
        { "path": "./packages/math" },
        { "path": "./scripts" }
    ]
}
```

**What are project references?**

Project references tell TypeScript about the dependency graph between packages. This enables:

1. **Incremental builds** - TypeScript only recompiles packages that changed
2. **Correct build order** - If `apps/web` depends on `packages/math`, TypeScript builds `math` first
3. **Better IDE performance** - VS Code can navigate across package boundaries

For project references to work, each package needs `"composite": true` in its tsconfig:

```json
// packages/math/tsconfig.json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "composite": true, // Required for project references
        "outDir": "./dist"
    },
    "include": ["index.ts", "src", "../../reset.d.ts"]
}
```

### The sync-tsconfig Script

**The pain point:** When you add a new internal dependency (e.g., `apps/web` starts using `packages/utils`), you need to:

1. Add it to `package.json` dependencies
2. Add it to `tsconfig.json` references
3. Add it to the root `tsconfig.json` references

Forgetting step 2 or 3 breaks incremental builds and can cause confusing type errors.

**The solution:** Run `bun run sync:tsconfig` to automatically sync all tsconfig references based on your `package.json` dependencies.

The script (`scripts/sync-tsconfig-references.ts`):

1. Reads all workspace packages from root `package.json`
2. Looks at each package's `dependencies` and `devDependencies`
3. Finds dependencies using `workspace:*` (internal packages)
4. Updates the `references` array in each package's tsconfig
5. Updates the root tsconfig to reference all packages

**Run this after:**

- Adding a new package
- Adding/removing internal dependencies between packages

### Type Augmentation with reset.d.ts

The `reset.d.ts` file at the root imports [@total-typescript/ts-reset](https://github.com/total-typescript/ts-reset):

```typescript
// reset.d.ts
import "@total-typescript/ts-reset"
```

This library improves TypeScript's built-in types. For example:

- `.filter(Boolean)` correctly narrows types (removes `null`/`undefined`)
- `.json()` from `fetch` returns `unknown` instead of `any`
- `Array.isArray()` works better with `readonly` arrays

Every package includes this file in its tsconfig:

```json
{
    "include": ["src", "../../reset.d.ts"]
}
```

### Per-Package Configuration

**Library packages** (`packages/math`, `packages/eslint`):

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "composite": true,
        "outDir": "./dist"
    },
    "include": ["index.ts", "src", "../../reset.d.ts"]
}
```

**React applications** (`apps/web`) use a solution-style config with multiple sub-configs:

```json
// apps/web/tsconfig.json - just references other configs
{
    "files": [],
    "references": [
        { "path": "./tsconfig.app.json" },
        { "path": "./tsconfig.server.json" }
    ]
}
```

```json
// apps/web/tsconfig.app.json - for React source code
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "composite": true,
        "jsx": "react-jsx",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "types": ["vite/client"]
    },
    "include": ["src", "../../reset.d.ts"]
}
```

```json
// apps/web/tsconfig.server.json - for Node.js config files
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "composite": true,
        "lib": ["ES2023"],
        "types": ["node"]
    },
    "include": ["vite.config.ts", "../../reset.d.ts"]
}
```

Why separate configs for apps? Because `vite.config.ts` runs in Node.js (needs Node types), while `src/` runs in the browser (needs DOM types). Mixing them causes type conflicts.

---

## Linting Architecture

### Why Two Linters?

This template uses two linters that work together:

| Linter     | Written in | Speed     | Purpose                          |
| ---------- | ---------- | --------- | -------------------------------- |
| **OxLint** | Rust       | Very fast | Handles most lint rules          |
| **ESLint** | JavaScript | Slower    | Rules OxLint doesn't support yet |

OxLint is 50-100x faster than ESLint but doesn't yet support all ESLint rules. The strategy is:

1. Let OxLint handle everything it can
2. Use ESLint only for what OxLint can't do (formatting, import sorting, some TypeScript rules)

### OxLint Configuration

OxLint configs live at the root and use inheritance:

```
oxlint.typescript.json (base - for all TypeScript code)
       │
       ├─extends─► oxlint.react.json (adds React + JSX accessibility rules)
       │                  │
       │                  ├── apps/web/.oxlintrc.json
       │                  └── packages/eslint/.oxlintrc.json
       │
       ├── packages/math/.oxlintrc.json
       └── scripts/.oxlintrc.json
```

**Base config** (`oxlint.typescript.json`):

- Enables plugins: `unicorn`, `typescript`, `oxc`, `import`
- Sets rule severities for code quality, performance, correctness
- Defines ignore patterns for generated files, build output, etc.

**React config** (`oxlint.react.json`):

```json
{
    "plugins": ["react", "jsx-a11y"],
    "extends": ["./oxlint.typescript.json"],
    "rules": {
        "react/button-has-type": "warn",
        "react/jsx-filename-extension": ["error", { "extensions": [".tsx"] }]
        // ... more React-specific rules
    }
}
```

**Per-package configs** just extend the appropriate base:

```json
// packages/math/.oxlintrc.json (library - no React)
{
  "extends": ["../../oxlint.typescript.json"]
}

// apps/web/.oxlintrc.json (React app)
{
  "extends": ["../../oxlint.react.json"]
}
```

### ESLint Shared Package

ESLint configuration is more complex, so it lives in its own internal package: `@react-template/eslint`.

This package exports two config factories:

```
packages/eslint/
├── index.ts              # createConfig() - base config for libs/server
└── react/index.ts        # createReactConfig() - React config (extends base)
```

```
createConfig (base)
    │
    ├── Used by: packages/math/eslint.config.ts
    ├── Used by: packages/eslint/eslint.config.ts
    │
    └─extends─► createReactConfig
                    │
                    └── Used by: apps/web/eslint.config.ts
```

**Why a function instead of a plain config?**

ESLint needs to know the `tsconfigRootDir` for TypeScript integration. Each package passes its own directory:

```typescript
// packages/math/eslint.config.ts
import config from "@react-template/eslint"

export default defineConfig([{
  extends: [config(import.meta.dir)],  // Pass this package's directory
}])
```

**What's in the base config?**

- TypeScript-ESLint for type-aware linting
- Perfectionist for import sorting
- Stylistic for code formatting (4-space indent, double quotes, etc.)
- Unused imports detection
- Integration with OxLint (disables rules OxLint handles)

**What does the React config add?**

- React Hooks rules
- React Refresh (for hot reloading)
- @eslint-react rules
- Tailwind CSS class sorting
- "You might not need an effect" rules

### How the Linters Work Together

The key is `eslint-plugin-oxlint`. This ESLint plugin reads your `.oxlintrc.json` and automatically disables ESLint rules that OxLint already handles:

```typescript
// In packages/eslint/index.ts
import oxlint from "eslint-plugin-oxlint"

export default function createConfig(rootDir: string) {
  return defineConfig([{
    extends: [
      // ... other configs ...
      // NOTE: Needs to be last
      ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
    ],
  }])
}
```

**Running both linters:**

```bash
# Run OxLint (fast, catches most issues)
bun run lint:oxlint

# Run ESLint (slower, catches remaining issues + formats)
bun run lint:eslint

# In each package, there's also a combined command:
bun run lint  # Runs both

# Runs the dprint formatter for json, yaml, markdown etc.
bun run format:dprint

# Runs the jscpd code duplication tool
bun run lint:duplicate
```

---

## Type Checking with tsgo

[tsgo](https://github.com/nicolo-ribaudo/tsgo) is an experimental Go port of the TypeScript compiler. It's significantly faster than `tsc` for type checking.

Each package has a `typecheck` script:

```json
{
    "scripts": {
        "typecheck": "tsgo -b --noEmit"
    }
}
```

- `-b` enables build mode (uses project references)
- `--noEmit` only type-checks, doesn't output files

Run type checking across all packages:

```bash
bun run typecheck  # Runs in all workspaces
```

VS Code is also configured to use tsgo:

```json
// .vscode/settings.json
{
    "typescript.experimental.useTsgo": true
}
```

---

## Dead Code Detection with Knip

[Knip](https://knip.dev/) finds unused files, dependencies, and exports in your codebase.

```json
// knip.json
{
    "ignoreExportsUsedInFile": {
        "interface": true,
        "type": true
    },
    "ignore": [
        "components/ui/**", // Ignore UI component library
        "scripts/**" // Ignore utility scripts
    ]
}
```

Run it:

```bash
bun run deadcode
```

Knip will report:

- Unused files
- Unused dependencies in `package.json`
- Unused exports (functions, types, etc.)

---

## Development Environment

### Devbox

[Devbox](https://www.jetify.com/devbox) creates reproducible development environments. Instead of requiring everyone to manually install the right versions of Bun, Node, etc., Devbox handles it.

```json
// devbox.json
{
    "packages": [
        "bun@latest",
        "commitlint-rs@latest",
        "lefthook@latest"
    ],
    "shell": {
        "init_hook": [
            "bun install --frozen-lockfile",
            "lefthook install"
        ]
    }
}
```

To enter the development environment:

```bash
devbox shell
```

This:

1. Installs/activates the specified tool versions
2. Runs `bun install --frozen-lockfile`
3. Sets up git hooks with Lefthook

### direnv

[direnv](https://direnv.net/) automatically loads the Devbox environment when you `cd` into the directory.

The `.envrc` file:

```bash
eval "$(devbox generate direnv --print-envrc)"
```

After allowing it (`direnv allow`), your shell automatically enters the Devbox environment whenever you're in this directory.

### Git Hooks with Lefthook

[Lefthook](https://github.com/evilmartians/lefthook) manages git hooks. Currently configured to lint commit messages:

```yaml
# lefthook.yml
commit-msg:
  commands:
    "lint commit message":
      run: commitlint
```

This uses [commitlint-rs](https://github.com/KeisukeYamashita/commitlint-rs) (a fast Rust implementation) to enforce [Conventional Commits](https://www.conventionalcommits.org/) format:

```yaml
# .commitlintrc.yml
rules:
  type-empty:
    level: error
  subject-empty:
    level: error
  # ... requires format like "feat: add login page"
```

---

## Scripts Reference

### Root `package.json` scripts

| Script           | Command                                   | Description                                                  |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `sync:tsconfig`  | `bun scripts/sync-tsconfig-references.ts` | Syncs tsconfig references based on package.json dependencies |
| `lint:oxlint`    | `bun run --filter '*' lint:oxlint`        | Runs OxLint in all workspaces                                |
| `lint:eslint`    | `bun run --filter '*' lint:eslint`        | Runs ESLint in all workspaces                                |
| `typecheck`      | `bun run --filter '*' typecheck`          | Type-checks all workspaces with tsgo                         |
| `deadcode`       | `knip`                                    | Finds unused code/dependencies                               |
| `format:dprint`  | `bun run dprint fmt`                      | Runs the dprint formatter for json, yaml etc.                |
| `lint:duplicate` | `bun run jscpd -c .jscpd.json`            | Runs the jscpd code duplication tool                         |

The `--filter '*'` flag tells Bun to run the script in all workspace packages that have it.

### Per-package scripts

Each package typically has:

| Script        | Description              |
| ------------- | ------------------------ |
| `lint:oxlint` | Run OxLint with auto-fix |
| `lint:eslint` | Run ESLint with auto-fix |
| `typecheck`   | Type-check with tsgo     |

Apps may have additional scripts:

| Script    | Description              |
| --------- | ------------------------ |
| `dev`     | Start development server |
| `build`   | Build for production     |
| `preview` | Preview production build |

---

## VS Code Integration

The `.vscode/settings.json` configures VS Code for this monorepo:

**ESLint as formatter:**

```json
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    },
    "[typescript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    },
    "[typescriptreact]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    }
}
```

**Use tsgo for TypeScript:**

```json
{
    "typescript.experimental.useTsgo": true
}
```

**Disable VS Code's import organization** (let ESLint's perfectionist plugin handle it):

```json
{
    "editor.codeActionsOnSave": {
        "source.organizeImports": "never"
    }
}
```

**Tailwind CSS class detection** (for cva/cx utilities):

```json
{
    "tailwindCSS.experimental.classRegex": [
        ["cva\\(((?:[^()]|\\([^()]*\\))*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
        ["cx\\(((?:[^()]|\\([^()]*\\))*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
    ]
}
```

---

## Adding New Packages

> **TODO:** Consider adding a package generator to automate this. Options:
>
> - [Plop.js](https://plopjs.com/) - popular template generator with prompts
> - [Turborepo](https://turbo.build/repo) - build system for monorepos with built-in generators
> - Custom Bun script in `scripts/` - zero dependencies, full control

### Adding a Library Package

Library packages are shared code used by apps (utilities, types, business logic).

**1. Create the package directory:**

```bash
mkdir -p packages/utils
```

**2. Create `packages/utils/package.json`:**

```json
{
    "name": "@react-template/utils",
    "version": "0.0.1",
    "module": "index.ts",
    "type": "module",
    "private": true,
    "scripts": {
        "lint:oxlint": "oxlint --fix .",
        "lint:eslint": "eslint --fix .",
        "typecheck": "tsgo -b --noEmit"
    },
    "devDependencies": {
        "@types/bun": "latest"
    },
    "peerDependencies": {
        "typescript": "^5"
    }
}
```

**3. Create `packages/utils/tsconfig.json`:**

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "composite": true,
        "outDir": "./dist"
    },
    "include": ["index.ts", "src", "../../reset.d.ts"],
    "exclude": ["eslint.config.ts"]
}
```

**4. Create `packages/utils/.oxlintrc.json`:**

```json
{
    "extends": ["../../oxlint.typescript.json"]
}
```

**5. Create `packages/utils/eslint.config.ts`:**

```typescript
import config from "@react-template/eslint"
import { defineConfig } from "eslint/config"

export default defineConfig([{
  extends: [config(import.meta.dir)],
}])
```

**6. Create `packages/utils/index.ts`:**

```typescript
export function formatDate(date: Date): string {
    return date.toISOString()
}
```

**7. Install dependencies and sync tsconfig:**

```bash
bun install
bun run sync:tsconfig
```

**8. Use it from another package:**

Add to `apps/web/package.json`:

```json
{
    "dependencies": {
        "@react-template/utils": "workspace:*"
    }
}
```

Then run `bun install` and `bun run sync:tsconfig` again.

### Adding a React Application

React applications (web or mobile) need the React-specific linter configs.

**1. Create the app directory:**

```bash
mkdir -p apps/mobile/src
```

**2. Create `apps/mobile/package.json`:**

```json
{
    "name": "@react-template/mobile",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
        "typecheck": "tsgo -b --noEmit",
        "lint:oxlint": "oxlint --fix .",
        "lint:eslint": "eslint --fix ."
    },
    "dependencies": {
        "react": "^19.2.0"
    },
    "devDependencies": {
        "@types/react": "^19.2.5"
    }
}
```

**3. Create `apps/mobile/tsconfig.json`** (solution-style if you have multiple contexts):

```json
{
    "files": [],
    "references": [
        { "path": "./tsconfig.app.json" }
    ]
}
```

**4. Create `apps/mobile/tsconfig.app.json`:**

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "composite": true,
        "jsx": "react-jsx",
        "lib": ["ES2022", "DOM", "DOM.Iterable"]
    },
    "include": ["src", "../../reset.d.ts"]
}
```

**5. Create `apps/mobile/.oxlintrc.json`** (note: extends React config):

```json
{
    "extends": ["../../oxlint.react.json"]
}
```

**6. Create `apps/mobile/eslint.config.ts`** (note: uses React config):

```typescript
import { defineConfig } from "eslint/config"
import reactConfig from "@react-template/eslint/react"

export default defineConfig([{
  extends: [reactConfig(import.meta.dir)],
}])
```

**7. Create `apps/mobile/src/app.tsx`:**

```tsx
function App() {
    return <div>Hello Mobile</div>
}

export default App
```

**8. Install and sync:**

```bash
bun install
bun run sync:tsconfig
```

---

## Troubleshooting

### "Cannot find module '@react-template/xxx'"

**Cause:** The package isn't linked properly.

**Fix:**

1. Check the package has the correct `name` in its `package.json`
2. Run `bun install` at the root
3. Check your import matches the package name exactly

### Type errors about missing references

**Cause:** tsconfig references are out of sync with package.json dependencies.

**Fix:**

```bash
bun run sync:tsconfig
```

### ESLint errors about missing tsconfig

**Cause:** ESLint can't find the TypeScript project configuration.

**Fix:**

1. Make sure `eslint.config.ts` passes `import.meta.dir` to the config factory
2. Make sure the package has a `tsconfig.json`
3. Check `tsconfig.json` includes the files ESLint is trying to lint

### OxLint not finding the config

**Cause:** OxLint looks for `.oxlintrc.json` in the current directory.

**Fix:**

1. Make sure `.oxlintrc.json` exists in the package directory
2. Make sure the `extends` path is correct (usually `../../oxlint.typescript.json` or `../../oxlint.react.json`)

### Changes to shared package not reflecting in app

**Cause:** TypeScript build cache is stale.

**Fix:**

```bash
# Clear build info and rebuild
rm -rf node_modules/.tmp
bun run typecheck
```

### VS Code not recognizing types from internal packages

**Cause:** VS Code's TypeScript server needs to be restarted after adding references.

**Fix:**

1. Run `bun run sync:tsconfig`
2. In VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

### Lefthook hooks not running

**Cause:** Hooks weren't installed.

**Fix:**

```bash
lefthook install
```

Or enter the devbox shell which runs this automatically:

```bash
devbox shell
```
