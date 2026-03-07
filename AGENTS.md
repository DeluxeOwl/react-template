# AGENTS.md — Coding Agent Reference

This is a Bun monorepo with three workspaces (`apps/domain`, `apps/server`, `apps/web`) and a shared ESLint package (`packages/eslint`).
The stack is React 19 + Vite 7 + TanStack Query v5 + oRPC on the frontend, and a pure Bun HTTP server on the backend.

---

## Commands

All commands are run from the repo root unless noted.

### Build & Dev

```sh
bun run --filter @react-template/web dev        # start Vite dev server
bun run --filter @react-template/server dev     # start Bun HTTP server (port 3041)
bun run typecheck                               # tsc --noEmit across all workspaces
bun run sync:tsconfig                           # sync tsconfig project references
```

### Testing

```sh
bun run test                                    # run all tests (sequential, all workspaces)
bun run --elide-lines=0 --filter @react-template/domain test    # run tests for one workspace
```

**Run a single test file:**

```sh
bun run --filter @react-template/domain vitest run apps/domain/todos/todo.test.ts
```

**Run a single test by name:**

```sh
bun run --filter @react-template/domain vitest run --reporter=verbose -t "then it should return a Todo instance"
```

### Linting & Formatting

```sh
bun run lint:oxlint      # fast Rust linter (oxlint) across all workspaces
bun run lint:eslint      # ESLint (type-aware rules) across all workspaces
bun run lint:sg          # ast-grep structural rules
bun run format:dprint    # format JSON, YAML, Markdown, Dockerfile (dprint)
bun run lint:all         # run the full pre-push gate (lefthook)
```

> Formatting for `.ts`/`.tsx`/`.js` is handled by `@stylistic/eslint-plugin` via ESLint, not dprint.

---

## Code Style

### TypeScript

- **TypeScript v6 beta** — use the latest features freely.
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `verbatimModuleSyntax: true`.
- Use `type` keyword for type-only imports: `import type { Foo } from "..."`.
- Prefer `interface` for object shapes that may be extended; `type` for unions/aliases.
- **No `enum`** — use `as const` objects or discriminated unions instead.
- Always declare explicit return types on exported functions and React components.

### Formatting (enforced by `@stylistic/eslint-plugin`)

- **4-space indentation** (not tabs).
- **Double quotes** for strings.
- **1tbs brace style** (`if (x) {\n  ...\n}`).
- Trailing commas in multi-line structures.
- No semicolons where avoidable (rely on ASI-safe style).

### Imports

- Named imports for utilities and types: `import { foo, type Bar } from "..."`.
- **Namespace imports** for domain packages: `import * as todos from "@react-template/domain/todos"`.
- Imports are **sorted by line-length** (longest first within each group) via `eslint-plugin-perfectionist`.
- No barrel re-exports that cause circular dependencies.
- Path alias `~/` maps to `apps/web/` root (configured in `tsconfig.app.json` and Vite).

### Naming Conventions

- `camelCase` for variables, functions, parameters.
- `PascalCase` for classes, React components, types, interfaces.
- No underscore prefix/suffix (use `_` only as an explicit unused parameter placeholder).
- Event handlers must be descriptive: `handleTodoDelete`, not `handleClick`.
- Boolean variables should read as predicates: `isDone`, `hasError`, `canSubmit`.

### Error Handling

- **Never `throw`** — `ThrowStatement` and `Promise.reject()` are banned by ESLint rule.
- Return errors as values using the `errore` library:

```ts
import * as errore from "errore"

export class NameLengthError extends errore.createTaggedError({
    extends: TodoError,
    message: "name length must be less than $length",
    name:    "NameLengthError",
}) {}

// Return type union instead of throwing
static create(name: string): NameLengthError | Todo {
    if (name.length === 0) return new NameLengthError({ length: 100 })
    return new Todo({ done: false, id: crypto.randomUUID() as TodoID, name })
}
```

- Check the returned value at the call site; never ignore it.

### Domain Classes (Private Constructor Pattern)

All domain entities must follow this pattern:

```ts
export class Todo {
    private constructor(
        private state: {
            done: boolean
            id:   TodoID
            name: string
        },
    ) {}

    static create(name: string): NameLengthError | Todo { ... }
    static fromDTO(data: TodoDTO): Todo { ... }

    toDTO(): TodoDTO { return this.state }
}
```

- **Private constructors** — consumers always use a static factory (`create`, `fromDTO`).
- State is stored in a single `state` object (not as individual `private` fields).
- No `#private` fields — use TypeScript `private` keyword instead.
- No public constructors anywhere in the codebase.

### React Components (View-Only Pattern)

Components must be "view-only" — enforced by ast-grep rules in `ast-grep-rules/rules/view-only-rules.yml`:

- **Maximum 1 custom hook** per component.
- No array methods (`map`, `filter`, `reduce`) inside JSX directly — derive data in the hook.
- No logic (`if`/`switch`/ternary chains), no loops inside the component body.
- No IIFEs inside JSX.
- Use `useSuspenseQuery` / `useLiveSuspenseQuery` — **not** `useQuery`.
- Always declare explicit `React.ReactNode` return type.
- `useState`, `useEffect`, etc. are auto-imported via `unplugin-auto-import` — do not import them manually.

```ts
// Good
function TodoList(): React.ReactNode {
    const { todos, handleToggle } = useTodoList()
    return <ol>{todos.map((todo) => <TodoItem key={todo.id} onToggle={handleToggle} todo={todo} />)}</ol>
}

// Bad — logic and data fetching mixed into the component
function TodoList(): React.ReactNode {
    const { data } = useQuery(...)
    return <ol>{data?.filter(t => !t.done).map(...)}...</ol>
}
```

### Complexity Limits (enforced by ESLint)

- Max **15 statements** per function.
- Max **2 parameters** per function.
- Max **4 nesting depth**.
- Max **5 nested callbacks**.
- Magic numbers are banned except: `-1`, `0`, `1`, `12`, `24`, `60`, `300`, `1000`.

---

## Testing

Framework: **Vitest**. Tests live alongside source files (`*.test.ts`).

### Structure: Given-When-Then

```ts
import { it, expect, describe } from "vitest"

describe("creating a todo", () => {
    describe("given a valid name string", () => {
        describe("when calling Todo.create with that name", () => {
            it("then it should return a Todo instance", () => {
                expect.hasAssertions()

                // GIVEN
                const name = "hello"

                // WHEN
                const result = Todo.create(name)

                // THEN
                expect(result).toBeInstanceOf(Todo)
            })
        })
    })
})
```

Rules:

- Always start with `expect.hasAssertions()`.
- No `beforeEach` or shared mutable state — all setup goes inside `it`.
- Use `// GIVEN`, `// WHEN`, `// THEN` comment markers.
- Nesting depth: `describe(SUT) > describe(Given) > describe(When) > it(Then)`.

---

## Architecture

| Layer         | Package           | Notes                                                                     |
| ------------- | ----------------- | ------------------------------------------------------------------------- |
| Domain        | `apps/domain`     | Pure logic, no framework. CQRS: CommandHandler / QueryHandler interfaces. |
| Server        | `apps/server`     | Bun HTTP server. Serves oRPC + OpenAPI (Scalar).                          |
| Web           | `apps/web`        | React 19 SPA. Vite 7, Tailwind v4, TanStack Query v5.                     |
| Shared ESLint | `packages/eslint` | `createConfig()` / `createReactConfig()` factories.                       |

- API contract is defined in `apps/domain` via oRPC route definitions, shared with the web client.
- `apps/web/api.ts` provides the typed oRPC client + TanStack Query utilities.
- TanStack React DB (`createCollection`) is used for optimistic mutation and live sync.

---

## Tooling Notes

- **Package manager**: Bun 1.3.3. Use `bun add`, never `npm install`.
- **Dev environment**: Nix/devbox (`devbox shell` before any commands).
- **Git hooks**: Lefthook runs `lint:all` on pre-push and commit-lint on commit-msg.
- **Commit messages** must be lowercase: `feat: add todo pagination`, not `Feat: Add Todo Pagination`.
- **Scaffolding**: `bun run generate` (scaffdog) to scaffold a new package from the template.
- **Dead code**: `bun run deadcode` (knip) to detect unused exports.
- **Duplicate code**: `bun run lint:duplicate` or `bun run lint:duplicates` (jscpd / custom script).
