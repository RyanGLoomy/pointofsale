import { prisma } from "@/lib/prisma"
import { MenuManager, type MenuRow } from "@/components/MenuManager"

export default async function AdminMenusPage() {
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
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">Kelola Data Menu — Admin</h1>
        <div className="mt-6">
          <MenuManager menus={rows} />
        </div>
      </div>
    </main>
  )
}

export const dynamic = "force-dynamic";
