# react-template

A **guardrails-as-code** monorepo template for full-stack TypeScript apps. The interesting
part isn't the stack — it's that the architecture is _enforced_, not just documented:
errors-as-values, view-only React components, private-constructor domain entities, and a
shared oRPC contract are all held in place by a three-linter gate (oxlint + ast-grep +
dprint) that runs on every push and in CI.

```bash
bun create github.com/DeluxeOwl/react-template <your-app>
```

Bun 1.3.3 is the package manager **and** runtime. The dev environment is pinned with
[devbox](https://www.jetify.com/devbox) (Nix).

---

## Layers

```
                 ┌────────────────────────────────────────────┐
                 │            packages/kernel                  │
                 │  framework-agnostic primitives: CQRS types, │
                 │  execution Context + cancellation, test aid │
                 └──────────────────────┬─────────────────────┘
                                         │ imported by
                                         ▼
                 ┌────────────────────────────────────────────┐
                 │            packages/core                    │
                 │  pure TS: entities, CQRS handlers, ports,   │
                 │  and the oRPC *contract* (schemas + routes) │
                 └───────────────┬───────────────┬─────────────┘
                                 │               │
                 imports contract│               │imports contract
                 + handlers      │               │(typed client)
                                 ▼               ▼
                  ┌──────────────────┐   ┌──────────────────────┐
                  │   apps/server    │   │       apps/web        │
                  │ Bun HTTP server  │   │ React 19 SPA (Vite),  │
                  │ oRPC + OpenAPI,  │◀──│ TanStack Query/DB,    │
                  │ SQLite (Drizzle) │rpc│ typed oRPC client     │
                  └──────────────────┘   └──────────────────────┘

  packages/kernel →  shared primitives consumed by core AND apps/server
  packages/lint   →  the ONE built package: @deluxeowl/lint (shareable config)
  scripts         →  repo tooling (local HTTPS/mDNS, duplicate-fn finder)
```

- The **API contract lives in `packages/core`** (oRPC route + Zod schema definitions) and
  is imported by _both_ the server (to implement it) and the web client (to call it,
  fully typed). One source of truth, no codegen, no drift.
- Packages are **not compiled** — apps consume raw `.ts` via the Bun workspace symlink.
  See [ADR 003](./docs/decisions/003-model-a-internal-packages.md) for the "why".

| Workspace         | Role                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| `packages/core`   | Pure logic, no framework. Entities, CQRS handlers, ports, oRPC contract |
| `packages/kernel` | Framework-agnostic primitives: CQRS interfaces, `Context`, test helpers |
| `apps/server`     | Bun HTTP server. Serves oRPC + OpenAPI (Scalar). SQLite via Drizzle     |
| `apps/web`        | React 19 SPA. Vite, Tailwind v4, TanStack Query v5 + React DB           |
| `packages/lint`   | `@deluxeowl/lint` — the shared lint config (the only _built_ package)   |
| `scripts`         | Repo tooling (CLI via `citty`)                                          |

---

## Quickstart

```bash
devbox shell          # enter the pinned Nix env; runs `bun install` + `lefthook install`
bun run dev           # tilt: web (:5173) + server (:3041) + local-https/mDNS
```

Open the app on <http://localhost:5173>, the API on <http://localhost:3041> (Scalar
OpenAPI docs served there), and create/toggle a todo to see the optimistic-mutation +
live-sync path end to end.

> `bun run dev` runs `tilt up` — no Kubernetes required (the services are plain
> `local_resource` processes). The Tilt web UI is at <http://localhost:10350>; use
> `tilt down` to stop. When k8s is added later, k8s resources coexist with these
> `local_resource` ones in the same `Tiltfile`.
>
> Ports (`3041`, `5173`) are currently hardcoded (server, `apps/web/api.ts`, `Tiltfile`).

---

## Commands

Run from the repo root (inside `devbox shell`).

| Command                    | What it does                                        |
| -------------------------- | --------------------------------------------------- |
| `bun run dev`              | Start web + server + https/mDNS (tilt, `Tiltfile`)  |
| `bun run typecheck`        | `tsc --noEmit` across all workspaces                |
| `bun run test`             | All tests (Vitest, sequential across workspaces)    |
| `bun run lint:oxlint`      | oxlint: most rules, and TS/JS formatting            |
| `bun run lint:sg`          | ast-grep structural rules                           |
| `bun run lint:sg:suppress` | Add ast-grep directives to vendored UI              |
| `bun run lint:sg:check`    | Check vendored UI for missing or unused directives  |
| `bun run lint:duplicate`   | jscpd copy-paste detector                           |
| `bun run format:dprint`    | Format JSON/YAML/Markdown (TS/JS handled by oxlint) |
| `bun run deadcode`         | knip (unused files/exports/deps)                    |
| `bun run lint:all`         | Full pre-push gate (lefthook)                       |
| `bun run generate`         | Scaffold a new package (scaffdog)                   |

The full command reference (test filters, per-workspace runs, code-style rules) lives in
[`AGENTS.md`](./AGENTS.md).

---

## Adding a feature slice

Features are vertical slices. Using `todos` as the reference, add under `packages/core`:

1. **Entity** — `todos/todo.ts`. Private constructor + static factory returning a
   `Result` (errors-as-values, never `throw`):
   ```ts
   static create(name: string, publicId?: string):
       Result.Result<Todo, InvalidPublicIdError | NameLengthError> { ... }
   ```
2. **Port** — `todos/todo-repository.ts` (the persistence interface the domain depends on).
3. **CQRS handlers** — `todos/command-*.ts`, `todos/query-*.ts`, wired in `todos/app.ts`.
4. **Contract** — `todos/adapter-http-routes.ts` (+ `adapter-http-schemas.ts`): the oRPC
   routes/schemas shared with server and web.
5. **Expose it** — add a curated entry to `packages/core/package.json#exports` (single
   string values only — see [ADR 001](./docs/decisions/001-exports-field-and-eslint-import-resolver.md)).

Then implement the adapters in `apps/server` (`todos/adapter-http.ts`,
`todos/adapter-repo-sqlite.ts`) and consume the typed client in `apps/web` via `api.ts`.

**Scaffold a new package:** `bun run generate` → answer the prompt → a Model-A-shaped
package appears under `packages/`.

---

## Using `@deluxeowl/lint` in another project

The lint config (oxlint presets with our custom rules and the vendored upstream rules,
ast-grep rules, dprint config) is published to **GitHub Packages** so pet projects share
the exact same rules.

```jsonc
// .npmrc (or bunfig.toml scopes)
@deluxeowl:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_PACKAGES_TOKEN}   // classic PAT, read:packages
```

```bash
bun add -d @deluxeowl/lint oxlint oxlint-tsgolint typescript
```

```ts
// oxlint.config.ts  (oxlint >= 1.86 loads it with Node >= 22.18)
import { createOxlintConfig } from "@deluxeowl/lint/oxlint"
export default createOxlintConfig()
```

Lint and format with `oxlint-fix .` (a bin of `@deluxeowl/lint`). It repeats `oxlint --fix`
until the files stop changing; a single `oxlint --fix` can leave formatting half-done.

### React projects and vendored UI

React projects use `createOxlintReactConfig()`.
It accepts explicit paths for vendored components (shadcn, ReUI), and `defaultVendoredFiles` covers their standard directories:

```ts
// oxlint.config.ts
import { defaultVendoredFiles, createOxlintReactConfig } from "@deluxeowl/lint/oxlint"
export default createOxlintReactConfig({ vendoredFiles: defaultVendoredFiles })
```

The vendor override relaxes structural rules only for those files.
Type-safety rules, explicit return types, and magic-number rules remain enabled.
Projects without vendored UI call `createOxlintReactConfig()` without options.
The React preset allows Node imports in scripts, configuration files, and tests, but not browser source.
It rejects the `@phosphor-icons/react` barrel. Direct icon imports remain valid.

### Tailwind

The better-tailwindcss rules must find the stylesheet that imports Tailwind:

```ts
// oxlint.config.ts
export default createOxlintReactConfig({
    tailwindSettings: { cwd: import.meta.dirname, entryPoint: "index.css" },
})
```

oxlint resolves `entryPoint` from `cwd`.
Set `cwd` to `import.meta.dirname`, because oxlint can start in another directory, for example in an editor.

### Additional Tailwind restrictions

Rule options replace arrays rather than merging them.
Use `additionalTailwindRestrictions` to retain the shared color and RTL restrictions:

```ts
// oxlint.config.ts
import { smoothShadowRestrictions, createOxlintReactConfig } from "@deluxeowl/lint/oxlint"

export default createOxlintReactConfig({
    additionalTailwindRestrictions: smoothShadowRestrictions,
})
```

**Enable `smoothShadowRestrictions` only if the stylesheet imports `shadow-plugin`.**
The restrictions replace shadow sizes with `smooth-shadow-*` and leave shadow colors unchanged.
The default configuration does not require that plugin.

### Vendored ast-grep directives

devbox's `ast-grep` (pinned in `devbox.lock`) serves both lint scripts and VSCode.
The npm `@ast-grep/cli` can't: its binary needs an install script, and `.npmrc` turns those off.
After a shadcn upgrade, run `bun run lint:sg:suppress` from the repository root.
Then run `bun run lint:sg:check`.
The check reports unsuppressed violations and unused directives without changing files.
Unlike `.ignore`, these directives also work in the language server.
The normal scan retains the `unused-suppression` check.

Other consumers can use `addAstGrepSuppressions` from `@deluxeowl/lint/ast-grep`.
It accepts source text and `{ line, ruleId }` findings, with zero-based lines from ast-grep JSON.
It returns the annotated source or an `Error` for invalid findings.

`@deluxeowl/lint` is the only built package (ESM via zshy). Changing it requires a version
bump + a `lint-vX.Y.Z` tag push, which triggers `.github/workflows/publish-lint.yml`.

---

## Design decisions

Non-obvious architecture choices are recorded as ADRs in
[`docs/decisions/`](./docs/decisions/):

- [001 — `exports` field & the eslint-import-resolver landmine](./docs/decisions/001-exports-field-and-eslint-import-resolver.md)
- [002 — no `tsconfig` `paths` for packages](./docs/decisions/002-no-tsconfig-paths-for-packages.md)
- [003 — Model A: internal packages share source, not builds](./docs/decisions/003-model-a-internal-packages.md)

---

## CI

Two GitHub Actions workflows (`.github/workflows/`):

- **`ci.yml`** — the full gate (lint, typecheck, deadcode, tests) on every push/PR, running
  inside the same devbox env as local.
- **`publish-lint.yml`** — publishes `@deluxeowl/lint` on `lint-v*` tags.

The guardrails also run locally on pre-push via lefthook — but CI is the source of truth
(client hooks are bypassable with `--no-verify`).
