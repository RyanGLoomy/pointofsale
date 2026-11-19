import { ReceiptText, Users, Wallet } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDateTime, formatRupiah } from "@/lib/format"
import { requireUser } from "@/lib/session"
import { AppShell } from "@/components/shell/AppShell"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { PaymentMethodBadge } from "@/components/payment-method-badge"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/ui/stat-card"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"

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

      <Card className="mt-4 overflow-hidden">
        {transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Belum ada transaksi"
            description="Transaksi dari terminal kasir akan muncul di sini."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Waktu</TH>
                <TH>Kasir</TH>
                <TH>Order</TH>
                <TH>Metode</TH>
                <TH className="text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {transactions.map((tx) => (
                <TR key={tx.id}>
                  <TD className="whitespace-nowrap text-xs text-muted">{formatDateTime(tx.createdAt)}</TD>
                  <TD>
                    <div className="font-semibold text-ink">{tx.user?.name ?? tx.user?.email ?? "-"}</div>
                    <div className="text-[11px] capitalize text-muted">{tx.user?.role.toLowerCase() ?? "-"}</div>
                  </TD>
                  <TD className="font-mono text-[11px] text-muted">
                    {tx.orderId ? tx.orderId.slice(0, 8).toUpperCase() : "-"}
                  </TD>
                  <TD>
                    <PaymentMethodBadge method={tx.paymentMethod} />
                  </TD>
                  <TD className="text-right font-bold tabular-nums">{formatRupiah(Number(tx.total))}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </AppShell>
  )
}

export const dynamic = "force-dynamic"
