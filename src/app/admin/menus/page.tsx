import { MenuManager, type MenuRow } from "@/components/MenuManager"
import { AppShell } from "@/components/shell/AppShell"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export default async function AdminMenusPage() {
  const user = await requireUser(["ADMIN", "OWNER"])

  const menus = await prisma.menu.findMany({
    orderBy: { name: "asc" },
  })

  const rows: MenuRow[] = menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    description: menu.description,
    price: Number(menu.price),
    stock: menu.stock,
    category: menu.category,
    active: menu.active,
  }))

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Katalog"
        title="Kelola Data Menu"
        description="Atur nama, harga, stok, dan status ketersediaan setiap menu."
        actions={<Badge tone="ember">{rows.length} menu</Badge>}
      />
      <MenuManager menus={rows} />
    </AppShell>
  )
}

export const dynamic = "force-dynamic"
