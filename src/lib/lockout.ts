export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MINUTES = 5

export interface FailureState {
  failedCount: number
  lockedUntil: Date | null
}

/** Pure lock window check — shared by the auth flow and the status action. */
export function isLocked(lockedUntil: Date | null, now: Date = new Date()): boolean {
  return lockedUntil !== null && lockedUntil.getTime() > now.getTime()
}

/** Computes the next lockout state after one failed login attempt. */
export function nextFailureState(
  failedCount: number,
  now: Date = new Date(),
  previousLock: Date | null = null,
): FailureState {
  if (isLocked(previousLock, now)) {
    return { failedCount, lockedUntil: previousLock }
  }

  if (previousLock !== null) {
    // An expired lock starts a fresh window.
    return { failedCount: 1, lockedUntil: null }
  }

  const count = failedCount + 1
  if (count >= MAX_FAILED_ATTEMPTS) {
    return {
      failedCount: count,
      lockedUntil: new Date(now.getTime() + LOCKOUT_MINUTES * 60_000),
    }
  }

  return { failedCount: count, lockedUntil: null }
}
