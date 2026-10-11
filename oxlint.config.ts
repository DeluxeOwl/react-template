import { createOxlintRootConfig } from "@deluxeowl/lint/oxlint"

// The root config. `bun run lint:oxlint` runs oxlint once, from here, and VS Code lints from here
// too, so each workspace's oxlint.config.ts is a nested config below this one. Options only the
// root config may set, such as type-aware mode, live here; a nested config that sets one fails to load.
// Files outside the workspaces get this config: the presets' ignore patterns and oxlint's defaults.
export default createOxlintRootConfig()
