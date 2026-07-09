# AGENTS.md — Coding Agent Reference

This is a Bun monorepo with workspaces `packages/core`, `packages/kernel`, `apps/server`, `apps/web`, `scripts`, and a published shareable lint package `packages/lint` (`@deluxeowl/lint`).
The stack is React 19 + Vite 7 + TanStack Query v5 + oRPC on the frontend, and a pure Bun HTTP server on the backend.

---

## Commands

All commands are run from the repo root unless noted.

### Build & Dev

```sh
bun run --filter @react-template/web dev        # start Vite dev server
bun run --filter @react-template/server dev     # start Bun HTTP server (port 3041)
bun run typecheck                               # tsc --noEmit across all workspaces
```

### Testing

```sh
bun run test                                    # run all tests (sequential, all workspaces)
bun run --elide-lines=0 --filter @react-template/core test    # run tests for one workspace
```

**Run a single test file:**

```sh
bun run --filter @react-template/core vitest run packages/core/todos/todo.test.ts
```

**Run a single test by name:**

```sh
bun run --filter @react-template/core vitest run --reporter=verbose -t "then it should return a Todo instance"
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
- Imports are **sorted by line-length** (longest first within each group) via `eslint-plugin-perfectionist`.
- No barrel re-exports that cause circular dependencies.
- Path alias `~/` maps to `apps/web/` root (configured in `tsconfig.app.json` and Vite).

### Naming Conventions

- `camelCase` for variables, functions, parameters.
- `PascalCase` for classes, React components, types, interfaces.
- No underscore prefix/suffix (use `_` only as an explicit unused parameter placeholder).
- Event handlers must be descriptive: `handleTodoDelete`, not `handleClick`.
- Boolean variables should read as predicates: `isDone`, `hasError`, `canSubmit`.
- Flat files.

### Error Handling

- **Never `throw`** — `ThrowStatement` and `Promise.reject()` are banned by ESLint rule.
- Return errors as values in the cqrs, domain and repositories using the `byethrow` library:

```ts
import { Result } from "@praha/byethrow"

export class NameLengthError extends ErrorFactory({
    fields:  ErrorFactory.fields<{ length: number }>(),
    message: `name length must be greater than ${TodoNameMinLength}`,
    name:    "NameLengthError",
}) {}

// Return result
export class Todo {
    static create(
        name: string,
        publicId?: string,
    ): Result.Result<Todo, InvalidPublicIdError | NameLengthError> {
        if (name.length < TodoNameMinLength) {
            return Result.fail(new NameLengthError({
                length: name.length,
            }))
        }

        const id = publicId ?? generateTodoPublicId()

        if (!isValidTodoPublicId(id)) {
            return Result.fail(new InvalidPublicIdError({ id }))
        }

        return Result.succeed(new Todo({
            done: false,
            id,
            name,
        }))
    }
}
```

- You should load the `byethrow` skill to learn more.
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

    static create(
        name: string,
        publicId?: string,
    ): Result.Result<Todo, InvalidPublicIdError | NameLengthError> { ... }
    static fromDTO(data: TodoDTO): Todo { ... }

    toDTO(): TodoDTO { return this.state }
}
```

- **Private constructors** — consumers always use a static factory (`create`, `fromDTO`).
- State is stored in a single `state` object (not as individual `private` fields).
- No `#private` fields — use TypeScript `private` keyword instead.
- No public constructors anywhere in the codebase.

### React Components (View-Only Pattern)

Components must be "view-only" — enforced by ast-grep rules in `node_modules/@deluxeowl/lint/ast-grep/rules/view-only-rules.yml` (shipped by `@deluxeowl/lint`, wired via `sgconfig.yml`):

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

| Layer       | Package           | Notes                                                                                                                                                                     |
| ----------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain      | `packages/core`   | Pure logic, no framework. Entities, CQRS handlers, ports, oRPC contract.                                                                                                  |
| Kernel      | `packages/kernel` | `@react-template/kernel` — framework-agnostic primitives: CQRS interfaces (`CommandHandler` / `QueryHandler`), execution `Context` + cancellation, `Result` test helpers. |
| Server      | `apps/server`     | Bun HTTP server. Serves oRPC + OpenAPI (Scalar).                                                                                                                          |
| Web         | `apps/web`        | React 19 SPA. Vite 7, Tailwind v4, TanStack Query v5.                                                                                                                     |
| Shared lint | `packages/lint`   | `@deluxeowl/lint` — the one built (Model B) package; `createConfig()` / `createReactConfig()` factories, oxlint/ast-grep/dprint configs. Published to GitHub Packages.    |

- API contract is defined in `packages/core` via oRPC route definitions, shared with the web client.
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
- **Lint package is published**: `packages/lint` (`@deluxeowl/lint`) is the only built (Model B) package — it's built with zshy and published to GitHub Packages. Consumed in-repo via `workspace:*` (the root `postinstall` builds it). Changes to shared lint config require a version bump in `packages/lint/package.json` + a matching `lint-vX.Y.Z` git tag push (triggers the publish workflow).
- **CI**: `.github/workflows/ci.yml` runs the full lint/typecheck/test gate on push + PR (guardrails are enforced server-side, not just via lefthook).
