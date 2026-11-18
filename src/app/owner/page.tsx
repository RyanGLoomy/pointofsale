import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function OwnerPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  })

  const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.total), 0)
  const transactionCount = transactions.length

  const menuIds = Array.from(
    new Set(
      transactions.flatMap((tx) => {
        const items = tx.items as { items?: { menuId: string; quantity: number }[] } | null
        return (items?.items ?? []).map((item) => item.menuId)
      }),
    ),
  )

  const topMenus = await prisma.menu.findMany({
    where: { id: { in: menuIds } },
    select: { id: true, name: true, price: true, stock: true },
  })

  const topRows = topMenus
    .map((menu) => {
      const quantity = transactions.reduce((sum, tx) => {
        const items = tx.items as { items?: { menuId: string; quantity: number }[] } | null
        const found = (items?.items ?? []).find((item) => item.menuId === menu.id)
        return sum + (found?.quantity ?? 0)
      }, 0)
      return { menu, quantity }
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">Owner — Laporan Penjualan</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan penjualan dan riwayat transaksi.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Total Penjualan</div>
            <div className="mt-1 text-xl font-bold">Rp {totalRevenue.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Jumlah Transaksi</div>
            <div className="mt-1 text-xl font-bold">{transactionCount}</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white">
          <h2 className="p-4 font-semibold">Transaksi Terbaru</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Waktu</th>
                <th className="p-3">Kasir</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-3">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="p-3">{tx.user?.name ?? tx.user?.email ?? "-"}</td>
                  <td className="p-3">Rp {Number(tx.total).toFixed(2)}</td>
                </tr>
              ))}
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-slate-500">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {topRows.length > 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Top Menu Terlaris</h2>
            <ul className="mt-3 space-y-2">
              {topRows.map(({ menu, quantity }) => (
                <li key={menu.id} className="flex justify-between text-sm">
                  <span>
                    {menu.name} × {quantity}
                  </span>
                  <span>Rp {(Number(menu.price) * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  )
}

export const dynamic = "force-dynamic";
