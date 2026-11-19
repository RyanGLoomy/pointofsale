import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { homePathForRole } from "@/lib/role-home"
import { LoginForm } from "./LoginForm"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user?.id) {
    redirect(homePathForRole(session.user.role))
  }

  return <LoginForm />
}
