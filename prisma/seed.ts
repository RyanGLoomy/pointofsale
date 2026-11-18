import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10)
  const ownerPasswordHash = await bcrypt.hash("Owner123!", 10)
  const kasirPasswordHash = await bcrypt.hash("Kasir123!", 10)

  await prisma.user.upsert({
    where: { email: "admin@pointofsale.id" },
    update: { name: "Admin", password: adminPasswordHash, role: "ADMIN", active: true },
    create: { email: "admin@pointofsale.id", name: "Admin", password: adminPasswordHash, role: "ADMIN", active: true },
  })

  await prisma.user.upsert({
    where: { email: "owner@pointofsale.id" },
    update: { name: "Owner", password: ownerPasswordHash, role: "OWNER", active: true },
    create: { email: "owner@pointofsale.id", name: "Owner", password: ownerPasswordHash, role: "OWNER", active: true },
  })

  await prisma.user.upsert({
    where: { email: "kasir@pointofsale.id" },
    update: { name: "Kasir", password: kasirPasswordHash, role: "KASIR", active: true },
    create: { email: "kasir@pointofsale.id", name: "Kasir", password: kasirPasswordHash, role: "KASIR", active: true },
  })

  const sampleMenus = [
    { name: "Kopi Suroko", description: "Kopi hitam", price: 15000, stock: 100, category: "Minuman" },
    { name: "Teh Tarik", description: "Teh manis", price: 10000, stock: 80, category: "Minuman" },
    { name: "Nasi Ayam", description: "Nasi + ayam + sambal", price: 25000, stock: 50, category: "Makanan" },
  ]

  for (const menu of sampleMenus) {
    const existing = await prisma.menu.findFirst({ where: { name: menu.name } })
    if (existing) {
      await prisma.menu.update({
        where: { id: existing.id },
        data: { price: menu.price, stock: menu.stock, category: menu.category, active: true },
      })
    } else {
      await prisma.menu.create({ data: menu })
    }
  }

  console.log("Seed completed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
