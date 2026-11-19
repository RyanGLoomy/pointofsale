import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PosTerminal } from "@/components/PosTerminal"
import { redirect } from "next/navigation"

export default async function KasirPage() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role

  if (!userId || !["KASIR", "ADMIN", "OWNER"].includes(role ?? "")) {
    redirect("/login")
  }

  const menus = await prisma.menu.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })

  const items = menus.map((m) => ({
    id: m.id,
    name: m.name,
    price: Number(m.price),
    stock: m.stock,
    category: m.category,
  }))

  return <PosTerminal items={items} userId={userId} />
}

export const dynamic = "force-dynamic";
