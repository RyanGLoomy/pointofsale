"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/session"
import { createAccountSchema, resetPasswordSchema, updateAccountSchema } from "@/lib/accounts"

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
} as const

function firstIssue(error: { issues: { message?: string }[] }): string {
  return error.issues[0]?.message ?? "Data akun tidak valid."
}

export async function createAccount(input: unknown) {
  await requirePermission("users:manage")

  const parsed = createAccountSchema.safeParse(input)
  if (!parsed.success) throw new Error(firstIssue(parsed.error))

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) throw new Error("Email sudah terdaftar.")

  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await bcrypt.hash(parsed.data.password, 10),
      role: parsed.data.role,
    },
    select: PUBLIC_FIELDS,
  })
  revalidatePath("/admin/accounts")
  return created
}

export async function updateAccount(id: string, input: unknown) {
  const actor = await requirePermission("users:manage")

  const parsed = updateAccountSchema.safeParse(input)
  if (!parsed.success) throw new Error(firstIssue(parsed.error))

  // Prevent an admin from locking themselves out or silently changing their
  // own role through the account manager.
  if (id === actor.id && (!parsed.data.active || parsed.data.role !== actor.role)) {
    throw new Error("Peran atau status akun sendiri tidak dapat diubah di sini.")
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing && existing.id !== id) throw new Error("Email sudah terdaftar.")

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      active: parsed.data.active,
    },
    select: PUBLIC_FIELDS,
  })
  revalidatePath("/admin/accounts")
  return updated
}

export async function resetAccountPassword(id: string, input: unknown) {
  await requirePermission("users:manage")

  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) throw new Error(firstIssue(parsed.error))

  const updated = await prisma.user.update({
    where: { id },
    data: { password: await bcrypt.hash(parsed.data.password, 10) },
    select: PUBLIC_FIELDS,
  })
  revalidatePath("/admin/accounts")
  return updated
}
