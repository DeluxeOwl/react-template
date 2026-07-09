# ADR 001 — `exports` field must use single-string `.ts` targets (never array fallbacks)

**Status:** accepted
**Context:** cross-package imports (`@react-template/core/*`) + `import-x/no-unresolved`

## Context

Packages in this repo are **not compiled** (see [ADR 003](./003-model-a-internal-packages.md)).
`package.json#exports` points directly at raw `.ts` source, and consumers resolve those
sources through the Bun workspace symlink. Two different resolvers read the `exports` field:

- **TypeScript** (`moduleResolution: "bundler"`) — honours `exports` with `.ts` targets.
- **`eslint-import-resolver-typescript`** (used by `import-x/no-unresolved`) — wraps
  `enhanced-resolve`.

## The landmine

`eslint-import-resolver-typescript` / `enhanced-resolve` does **not** correctly handle
**array fallback values** in `exports` when the targets are `.ts` files:

```jsonc
// ❌ breaks import-x/no-unresolved (TypeScript itself is fine with it)
"exports": {
    "./*": ["./*.ts", "./*/index.ts"]
}
```

TypeScript's own resolver tolerated this (it also has a legacy node_modules lookup path),
so `bun run typecheck` stayed green while `bun run lint:eslint` failed with
`import-x/no-unresolved` on e.g. `@react-template/core/todos`. That divergence is what
made this hard to diagnose.

## Decision

**Every value in `exports` is a single string. No arrays. Ever.**

Each package ships a **curated** map. `packages/core`:

```jsonc
"exports": {
    "./todos/*": "./todos/*.ts"
}
```

and `packages/kernel` (the shared primitives — CQRS, `Context`, test helpers):

```jsonc
"exports": {
    "./ctx":            "./ctx/index.ts",
    "./cqrs":           "./cqrs/index.ts",
    "./test-helpers/*": "./test-helpers/*.ts"
}
```

Wildcards are fine (`"./todos/*": "./todos/*.ts"`); array fallbacks are not.

## Consequences

- If `import-x/no-unresolved` starts firing on a cross-package import, an array value that
  crept back into some `exports` field is the **first** thing to check.
- Test files are intentionally part of the export surface (`"./todos/*"` exposes
  `todo-repository.test.ts`, whose `runRepositoryTests` is a shared repository contract test
  consumed by `apps/server`). Don't narrow `./todos/*` in a way that drops `.test.ts`.
