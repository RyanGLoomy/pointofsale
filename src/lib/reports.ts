export interface ReportTransaction {
  total: unknown
  createdAt: Date | string
  items: unknown
}

export interface DailyTotal {
  day: string
  total: number
}

export interface ItemQuantity {
  menuId: string
  quantity: number
}

export function toAmount(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function extractItemQuantities(items: unknown): ItemQuantity[] {
  const payload = items as { items?: unknown } | null
  if (!payload || !Array.isArray(payload.items)) return []

  return payload.items.flatMap((entry) => {
    if (entry === null || typeof entry !== "object") return []
    const item = entry as { menuId?: unknown; quantity?: unknown }
    if (typeof item.menuId !== "string") return []
    if (typeof item.quantity !== "number" || !Number.isFinite(item.quantity) || item.quantity <= 0) {
      return []
    }
    return [{ menuId: item.menuId, quantity: item.quantity }]
  })
}

export function buildDailyTotals(transactions: ReportTransaction[]): DailyTotal[] {
  const totals = new Map<string, number>()

  for (const transaction of transactions) {
    const day = new Date(transaction.createdAt).toISOString().slice(0, 10)
    totals.set(day, (totals.get(day) ?? 0) + toAmount(transaction.total))
  }

  return Array.from(totals, ([day, total]) => ({ day, total })).sort((a, b) =>
    a.day.localeCompare(b.day),
  )
}

export function fillDailySeries(
  data: DailyTotal[],
  options: { days?: number; reference?: Date } = {},
): DailyTotal[] {
  const days = Math.max(1, Math.floor(options.days ?? 14))
  const reference = options.reference ?? new Date()
  const end = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate(),
  )
  const totals = new Map(data.map((entry) => [entry.day, entry.total]))

  return Array.from({ length: days }, (_, index) => {
    const day = new Date(end - (days - 1 - index) * 86_400_000).toISOString().slice(0, 10)
    return { day, total: totals.get(day) ?? 0 }
  })
}

export function buildItemQuantities(transactions: ReportTransaction[]): Map<string, number> {
  const quantities = new Map<string, number>()

  for (const transaction of transactions) {
    for (const item of extractItemQuantities(transaction.items)) {
      quantities.set(item.menuId, (quantities.get(item.menuId) ?? 0) + item.quantity)
    }
  }

  return quantities
}
