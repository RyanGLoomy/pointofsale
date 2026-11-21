"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/session"

const MAX_NAME_LENGTH = 80
const MAX_PRICE = 1_000_000_000
const MAX_STOCK = 999_999

function invalid(message: string): never {
  throw new Error(message)
}

export async function createMenu(input: {
  name: string
  description?: string
  price: number
  stock: number
  category?: string
}) {
  await requirePermission("menu:manage")

  const name = input.name.trim()
  if (name.length < 1 || name.length > MAX_NAME_LENGTH) {
    invalid("Nama menu harus 1-80 karakter.")
  }

  if (!Number.isFinite(input.price) || input.price <= 0 || input.price > MAX_PRICE) {
    invalid("Harga menu harus lebih dari 0.")
  }

  if (!Number.isInteger(input.stock) || input.stock < 0 || input.stock > MAX_STOCK) {
    invalid("Stok tidak valid.")
  }

  const menu = await prisma.menu.create({
    data: {
      name,
      description: input.description?.trim() || undefined,
      price: input.price,
      stock: input.stock,
      category: input.category?.trim() || undefined,
    },
  })

  return menu
}

export async function updateMenu(
  id: string,
  input: {
    name: string
    description?: string
    price: number
    stock: number
    category?: string
    active: boolean
  },
) {
  await requirePermission("menu:manage")

  const name = input.name.trim()
  if (name.length < 1 || name.length > MAX_NAME_LENGTH) {
    invalid("Nama menu harus 1-80 karakter.")
  }

  if (!Number.isFinite(input.price) || input.price <= 0 || input.price > MAX_PRICE) {
    invalid("Harga menu harus lebih dari 0.")
  }

  if (!Number.isInteger(input.stock) || input.stock < 0 || input.stock > MAX_STOCK) {
    invalid("Stok tidak valid.")
  }

  return prisma.menu.update({
    where: { id },
    data: {
      name,
      description: input.description?.trim() || undefined,
      price: input.price,
      stock: input.stock,
      category: input.category?.trim() || undefined,
      active: input.active,
    },
  })
}

export async function setMenuActive(id: string, active: boolean) {
  await requirePermission("menu:manage")

  return prisma.menu.update({
    where: { id },
    data: { active },
  })
}
