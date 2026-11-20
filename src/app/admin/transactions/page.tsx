import { ReceiptText, Users, Wallet } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatRupiah } from "@/lib/format"
import { requireUser } from "@/lib/session"
import { AppShell } from "@/components/shell/AppShell"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { TransactionHistory, type TransactionRow } from "@/components/TransactionHistory"

export const metadata = { title: "Riwayat Transaksi" }

export default async function AdminTransactionsPage() {
  const user = await requireUser(["ADMIN", "OWNER"])

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  })

  const orderIds = transactions
    .map((tx) => tx.orderId)
    .filter((orderId): orderId is string => Boolean(orderId))

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    include: {
      items: {
        include: {
          menu: { select: { name: true } },
        },
      },
    },
  })
  const orderMap = new Map(orders.map((order) => [order.id, order]))

  const rows: TransactionRow[] = transactions.map((tx) => {
    const order = tx.orderId ? orderMap.get(tx.orderId) : undefined
    const lines = (order?.items ?? []).map((item) => ({
      name: item.menu.name,
      quantity: item.quantity,
      price: Number(item.price),
    }))

    return {
      id: tx.id,
      orderId: tx.orderId,
      createdAt: tx.createdAt.toISOString(),
      total: Number(tx.total),
      paymentMethod: tx.paymentMethod,
      cashierName: tx.user?.name ?? tx.user?.email ?? "-",
      cashierRole: tx.user?.role ?? "-",
      lines,
    }
  })

  const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.total), 0)
  const cashierCount = new Set(transactions.map((tx) => tx.userId)).size

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Riwayat"
        title="Riwayat Transaksi"
        description="Semua pembayaran yang tercatat di sistem, terbaru di atas."
        actions={<Badge tone="neutral">{transactions.length} transaksi</Badge>}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total Transaksi" value={transactions.length} icon={ReceiptText} />
        <StatCard label="Total Penjualan" value={formatRupiah(totalRevenue)} icon={Wallet} accent />
        <StatCard label="Kasir Terlibat" value={cashierCount} icon={Users} />
      </div>

      <TransactionHistory rows={rows} />
    </AppShell>
  )
}

export const dynamic = "force-dynamic"
