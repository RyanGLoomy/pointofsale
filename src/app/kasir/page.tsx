import { prisma } from "@/lib/prisma"
import { PosTerminal } from "@/components/PosTerminal"
import { AppShell } from "@/components/shell/AppShell"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { requireUser } from "@/lib/session"

export default async function KasirPage() {
  const user = await requireUser(["KASIR", "ADMIN", "OWNER"])

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
    <AppShell user={user}>
      <PageHeader
        eyebrow="Terminal"
        title="Kasir"
        description="Pilih menu, susun pesanan, lalu proses pembayaran."
        actions={<Badge tone="success">Shift aktif</Badge>}
      />
      <PosTerminal items={items} userId={user.id} cashierName={user.name} />
    </AppShell>
  )
}

export const dynamic = "force-dynamic"
