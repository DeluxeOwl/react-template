/**
 * ESLint rule: no-code-duplication
 *
 * Reports code duplication detected by jscpd as ESLint warnings.
 * This enables IDE integration (Problems panel, inline squiggles, etc.)
 *
 * The rule runs jscpd once per lint session and caches results for efficiency.
 */

import { ESLintUtils } from "@typescript-eslint/utils"

import { runJscpd } from "./shared.tool-runner"
import { getOrComputeJscpd } from "./shared.tool-cache"

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/shepherdjerred/homelab/blob/main/eslint-rules/${name}.ts`,
)

type MessageIds = "codeDuplication"

type Options = [
    {
        minLines?: number
    },
]

const DefaultMinLines = 5

/**
 * ESLint rule to report jscpd duplication findings
 */
export const noCodeDuplication = createRule<Options, MessageIds>({
    create(context, [options]) {
        const filename = context.filename
        const projectRoot = context.cwd
        const minLines = options.minLines ?? DefaultMinLines

        // Get or compute jscpd results (cached per project)
        const jscpdResults = getOrComputeJscpd({
            computeFn: () => runJscpd(projectRoot), projectRoot,
        })

        // Check if this file has any duplications
        const fileDuplications = jscpdResults.get(filename)
        if (!fileDuplications || fileDuplications.length === 0) {
            return {}
        }

        // Track reported locations to avoid duplicates
        const reportedLocations = new Set<string>()

        return {
            Program(node) {
                for (const dup of fileDuplications) {
                    // Skip if below minimum lines threshold
                    if (dup.lines < minLines) {
                        continue
                    }

                    // Create a unique key for this duplication location
                    const locationKey = `${dup.startLine}:${dup.startCol}-${dup.endLine}:${dup.endCol}`
                    if (reportedLocations.has(locationKey)) {
                        continue
                    }
                    reportedLocations.add(locationKey)

                    // Report at the start of the duplicated block
                    context.report({
                        data: {
                            lines:      String(dup.lines),
                            otherEnd:   String(dup.otherEndLine),
                            otherFile:  dup.otherFile,
                            otherStart: String(dup.otherStartLine),
                        },
                        loc: {
                            end:   { column: dup.endCol, line: dup.endLine },
                            start: { column: dup.startCol, line: dup.startLine },
                        },
                        messageId: "codeDuplication",
                        node,
                    })
                }
            },
        }
    },
    defaultOptions: [
        {
            minLines: 5,
        },
    ],
    meta: {
        docs: {
            description: "Report code duplication detected by jscpd",
        },
        messages: {
            codeDuplication:
        "Duplicated code block ({{lines}} lines) - also found in {{otherFile}}:{{otherStart}}-{{otherEnd}}",
        },
        schema: [
            {
                additionalProperties: false,
                properties:           {
                    minLines: {
                        default:     5,
                        description: "Minimum lines for a duplication to be reported",
                        type:        "number",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
    name: "no-code-duplication",
})
