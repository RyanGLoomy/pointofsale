import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { homePathForRole } from "@/lib/role-home"
import { prisma } from "@/lib/prisma"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "Masuk",
}

export default async function LoginPage() {
  const session = await auth()

  if (session?.user?.id) {
    redirect(homePathForRole(session.user.role))
  }

  const showcase = await prisma.menu.findMany({
    where: { active: true, imageUrl: { not: null } },
    select: { imageUrl: true },
    orderBy: { name: "asc" },
    take: 4,
  })

  return <LoginForm photos={showcase.map((menu) => menu.imageUrl).filter((url): url is string => Boolean(url))} />
}
