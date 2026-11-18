"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const USER_ROLES = ["KASIR", "ADMIN", "OWNER"] as const
export type UserRole = (typeof USER_ROLES)[number]

export async function createUser(input: {
  email: string
  name?: string
  password: string
  role: UserRole
}) {
  const passwordHash = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: passwordHash,
      role: input.role,
    },
  })

  return user
}

export async function updateUserRole(id: string, role: UserRole) {
  return prisma.user.update({
    where: { id },
    data: { role },
  })
}

export async function toggleUserActive(id: string, active: boolean) {
  return prisma.user.update({
    where: { id },
    data: { active },
  })
}
