"use server"

import { getLockState } from "@/lib/lockout-store"

/**
 * Returns only the lock state for the email the user just tried. Failed
 * attempts are tracked for unknown emails too, so this cannot be used to
 * enumerate registered accounts.
 */
export async function getLoginLockState(email: string): Promise<{
  locked: boolean
  remainingSeconds: number
}> {
  const normalized = email.trim().toLowerCase()
  const { locked, lockedUntil } = await getLockState(normalized)
  const remainingSeconds = locked && lockedUntil
    ? Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 1000))
    : 0

  return { locked, remainingSeconds }
}
