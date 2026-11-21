"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/session"
import { validateCheckoutInput } from "@/lib/checkout"

export async function checkoutPOS(input: unknown): Promise<{ orderId: string; total: number }> {
  const session = await requirePermission("transactions:create")
  const validated = validateCheckoutInput(input)

  if (!validated.ok) {
    throw new Error(validated.error)
  }

  const { items, paymentMethod } = validated.value
  const userId = session.id

  const result = await prisma.$transaction(async (tx) => {
    const menus = await tx.menu.findMany({
      where: { id: { in: items.map((item) => item.menuId) } },
    })

    const menuMap = new Map(menus.map((menu) => [menu.id, menu]))

    let total = 0
    const orderItems: { menuId: string; quantity: number; price: number }[] = []

    for (const item of items) {
      const menu = menuMap.get(item.menuId)
      if (!menu || !menu.active) {
        throw new Error("Menu tidak ditemukan.")
      }
      if (menu.stock < item.quantity) {
        throw new Error(`Stok tidak mencukupi untuk ${menu.name}.`)
      }
      total += Number(menu.price) * item.quantity
      orderItems.push({ menuId: menu.id, quantity: item.quantity, price: Number(menu.price) })
    }

    const order = await tx.order.create({
      data: {
        userId,
        status: "COMPLETED",
        total,
        items: { create: orderItems },
      },
    })

    await tx.transaction.create({
      data: {
        orderId: order.id,
        userId,
        items: { items: orderItems.map((item) => ({ menuId: item.menuId, quantity: item.quantity })) },
        total,
        paymentMethod,
      },
    })

    for (const item of orderItems) {
      // Atomic conditional decrement: fails without partial stock changes.
      const updated = await tx.menu.updateMany({
        where: { id: item.menuId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })

      if (updated.count !== 1) {
        throw new Error(`Stok tidak mencukupi untuk menu id ${item.menuId}.`)
      }
    }

    return { orderId: order.id, total }
  })

  return result
}
