import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminReportsPage() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role

  if (!userId || (role !== "ADMIN" && role !== "OWNER")) {
    redirect("/login")
  }

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
  })

  const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.total), 0)

  const totalTransactions = transactions.length

  const salesByDay = transactions.reduce<Record<string, number>>((acc, tx) => {
    const day = new Date(tx.createdAt).toISOString().slice(0, 10)
    acc[day] = (acc[day] ?? 0) + Number(tx.total)
    return acc
  }, {})

  const topItems = transactions.reduce<Record<string, number>>((acc, tx) => {
    const items = tx.items as { items?: { menuId: string; quantity: number }[] } | null
    for (const item of items?.items ?? []) {
      acc[item.menuId] = (acc[item.menuId] ?? 0) + item.quantity
    }
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">Laporan Penjualan — Admin</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Total Penjualan</div>
            <div className="mt-1 text-xl font-bold">Rp {totalRevenue.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Jumlah Transaksi</div>
            <div className="mt-1 text-xl font-bold">{totalTransactions}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Jumlah Item Terjual</div>
            <div className="mt-1 text-xl font-bold">{Object.keys(topItems).length}</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Tanggal</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(salesByDay)
                .sort()
                .map(([day, total]) => (
                  <tr key={day} className="border-t">
                    <td className="p-3">{day}</td>
                    <td className="p-3">Rp {total.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export const dynamic = "force-dynamic";
