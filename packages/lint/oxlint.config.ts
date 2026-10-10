import { createOxlintConfig } from "./src/oxlint/index.ts"

export default createOxlintConfig({
    // Vendored third-party rule code (generated, see vendor/*/README.md).
    ignorePatterns: ["vendor/**"],
})
