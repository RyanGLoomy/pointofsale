import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminTransactionsPage() {
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

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">Riwayat Transaksi — Admin</h1>
        <div className="mt-6 rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Waktu</th>
                <th className="p-3">Kasir</th>
                <th className="p-3">Order</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-3">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="p-3">{tx.user?.name ?? tx.user?.email ?? "-"}</td>
                  <td className="p-3">{tx.orderId ?? "-"}</td>
                  <td className="p-3">Rp {Number(tx.total).toFixed(2)}</td>
                  <td className="p-3">{"—"} </td>
                </tr>
              ))}
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-slate-500">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export const dynamic = "force-dynamic";
