import { Package, ReceiptText, TrendingUp, Wallet } from "lucide-react"
import { formatRupiah } from "@/lib/format"
import { StatCard } from "@/components/ui/stat-card"

export function KpiGrid({
  totalRevenue,
  transactionCount,
  itemCount,
  average,
}: {
  totalRevenue: number
  transactionCount: number
  itemCount: number
  average: number
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Penjualan" value={formatRupiah(totalRevenue)} icon={Wallet} accent />
      <StatCard label="Jumlah Transaksi" value={transactionCount} icon={ReceiptText} />
      <StatCard label="Item Terjual" value={itemCount} icon={Package} />
      <StatCard label="Rata-rata Transaksi" value={formatRupiah(average)} icon={TrendingUp} />
    </div>
  )
}
