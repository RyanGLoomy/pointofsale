import { describe, expect, it } from "vitest"
import { isLocked, nextFailureState, MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES } from "./lockout"

describe("isLocked", () => {
  it("returns false when there is no lock", () => {
    expect(isLocked(null, new Date("2026-11-21T10:00:00Z"))).toBe(false)
  })

  it("returns true while the lock is still active", () => {
    expect(isLocked(new Date("2026-11-21T10:05:00Z"), new Date("2026-11-21T10:04:59Z"))).toBe(true)
  })

  it("returns false once the lock has expired", () => {
    expect(isLocked(new Date("2026-11-21T10:05:00Z"), new Date("2026-11-21T10:05:00Z"))).toBe(false)
  })
})

describe("nextFailureState", () => {
  const now = new Date("2026-11-21T10:00:00Z")

  it("increments the counter below the threshold", () => {
    expect(nextFailureState(MAX_FAILED_ATTEMPTS - 2, now)).toEqual({
      failedCount: MAX_FAILED_ATTEMPTS - 1,
      lockedUntil: null,
    })
  })

  it("locks on the threshold attempt", () => {
    const state = nextFailureState(MAX_FAILED_ATTEMPTS - 1, now)
    expect(state.failedCount).toBe(MAX_FAILED_ATTEMPTS)
    expect(state.lockedUntil?.toISOString()).toBe(
      new Date(now.getTime() + LOCKOUT_MINUTES * 60_000).toISOString(),
    )
  })

  it("keeps an existing lock active", () => {
    const until = new Date(now.getTime() + 60_000)
    expect(nextFailureState(MAX_FAILED_ATTEMPTS, now, until)).toEqual({
      failedCount: MAX_FAILED_ATTEMPTS,
      lockedUntil: until,
    })
  })

  it("restarts the counter after an expired lock", () => {
    const expired = new Date(now.getTime() - 60_000)
    expect(nextFailureState(MAX_FAILED_ATTEMPTS, now, expired)).toEqual({
      failedCount: 1,
      lockedUntil: null,
    })
  })
})
