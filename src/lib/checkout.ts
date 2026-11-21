export const MAX_CHECKOUT_LINES = 50
export const MAX_LINE_QUANTITY = 99

export type CheckoutPaymentMethod = "CASH" | "CARD" | "QRIS"

export interface CheckoutLineInput {
  menuId: string
  quantity: number
}

export interface CheckoutInput {
  userId: string
  items: CheckoutLineInput[]
  paymentMethod: CheckoutPaymentMethod
}

export type CheckoutValidationResult =
  | { ok: true; value: CheckoutInput }
  | { ok: false; error: string }

function invalid(error: string): CheckoutValidationResult {
  return { ok: false, error }
}

/**
 * Validates a POS checkout payload before it touches the database.
 * Pure function so the rules stay unit-testable without Prisma or auth.
 */
export function validateCheckoutInput(input: unknown): CheckoutValidationResult {
  if (!input || typeof input !== "object") {
    return invalid("Payload checkout tidak valid.")
  }

  const candidate = input as Record<string, unknown>
  const userId = typeof candidate.userId === "string" ? candidate.userId.trim() : ""
  if (!userId) {
    return invalid("User wajib diisi.")
  }

  const rawItems = candidate.items
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return invalid("Item checkout wajib ada.")
  }
  if (rawItems.length > MAX_CHECKOUT_LINES) {
    return invalid(`Maksimal ${MAX_CHECKOUT_LINES} item per transaksi.`)
  }

  const items: CheckoutLineInput[] = []
  const seenMenuIds = new Set<string>()

  for (const entry of rawItems) {
    if (!entry || typeof entry !== "object") {
      return invalid("Item checkout tidak valid.")
    }

    const line = entry as Record<string, unknown>
    const menuId = typeof line.menuId === "string" ? line.menuId.trim() : ""
    const quantity = typeof line.quantity === "number" ? Math.floor(line.quantity) : Number(line.quantity)

    if (!menuId) {
      return invalid("Menu wajib valid.")
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      return invalid("Jumlah item tidak valid.")
    }
    if (seenMenuIds.has(menuId)) {
      return invalid("Menu duplikat dalam satu transaksi.")
    }

    seenMenuIds.add(menuId)
    items.push({ menuId, quantity })
  }

  const paymentMethod = candidate.paymentMethod
  if (paymentMethod !== "CASH" && paymentMethod !== "CARD" && paymentMethod !== "QRIS") {
    return invalid("Metode pembayaran tidak valid.")
  }

  return { ok: true, value: { userId, items, paymentMethod } }
}
