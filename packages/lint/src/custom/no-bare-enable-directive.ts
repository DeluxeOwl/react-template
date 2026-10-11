import { defineRule } from "@oxlint/plugins"

/*
 * ----------------------------------------------------------------------------
 * Rule: no-bare-enable-directive
 * ----------------------------------------------------------------------------
 * An enable comment must name the rules it turns back on.
 *
 * oxlint only closes a disable comment with an enable comment of the same form:
 * an enable comment without rule names does not re-enable a rule that was
 * disabled by name, so that rule silently stays off for the rest of the file
 * (ESLint does re-enable it). Disable comments without rule names are banned
 * by unicorn/no-abusive-eslint-disable, so a bare enable has nothing to close.
 *
 * Examples that MATCH (bad), as comments:
 *   oxlint-disable no-console   ...   oxlint-enable
 *   eslint-enable -- done
 *
 * Examples that do NOT match (good):
 *   oxlint-disable no-console   ...   oxlint-enable no-console
 * ----------------------------------------------------------------------------
 */

// The text of an enable comment without rule names, with or without a `-- reason`.
const BareEnablePattern = /^\s*(?<directive>(?:eslint|oxlint)-enable)\s*(?:--.*)?$/su

export const noBareEnableDirectiveRule = defineRule({
    create(context) {
        return {
            Program() {
                for (const comment of context.sourceCode.getAllComments()) {
                    const directive = BareEnablePattern.exec(comment.value)?.groups?.directive

                    if (directive !== undefined) {
                        context.report({
                            data:      { directive },
                            messageId: "bareEnable",
                            node:      comment,
                        })
                    }
                }
            },
        }
    },
    meta: {
        docs: {
            description: "Require enable comments to name the rules they re-enable",
        },
        messages: {
            bareEnable: "`{{directive}}` without rule names does not re-enable rules that were disabled by name: oxlint keeps them off. Name the rules, as the disable comment does.",
        },
        schema: [],
        type:   "problem",
    },
})
