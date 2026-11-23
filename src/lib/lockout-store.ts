import { prisma } from "@/lib/prisma"
import { isLocked, nextFailureState } from "./lockout"

export interface LockState {
  locked: boolean
  lockedUntil: Date | null
}

/** Reads the current lock state for a normalized email. */
export async function getLockState(email: string): Promise<LockState> {
  const record = await prisma.loginAttempt.findUnique({ where: { email } })
  const lockedUntil = record?.lockedUntil ?? null

  return { locked: isLocked(lockedUntil), lockedUntil }
}

/** Records one failed attempt and returns the resulting lock state. */
export async function registerFailedLogin(email: string): Promise<LockState> {
  const record = await prisma.loginAttempt.findUnique({ where: { email } })
  const next = nextFailureState(record?.failedCount ?? 0, new Date(), record?.lockedUntil ?? null)

  await prisma.loginAttempt.upsert({
    where: { email },
    create: { email, ...next },
    update: next,
  })

  return getLockState(email)
}

/** Clears the counter after a successful sign-in. */
export async function clearFailedLogins(email: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { email } })
}
