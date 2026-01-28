
import { noCodeDuplication } from "./todo/jscpd-duplication"
import { preferDiscriminatedUnionRule } from "./discriminated-union"

export default {
    rules: {
        "no-code-duplication":        noCodeDuplication,
        "prefer-discriminated-union": preferDiscriminatedUnionRule,
    },
} as unknown
