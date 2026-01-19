# Agent Guidelines

This monorepo uses Bun workspaces for high-performance development across React applications and shared packages.

## Overview

- **`apps/`**: Deployable applications (e.g., `web` using Vite + React 19).
- **`packages/`**: Shared internal libraries (e.g., `@react-template/eslint`, `@react-template/math`).
- **Tooling**: Bun for package management, OxLint (fast) + ESLint (thorough) for linting and formatting, and TypeScript Project References for incremental type checking.

**CRITICAL**: After any programming task, run `bun run lint:all` and fix all linter errors. This also formats things so you need to re-read files.

## Development Rules

- MUST: Use `workspace:*` for internal dependencies.
- MUST: Run `bun run sync:tsconfig` when changing internal package relationships.
- MUST: Use `tsc -b` for type-checking (accessible via `bun run typecheck`).
- MUST: Include `../../reset.d.ts` in all package `tsconfig.json` files.
- NEVER: Finish your task without running `bun run lint:all`.
