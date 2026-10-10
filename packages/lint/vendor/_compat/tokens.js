// oxc and typescript-estree produce the same tokens (ranges and values) but type three kinds of
// identifier differently. Comparing both token streams over ~37,000 files found exactly these:
// - a strict-mode reserved word used as a name (`member.static`, `let` as a variable) is an
//   "Identifier" in typescript-estree (TypeScript parses it as an Identifier node), "Keyword" in oxc;
// - an identifier that is the object or property of a non-computed member expression inside JSX is a
//   "JSXIdentifier" in typescript-estree (node-utils.ts getTokenType: PropertyAccessExpression with
//   a JSX ancestor), "Identifier" in oxc;
// - the parts of a namespaced JSX name (`svg:path`, `xml:lang`) are "Identifier" in
//   typescript-estree, "JSXIdentifier" in oxc.
// The vendored rules were written against typescript-estree's tokens (@stylistic/indent-binary-ops
// adds an indent after a line that starts with a Keyword, for example), so the tokens of a file are
// retyped in place, once, before its first vendored rule runs. Token objects are shared by
// `ast.tokens`, `tokensAndComments` and every token lookup, so all of them see the change.

const STRICT_RESERVED = new Set(["implements", "interface", "let", "package", "private", "protected", "public", "static", "yield"])
const JSX_SCOPES = new Set(["JSXAttribute", "JSXClosingElement", "JSXClosingFragment", "JSXElement", "JSXFragment", "JSXOpeningElement", "JSXOpeningFragment"])

const done = new WeakSet()

function isJsxMemberPart(node, parent) {
    return parent?.type === "MemberExpression"
        && !parent.computed
        // the object of `(a).b` has a ParenthesizedExpression parent in TypeScript
        && (parent.property === node || parent.range[0] === node.range[0])
}

function collect(ast, visitorKeys) {
    const types = new Map()
    const visit = (node, parent, inJsx) => {
        if (node.type === "Identifier") {
            if (inJsx && isJsxMemberPart(node, parent)) {
                types.set(node.range[0], { from: ["Identifier", "Keyword"], to: "JSXIdentifier" })
            } else if (STRICT_RESERVED.has(node.name)) {
                types.set(node.range[0], { from: ["Keyword"], to: "Identifier" })
            }
        } else if (node.type === "JSXIdentifier" && parent?.type === "JSXNamespacedName") {
            types.set(node.range[0], { from: ["JSXIdentifier"], to: "Identifier" })
        }
        const nested = inJsx || JSX_SCOPES.has(node.type)
        for (const key of visitorKeys[node.type] ?? []) {
            const child = node[key]
            for (const item of Array.isArray(child) ? child : [child]) {
                if (item !== null && typeof item?.type === "string") {
                    visit(item, node, nested)
                }
            }
        }
    }
    visit(ast, null, false)

    return types
}

export function retypeTokens(sourceCode) {
    const ast = sourceCode.ast
    if (done.has(ast)) {
        return
    }
    done.add(ast)
    const types = collect(ast, sourceCode.visitorKeys)
    if (types.size === 0) {
        return
    }
    for (const token of ast.tokens) {
        const change = types.get(token.range[0])
        if (change !== undefined && change.from.includes(token.type)) {
            token.type = change.to
        }
    }
}
