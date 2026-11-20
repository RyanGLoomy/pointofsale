import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { homePathForRole } from "@/lib/role-home"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "Masuk",
}

export default async function LoginPage() {
  const session = await auth()

  if (session?.user?.id) {
    redirect(homePathForRole(session.user.role))
  }

  return <LoginForm />
}
