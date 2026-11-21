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

export async function requireUser(roles?: string[]): Promise<ShellUser> {
  const session = await auth()
  const user = session?.user

  if (!user?.id) {
    redirect("/login")
  }

  if (roles && roles.length > 0 && !roles.includes(user.role ?? "")) {
    redirect("/login")
  }

  return {
    id: user.id,
    name: user.name ?? "Pengguna",
    email: user.email ?? "",
    role: user.role ?? "KASIR",
  }
}

/**
 * Server-side authorization gate for server actions. Loads the signed-in user
 * from the database (fresh role/active state) and throws when the permission is
 * not held, so client-supplied role data can never authorize a mutation.
 */
export async function requirePermission(permission: Permission): Promise<ShellUser> {
  const session = await auth()
  const user = session?.user

  if (!user?.id) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  if (!dbUser || !dbUser.active) {
    redirect("/login")
  }

  const shellUser: ShellUser = {
    id: dbUser.id,
    name: dbUser.name ?? "Pengguna",
    email: dbUser.email ?? "",
    role: dbUser.role,
  }

  if (!hasPermission(shellUser.role, permission)) {
    redirect("/login")
  }

  return shellUser
}
