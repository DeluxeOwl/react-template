
import { noMarginOnRootJSXRule } from "./no-margin-on-root-jsx"
import { preferDiscriminatedUnionRule } from "./discriminated-union"

export default {
    rules: {
        "no-margin-on-root-jsx":      noMarginOnRootJSXRule,
        "prefer-discriminated-union": preferDiscriminatedUnionRule,
    },
} as unknown
