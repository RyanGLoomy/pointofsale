import { prisma } from "@/lib/prisma"
import { PosTerminal } from "@/components/PosTerminal"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { requirePermission } from "@/lib/session"

export const metadata = { title: "Kasir" }

export default async function KasirPage() {
  const user = await requirePermission("transactions:create")

  const menus = await prisma.menu.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })

  const items = menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    price: Number(menu.price),
    stock: menu.stock,
    category: menu.category,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Terminal"
        title="Kasir"
        description="Pilih menu, susun pesanan, lalu proses pembayaran."
        actions={<Badge tone="success">Shift aktif</Badge>}
      />
      <PosTerminal items={items} cashierName={user.name} />
    </>
  )
}

export const dynamic = "force-dynamic"
