import { redirect } from "next/navigation"
import { auth } from "@/auth"

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
