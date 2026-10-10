// Makes oxlint pick the same fix as ESLint when two reports want to fix the same range.
// Also gives the file's tokens typescript-estree's types before the first rule runs (tokens.js).
//
// ESLint sorts a file's problems by (line, column) — ties in report order, which is the order of
// the rules in the config — then applies fixes sorted by range (start, then end) with a stable sort,
// skipping any fix that starts at or before the end of the last applied one (source-code-fixer.js).
// So of several overlapping fixes, which one is applied in a pass depends on that order. oxlint sorts
// fixes with an unstable sort (oxc_linter fixer/mod.rs `sort_unstable_by_key`), so which of them
// wins is arbitrary. Examples: for `}   ,` @stylistic/no-multi-spaces (column 13) wants " " and
// @stylistic/comma-spacing (column 16) wants "" on the same three spaces; ESLint applies " ". When
// perfectionist/sort-objects and @tanstack/query/infinite-query-property-order both reorder the same
// object, ESLint applies the fix that ends first.
//
// deferReports() wraps rules so their reports are queued and emitted at the end of the file sorted
// like ESLint's problems, and runs ESLint's fix selection on them: a report whose fix ESLint would
// skip in this pass loses its fix (the diagnostic is still reported, and the fix comes back in the
// next pass if it still applies). oxlint then only gets fixes that don't overlap, and applies all
// of them. Fixes of oxlint's native rules are not seen here.
//
// Disable directives are applied here too, with ESLint's semantics (apply-disable-directives.js),
// and suppressed reports are dropped before oxlint sees them: ESLint resolves fix conflicts after
// suppression (a perfectionist group fix is carried by every report of the group, and the first one
// may sit in a disabled region), and oxlint 1.86 does not suppress a report that starts at the end
// of a line with eslint-disable-(next-)line (F-030). oxlint still applies its own directive pass
// afterwards, so where it suppresses more than ESLint (F-028) the difference remains.
// Fixes are computed when the rule reports (against the same source text, as ESLint does) and merged
// into one fix the way ESLint merges a fix array (file-report.js mergeFixes).
//
// Report order within one AST event follows rule registration order in oxlint but config order in
// ESLint, so vendored plugins register their rules in the ESLint config's order (vendor.ts).
//
// The queue is shared by every wrapped rule of every vendored plugin (one module instance), and is
// flushed by the last wrapped rule's Program:exit for the file. If a rule throws, oxlint abandons
// the file and the remaining Program:exit handlers never run; the next file is detected when a rule
// is created a second time, and the abandoned state is dropped.

import { retypeTokens } from "./tokens.js"

let queue = []
let created = new Set()
let open = 0
let sequence = 0

function reset() {
    queue = []
    created = new Set()
    open = 0
}

function rangeOf(sourceCode, nodeOrToken) {
    return nodeOrToken.range ?? sourceCode.getRange(nodeOrToken)
}

function createFixer(sourceCode) {
    const at = (index, text) => ({ range: [index, index], text })

    return {
        insertTextAfter: (nodeOrToken, text) => at(rangeOf(sourceCode, nodeOrToken)[1], text),
        insertTextAfterRange: (range, text) => at(range[1], text),
        insertTextBefore: (nodeOrToken, text) => at(rangeOf(sourceCode, nodeOrToken)[0], text),
        insertTextBeforeRange: (range, text) => at(range[0], text),
        remove: (nodeOrToken) => ({ range: rangeOf(sourceCode, nodeOrToken), text: "" }),
        removeRange: (range) => ({ range, text: "" }),
        replaceText: (nodeOrToken, text) => ({ range: rangeOf(sourceCode, nodeOrToken), text }),
        replaceTextRange: (range, text) => ({ range, text }),
    }
}

// ESLint: file-report.js mergeFixes
function mergeFixes(fixes, sourceCode) {
    if (fixes.length === 0) {
        return null
    }
    if (fixes.length === 1) {
        return { range: [...fixes[0].range], text: fixes[0].text }
    }
    fixes.sort((a, b) => a.range[0] - b.range[0] || a.range[1] - b.range[1])
    const originalText = sourceCode.text
    const start = fixes[0].range[0]
    const end = fixes.at(-1).range[1]
    let text = ""
    let lastPos = Number.MIN_SAFE_INTEGER
    for (const fix of fixes) {
        if (fix.range[0] >= 0) {
            text += originalText.slice(Math.max(0, start, lastPos), fix.range[0])
        }
        text += fix.text
        lastPos = fix.range[1]
    }
    text += originalText.slice(Math.max(0, start, lastPos), end)

    return { range: [start, end], text }
}

function computeFix(fix, sourceCode) {
    if (typeof fix !== "function") {
        return fix
    }
    const result = fix(createFixer(sourceCode))
    if (result === null || result === undefined) {
        return null
    }
    const list = typeof result[Symbol.iterator] === "function" && !("range" in result) ? [...result] : [result]

    return mergeFixes(list.filter((item) => item !== null && item !== undefined), sourceCode)
}

// ESLint: file-report.js normalizeReportLoc + message line/column. oxc nodes compute `loc` with a
// prototype getter, so copies made with object spread (`{ ...member, key: member.id }` in
// quote-props) have `range` but no `loc`; take the position from `range` then.
function startOf(descriptor, sourceCode) {
    if (descriptor.loc !== undefined && descriptor.loc !== null) {
        const start = descriptor.loc.start ?? descriptor.loc

        return { column: start.column, line: start.line }
    }
    const node = descriptor.node
    const start = node.loc?.start ?? sourceCode.getLocFromIndex(node.range[0])

    return { column: start.column, line: start.line }
}

function enqueue(context, descriptor) {
    if (descriptor === null || typeof descriptor !== "object" || (descriptor.node === undefined && descriptor.loc === undefined)) {
        context.report(descriptor)

        return
    }
    const sourceCode = context.sourceCode
    const fix = computeFix(descriptor.fix, sourceCode)
    const suggest = descriptor.suggest?.map((suggestion) => {
        const computed = computeFix(suggestion.fix, sourceCode)

        return { ...suggestion, fix: () => computed }
    })
    const { column, line } = startOf(descriptor, sourceCode)
    queue.push({
        column,
        context,
        descriptor: { ...descriptor, fix: fix === null || fix === undefined ? undefined : () => fix, ...suggest === undefined ? {} : { suggest } },
        line,
        sequence: sequence++,
    })
}

function ruleList(directive) {
    return directive.value.split(",").map((id) => id.trim()).filter((id) => id !== "")
}

function byLocation(a, b) {
    return a.line - b.line || a.column - b.column
}

// ESLint's directive points (linter.js createDisableDirectives + apply-disable-directives.js):
// block comments disable/enable from (line, column + 1); disable-line covers the comment's line,
// disable-next-line the line after the comment ends. Line comments are only directives in their
// -line/-next-line forms. Columns are 1-based like ESLint problems.
function directivePoints(directives) {
    const block = []
    const lines = []
    for (const directive of directives) {
        const loc = directive.node.loc
        const ids = ruleList(directive)
        for (const id of ids.length === 0 ? [null] : ids) {
            if (directive.type === "disable" || directive.type === "enable") {
                if (directive.node.type !== "Line") {
                    block.push({ column: loc.start.column + 1, id, line: loc.start.line, type: directive.type })
                }
            } else if (directive.type === "disable-next-line" || loc.start.line === loc.end.line) {
                const line = directive.type === "disable-line" ? loc.start.line : loc.end.line + 1
                lines.push({ column: 1, id, line, type: "disable" }, { column: 0, id, line: line + 1, type: "enable" })
            }
        }
    }

    return [block.sort(byLocation), lines.sort(byLocation)]
}

// ESLint applyDirectives: at the problem's position, the last directive point for its rule (or for
// all rules) decides; block and line directives are applied one after the other.
function isSuppressed(points, ruleId, line, column) {
    const problem = { column: column + 1, line }

    return points.some((list) => {
        let disabled = false
        for (const point of list) {
            if (byLocation(point, problem) > 0) {
                break
            }
            if (point.id === null || point.id === ruleId) {
                disabled = point.type === "disable"
            }
        }

        return disabled
    })
}

// ESLint: source-code-fixer.js applyFixes — the fixes ESLint would skip in this pass.
function skippedFixes(items) {
    const fixed = items.filter((item) => item.descriptor.fix !== undefined)
    const ordered = fixed.map((item) => ({ item, range: item.descriptor.fix().range })).sort((a, b) => a.range[0] - b.range[0] || a.range[1] - b.range[1])
    const skipped = new Set()
    let lastPos = Number.NEGATIVE_INFINITY
    for (const { item, range: [start, end] } of ordered) {
        if (lastPos >= start || start > end) {
            skipped.add(item)
        } else {
            lastPos = end
        }
    }

    return skipped
}

function flush() {
    const pending = queue.sort((a, b) => a.line - b.line || a.column - b.column || a.sequence - b.sequence)
    const points = directivePoints(pending.length === 0 ? [] : pending[0].context.sourceCode.getDisableDirectives?.().directives ?? [])
    const active = pending.filter((item) => !isSuppressed(points, item.context.id, item.line, item.column))
    const skipped = skippedFixes(active)
    for (const item of active) {
        item.context.report(skipped.has(item) ? { ...item.descriptor, fix: undefined } : item.descriptor)
    }
    reset()
}

// oxlint's context is a non-extensible object whose `report` is a read-only own property (so a Proxy
// cannot override it), and whose other members are getters on a shared prototype that read the
// linter's per-file state rather than `this`. An object inheriting from the context, with its own
// `report`, is what oxlint's own `context.extend()` builds.
function wrapContext(context) {
    return Object.create(context, {
        report: { enumerable: true, value: (descriptor) => enqueue(context, descriptor) },
    })
}

function wrapRule(rule) {
    const token = {}

    return {
        ...rule,
        create(context) {
            if (created.has(token)) {
                reset()
            }
            created.add(token)
            retypeTokens(context.sourceCode)
            const listeners = rule.create(wrapContext(context)) ?? {}
            open++
            const exit = listeners["Program:exit"]

            return {
                ...listeners,
                "Program:exit"(node) {
                    try {
                        exit?.(node)
                    } finally {
                        open--
                        if (open === 0) {
                            flush()
                        }
                    }
                },
            }
        },
    }
}

export function deferReports(rules) {
    return Object.fromEntries(Object.entries(rules).map(([name, rule]) => [name, wrapRule(rule)]))
}
