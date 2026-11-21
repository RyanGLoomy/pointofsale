import { headers } from "next/headers"
import { PackageSearch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export interface TopMenuRow {
  menuId: string
  name: string
  quantity: number
}

export async function TopMenusCard({ rows }: { rows: TopMenuRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.quantity))
  const totalItems = rows.reduce((sum, row) => sum + row.quantity, 0)

  const widths = rows.map((row) => Math.max(6, Math.round((row.quantity / max) * 100)))
  const nonce = (await headers()).get("x-nonce") ?? ""
  const css = Array.from(new Set(widths), (width) => `.top-menu-w-${width}{width:${width}%}`).join("")

  return (
    <Card className="flex h-full flex-col">
      <style nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
      <CardHeader>
        <CardTitle>Menu Terlaris</CardTitle>
        <Badge tone="neutral">Top 5</Badge>
      </CardHeader>

      {rows.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Belum ada data menu"
          description="Menu terlaris dihitung dari item pada transaksi."
        />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((row, index) => (
            <li key={row.menuId} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ember/10 text-[11px] font-bold text-ember">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                  {row.name}
                </span>
                <Badge tone="neutral">{row.quantity} terjual</Badge>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink/10">
                <div className={`top-menu-w-${widths[index]} h-full rounded-full bg-ember`} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 ? (
        <div className="mt-auto flex items-center justify-between border-t border-line px-4 py-2.5 text-[11px] text-muted">
          <span>{rows.length} menu terjual</span>
          <span>{totalItems} item</span>
        </div>
      ) : null}
    </Card>
  )
}
