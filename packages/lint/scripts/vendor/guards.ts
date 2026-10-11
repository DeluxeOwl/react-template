// Narrowing for values of unknown shape (imported upstream modules, required data files).
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

export function field(value: unknown, key: string): unknown {
    return isRecord(value) ? value[key] : undefined
}

export function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : []
}
