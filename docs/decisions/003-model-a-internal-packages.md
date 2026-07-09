# ADR 003 — Model A: internal packages share source, they are not built

**Status:** accepted
**Context:** how workspaces consume each other; why there is no `composite`/`dist`/build step

## Two models for monorepo package sharing

- **Model A — internal packages / source sharing.** `package.json#exports` points at raw
  `.ts` files. The bundler/runtime (Bun, Vite) transpiles those sources on the fly. Nothing
  is ever emitted to `dist/`. No `tsc -b`, no project references.
- **Model B — built packages.** Each package compiles to `dist/` (`.js` + `.d.ts`),
  `exports` points at the built output, and `tsc -b` / project references orchestrate the
  build graph.

## The problem we fixed

The repo was running **Model A** in practice but **dressed as Model B**:

- `exports` pointed at `.ts` sources (Model A) and nothing was ever built…
- …yet tsconfigs carried `composite: true`, `outDir: "./dist"`,
  `declaration`/`emitDeclarationOnly`, project references, and a custom `sync-tsconfig`
  script maintaining a reference graph for a `tsc -b` build **that never ran** (every
  `typecheck` script was `--noEmit`, and no `dist/` existed anywhere).

This was pure ceremony: config describing a build system that didn't exist.

## Decision

**Commit fully to Model A for all app/library workspaces**
(`packages/core`, `packages/kernel`, `apps/server`, `apps/web`, `scripts`):

- No `composite`, no `outDir`, no `declaration`. `noEmit: true` lives once in
  `tsconfig.base.json`.
- No project references, no `tsc -b`, no `sync-tsconfig` script.
- Cross-package resolution = Bun workspace symlink + `exports`
  (see [ADR 002](./002-no-tsconfig-paths-for-packages.md)).
- `erasableSyntaxOnly: false` **must stay** — the domain-class pattern uses TypeScript
  parameter properties (`private constructor(private state: {...})`), which are
  non-erasable syntax and cannot be transpiled by a type-stripping-only pipeline.

## The one exception: `@deluxeowl/lint` is Model B

The shared lint package (`packages/lint`) is the **only** built package, because it must be
consumable from **other repos** via a registry (GitHub Packages) where raw `.ts` +
workspace symlinks aren't available. It builds with [zshy](https://github.com/colinhacks/zshy)
(ESM-only, `.js` + `.d.ts`). Inside this repo it's consumed via `workspace:*`; a root
`postinstall` runs its build once so the linked `dist/` exists. See the README's
"Using `@deluxeowl/lint` in another project" section.

## Consequences

- Fast, zero-build local dev: edit a `.ts` in `packages/core`, the change is live in
  `apps/server`/`apps/web` immediately — no rebuild, no watch process for packages.
- The tradeoffs of source-sharing (ADR 001's resolver landmine, ADR 002's relative imports)
  are accepted deliberately.
- If a package ever needs to be published/consumed externally, it graduates to Model B like
  `@deluxeowl/lint` — it does **not** mean re-introducing `composite` across the whole repo.
