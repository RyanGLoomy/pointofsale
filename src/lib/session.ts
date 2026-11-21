import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission, type Permission } from "@/lib/permissions"

export interface ShellUser {
  id: string
  name: string
  email: string
  role: string
}

/**
 * Loads the signed-in user fresh from the database. Role and active state come
 * from the DB, never from the session token, so a stale JWT cannot authorize a
 * page or action after the account has been changed or deactivated.
 */
export async function requireUser(roles?: string[]): Promise<ShellUser> {
  const session = await auth()
  const sessionUser = session?.user

  if (!sessionUser?.id) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  if (!dbUser || !dbUser.active) {
    redirect("/login")
  }

  if (roles && roles.length > 0 && !roles.includes(dbUser.role)) {
    redirect("/login")
  }

  return {
    id: dbUser.id,
    name: dbUser.name ?? "Pengguna",
    email: dbUser.email ?? "",
    role: dbUser.role,
  }
}

/** Server-side authorization gate for pages and server actions. */
export async function requirePermission(permission: Permission): Promise<ShellUser> {
  const user = await requireUser()

  if (!hasPermission(user.role, permission)) {
    redirect("/login")
  }

  return user
}
