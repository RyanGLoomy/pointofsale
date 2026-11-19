import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { homePathForRole } from "@/lib/role-home"

export default async function Home() {
  const session = await auth()
  const user = session?.user

  redirect(user?.id ? homePathForRole(user.role) : "/login")
}
