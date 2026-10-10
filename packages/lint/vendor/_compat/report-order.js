// Makes oxlint pick the same fix as ESLint when two reports want to fix the same range.
//
// ESLint sorts a file's problems by (line, column) — ties in report order, which is the order of
// the rules in the config — then applies fixes sorted by range with a stable sort, skipping any fix
// that overlaps one already applied. So of several fixes with the same range, only the first in
// (line, column, rule order) can be applied in a pass. oxlint sorts fixes by range with an unstable
// sort (oxc_linter fixer/mod.rs `sort_unstable_by_key`), so which of them wins is arbitrary.
// Example: for `}   ,` @stylistic/no-multi-spaces (column 13) wants " " and
// @stylistic/comma-spacing (column 16) wants "" on the same three spaces; ESLint applies " ".
//
// deferReports() wraps rules so their reports are queued and emitted at the end of the file sorted
// like ESLint's problems, and drops the fix from any report whose fix range was already taken by an
// earlier report — the fix ESLint could never apply in this pass. The diagnostic is still reported.
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

function flush() {
    const pending = queue.sort((a, b) => a.line - b.line || a.column - b.column || a.sequence - b.sequence)
    const taken = new Set()
    for (const item of pending) {
        const fix = item.descriptor.fix?.()
        if (fix !== undefined) {
            const span = `${fix.range[0]}:${fix.range[1]}`
            if (taken.has(span)) {
                item.descriptor = { ...item.descriptor, fix: undefined }
            }
            taken.add(span)
        }
        item.context.report(item.descriptor)
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
