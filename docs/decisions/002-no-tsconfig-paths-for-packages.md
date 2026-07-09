# ADR 002 — No `tsconfig` `paths` for cross-package resolution

**Status:** accepted (supersedes the old README "relative paths" note)
**Context:** how `@react-template/*` imports actually resolve

## Context

An earlier iteration added a `paths` block to `tsconfig.base.json` (pointing at
`./packages/domain/*`) in an attempt to control cross-package resolution and allow a `~/*`
self-alias inside every package. The block was **dead config**:

- it pointed at `./packages/domain/*` while the domain actually lived in `apps/domain`
  at the time;
- deleting it changed nothing — typecheck and lint stayed green.

## Why it was dead

Cross-package imports resolve through the **Bun workspace symlink**, not through tsconfig:

```
node_modules/@react-template/core  ->  packages/core
```

TypeScript (`moduleResolution: "bundler"`) then reads that package's `exports` field
(see [ADR 001](./001-exports-field-and-eslint-import-resolver.md)) to map subpaths to
`.ts` files. The `paths` block never participated.

## Decision

- **No `paths` in `tsconfig.base.json`.** Cross-package resolution = workspace symlink +
  `exports`.
- **Only `apps/web` uses a path alias**: `~/*` → the web app root, configured in
  `apps/web/tsconfig.app.json` **and** `apps/web/vite.config.ts` (both must agree, since
  Vite does the runtime resolution and tsc does the type resolution).
- Packages use **relative imports** for intra-package files (`./todo`), and the
  `@react-template/*` specifier for cross-package imports (e.g. `packages/core` imports
  `@react-template/kernel/ctx`). This is a
  deliberate consequence of not compiling packages — there is no build step to rewrite a
  package-internal alias, so relative paths are the honest option.

## Consequences

- Adding a new shared package requires only: a workspace entry (`packages/*` glob),
  a `name`, and a curated `exports` map. No tsconfig `paths` wiring.
- Don't reintroduce a global `paths` block "for convenience" — it will drift out of sync
  with reality (as it did before) and mislead readers into thinking it's load-bearing.
