import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role

  if (!userId || (role !== "ADMIN" && role !== "OWNER")) {
    redirect("/login")
  }

  const [userCount, menuCount, orderCount, transactionCount, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.menu.count(),
    prisma.order.count(),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      _sum: { total: true },
    }),
  ])

  const totalRevenue = revenue._sum.total ?? 0

  const stats = [
    { label: "Pengguna", value: userCount },
    { label: "Menu", value: menuCount },
    { label: "Pesanan", value: orderCount },
    { label: "Transaksi", value: transactionCount },
    { label: "Total Penjualan", value: `Rp ${Number(totalRevenue).toFixed(2)}` },
  ]

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">Admin — Point of Sale</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola menu, lihat transaksi, dan laporan.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-white p-4">
              <div className="text-sm text-slate-500">{stat.label}</div>
              <div className="mt-1 text-xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/admin/menus" className="rounded-xl border bg-white p-4 font-medium hover:bg-slate-50">
            Kelola Data Menu
          </Link>
          <Link href="/admin/transactions" className="rounded-xl border bg-white p-4 font-medium hover:bg-slate-50">
            Riwayat Transaksi
          </Link>
          <Link href="/admin/reports" className="rounded-xl border bg-white p-4 font-medium hover:bg-slate-50">
            Laporan Penjualan
          </Link>
        </div>
      </div>
    </main>
  )
}

export const dynamic = "force-dynamic";
