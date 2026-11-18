"use server"

import { prisma } from "@/lib/prisma"

export async function checkoutPOS(input: {
  userId: string
  items: { menuId: string; quantity: number }[]
  paymentMethod: "CASH" | "CARD" | "QRIS"
}): Promise<{ orderId: string; total: number }> {
  const { userId, items, paymentMethod } = input

  const result = await prisma.$transaction(async (tx) => {
    const menus = await tx.menu.findMany({
      where: { id: { in: items.map((item) => item.menuId) }, active: true },
    })

    const menuMap = new Map(menus.map((menu) => [menu.id, menu]))

    let total = 0
    const orderItems: { menuId: string; quantity: number; price: number }[] = []

    for (const item of items) {
      const menu = menuMap.get(item.menuId)
      if (!menu) {
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
        items: {
          orderId: order.id,
          userId,
          items,
        },
        total,
        paymentMethod,
      },
    })

    for (const item of items) {
      await tx.menu.update({
        where: { id: item.menuId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return { orderId: order.id, total }
  })

  return result
}
