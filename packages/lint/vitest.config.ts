import { defineConfig } from "vitest/config"

// Most tests start oxlint, type-aware and with every JS plugin, once or several times: up to
// 7 s per start on a CI runner, more than vitest's default timeout of 5 s.
export default defineConfig({
    test: {
        testTimeout: 60 * 1000,
    },
})
