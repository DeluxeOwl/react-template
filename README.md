A template for building web, mobile (Expo), and server applications in a single repository with shared packages. Uses Bun as the package manager and runtime.

```bash
bun create github.com/DeluxeOwl/react-template <your-app>
```

## Problems

## `import-x/no-unresolved` rule was failing for `@react-template/domain/todos`

The problem: The ESLint `import-x/no-unresolved` rule was failing for `@react-template/domain/todos` in `apps/server/cmd/main.ts`.

Root cause: The exports field in apps/domain/package.json used an array fallback pattern:

```json
"./*": ["./*.ts", "./*/index.ts"]
```

The eslint-import-resolver-typescript (which uses enhanced-resolve internally) doesn't properly handle array fallbacks in the exports field when the targets use .ts
extensions. TypeScript's own resolver doesn't use the exports field at all (it does traditional node_modules lookup), which is why typecheck always passed.

The fix: Changed apps/domain/package.json exports from the array form to a single string:

```json
"./*": "./*/index.ts"
```

This is sufficient because all subpath imports in the domain package go through index.ts barrel files (e.g., @react-template/domain/todos → ./todos/index.ts). Both
TypeScript and eslint-import-resolver-typescript can now resolve it correctly.

## Typescript import issue when using relative paths

Packages that aren't `apps/web`, `apps/server` or `apps/mobile` use relative import paths internally.

Because we're not compiling packages, you can't add

```json
"paths": {
	"~/*": [
		"./*"
	]
}
```

NOTE: fixed with paths in `tsconfig.base.json`, and now only apps/web uses relative import paths.
