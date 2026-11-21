import { MenuManager, type MenuRow } from "@/components/MenuManager"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/session"

export const metadata = { title: "Kelola Menu" }

export default async function AdminMenusPage() {
  await requirePermission("menu:manage")

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
    <>
      <PageHeader
        eyebrow="Katalog"
        title="Kelola Data Menu"
        description="Atur nama, harga, stok, dan status ketersediaan setiap menu."
        actions={<Badge tone="ember">{rows.length} menu</Badge>}
      />
      <MenuManager menus={rows} />
    </>
  )
}

export const dynamic = "force-dynamic"
