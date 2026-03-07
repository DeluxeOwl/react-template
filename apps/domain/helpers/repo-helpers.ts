/**
 * REPO TRANSACTION HELPERS
 *
 * Purpose:
 * Provides a unified way to handle database/repository transactions while adhering to
 * the project's 'Errors as Values' (Never Throw) policy.
 *
 * How it works:
 * 1. Transaction Joining: If already within a transaction (isWithinTx: true), it reuses
 *    the current repository and does not create a new transaction boundary.
 * 2. Setup & Execution: For the top-level transaction, it executes the provided 'setup'
 *    function to get a transaction repository instance and a rollback callback.
 * 3. Failure Conditions (Atomic Rollback):
 *    - THROWN Errors: If the provided function 'fn' throws, it catches, rolls back,
 *      and returns a TransactionError.
 *    - RETURNED Errors: If 'fn' returns an Error (or any subclass), it triggers the
 *      rollback and returns that original error value.
 *    - Setup/Rollback Failures: These are wrapped in TransactionError and returned.
 *
 * Result:
 * This ensures that partial changes are rolled back whether you manually return
 * a domain error or an unexpected exception occurs.
 */
import * as errore from "errore"
export class TransactionError extends errore.createTaggedError({
    message: "transaction failed: $reason",
    name:    "TransactionError",
}) {}
export interface SetupResult<Repo> {
    txRepo:   Repo
    rollback: () => Promise<void> | void
}

export interface TransactionFlowParams<Repo, T> {
    currentRepo: Repo
    isWithinTx:  boolean
    fn:          (repo: Repo) => Promise<T>
    setup:       () => Promise<SetupResult<Repo>> | SetupResult<Repo>
}

function handleTXError(error: unknown): TransactionError {
    return new TransactionError({
        cause:  error,
        reason: Error.isError(error) ? error.message : String(error),
    })
}

// oxlint-disable-next-line max-statements
export async function executeTransactionFlow<Repo, T>({
    currentRepo,
    fn,
    isWithinTx,
    setup,
}: TransactionFlowParams<Repo, T>): Promise<T | TransactionError> {
    if (isWithinTx) {
        try {
            return await fn(currentRepo)
        } catch (error) {
            return handleTXError(error)
        }
    }

    let setupRes: SetupResult<Repo>
    try {
        setupRes = await setup()
    } catch (error) {
        return handleTXError(error)
    }

    const { rollback, txRepo } = setupRes

    try {
        const result = await fn(txRepo)
        if (Error.isError(result)) {
            try {
                await rollback()
            } catch (rollbackError) {
                return handleTXError(rollbackError)
            }
        }
        return result
    } catch (fnError) {
        try {
            await rollback()
        } catch (rollbackError) {
            return handleTXError(rollbackError)
        }
        return handleTXError(fnError)
    }
}
