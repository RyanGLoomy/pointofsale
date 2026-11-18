"use server"

import { prisma } from "@/lib/prisma"

export async function createMenu(input: {
  name: string
  description?: string
  price: number
  stock: number
  category?: string
}) {
  const menu = await prisma.menu.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      category: input.category,
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
  return prisma.menu.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      category: input.category,
      active: input.active,
    },
  })
}

export async function setMenuActive(id: string, active: boolean) {
  return prisma.menu.update({
    where: { id },
    data: { active },
  })
}
