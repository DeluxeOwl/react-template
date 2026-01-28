/**
 * Cache infrastructure for project-wide analysis tools
 *
 * ESLint processes files one at a time, but knip and jscpd analyze entire projects.
 * This cache allows us to run the tools once and reuse results across all files.
 */

import type { KnipResults, JscpdResults } from "./shared.tool-runner"

interface CacheEntry<T> {
    results:   T
    timestamp: number
}

/**
 * Typed caches for each tool
 * Using separate caches avoids the need for type assertions
 */
const knipCache = new Map<string, CacheEntry<KnipResults>>()
const jscpdCache = new Map<string, CacheEntry<JscpdResults>>()

/**
 * Default cache TTL: 60 seconds
 * This allows re-running ESLint without re-running expensive tools,
 * while ensuring results don't get too stale.
 */
const CACHE_TTL_MS = 60_000

interface GetOrComputeKnipParams {
    projectRoot: string
    ttlMs?:      number
    computeFn:   () => KnipResults
}

/**
 * Get or compute knip results
 */
export function getOrComputeKnip(
    { computeFn, projectRoot, ttlMs = CACHE_TTL_MS }: GetOrComputeKnipParams,
): KnipResults {
    const key = `${projectRoot}:knip`
    const cached = knipCache.get(key)

    if (cached && Date.now() - cached.timestamp < ttlMs) {
        return cached.results
    }

    const results = computeFn()
    knipCache.set(key, { results, timestamp: Date.now() })
    return results
}

interface GetOrComputeJscpdParams {
    projectRoot: string
    ttlMs?:      number
    computeFn:   () => JscpdResults
}

/**
 * Get or compute jscpd results
 */
export function getOrComputeJscpd(
    { computeFn, projectRoot, ttlMs = CACHE_TTL_MS }: GetOrComputeJscpdParams,
): JscpdResults {
    const key = `${projectRoot}:jscpd`
    const cached = jscpdCache.get(key)

    if (cached && Date.now() - cached.timestamp < ttlMs) {
        return cached.results
    }

    const results = computeFn()
    jscpdCache.set(key, { results, timestamp: Date.now() })
    return results
}

/**
 * Clear all caches
 * @lintignore - exposed for testing/debugging purposes
 */
export function clearAllCaches(): void {
    knipCache.clear()
    jscpdCache.clear()
}
