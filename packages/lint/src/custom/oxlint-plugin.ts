import { customRules } from "./index.ts"
import { deferReports } from "../../vendor/_compat/report-order.js"

// Our custom rules as an oxlint JS plugin (alias `custom`). They go through the same wrapper as the
// vendored plugins, so reports, fixes and disable comments behave as they did in ESLint.
export default {
    meta:  { name: "custom" },
    rules: deferReports(customRules),
}
