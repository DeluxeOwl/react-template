export interface AstGrepSuppression {
    /** Zero-based start line from ast-grep's JSON output. */
    line:   number
    ruleId: string
}

function groupByLine(findings: AstGrepSuppression[]): Map<number, Set<string>> {
    const sites = new Map<number, Set<string>>()

    for (const { line, ruleId } of findings) {
        const rules = sites.get(line) ?? new Set<string>()

        rules.add(ruleId)
        sites.set(line, rules)
    }

    return sites
}

function formatDirective(text: string, rules: Set<string>): { deleteCount: number, lines: string[] } {
    const indent = /^[ \t]*/u.exec(text)?.[0] ?? ""
    const unit = indent.includes("\t") ? "\t" : "    "
    const directive = `// ast-grep-ignore: ${[...rules].toSorted().join(", ")}`
    const body = text.trimStart()

    // JSX expression comments must follow the opening brace on their own line.
    // A JSX block comment beside the brace is an unused suppression.
    return body.startsWith("{")
        ? { deleteCount: 1, lines: [`${indent}{`, `${indent}${unit}${directive}`, `${indent}${unit}${body.slice(1)}`] }
        : { deleteCount: 0, lines: [`${indent}${directive}`] }
}

/** Add directives that both the ast-grep CLI and language server recognize. */
export function addAstGrepSuppressions(source: string, findings: AstGrepSuppression[]): Error | string {
    const newline = source.includes("\r\n") ? "\r\n" : "\n"
    const lines = source.split(newline)
    const sites = [...groupByLine(findings)].toSorted(([left], [right]) => right - left)

    for (const [line, rules] of sites) {
        const text = lines.at(line)

        if (!Number.isInteger(line) || line < 0 || text === undefined) {
            return new Error(`Invalid ast-grep start line: ${line}.`)
        }
        if (rules.has("unused-suppression")) {
            return new Error("Unused ast-grep directives must be removed, not suppressed.")
        }

        const patch = formatDirective(text, rules)

        lines.splice(line, patch.deleteCount, ...patch.lines)
    }

    return lines.join(newline)
}
