import { Minus, Plus } from "lucide-react"

export function QuantityStepper({
  quantity,
  max,
  onDecrease,
  onIncrease,
}: {
  quantity: number
  max: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        onClick={onDecrease}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-ink"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-xs font-bold tabular-nums text-ink">{quantity}</span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        onClick={onIncrease}
        disabled={quantity >= max}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
