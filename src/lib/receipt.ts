export type PaymentMethod = "CASH" | "CARD" | "QRIS"

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  CARD: "Kartu",
  QRIS: "QRIS",
}

export function paymentLabel(method: PaymentMethod): string {
  return PAYMENT_LABELS[method]
}

export interface ReceiptLine {
  name: string
  quantity: number
  price: number
}

export interface ReceiptData {
  orderId: string
  total: number
  method: PaymentMethod
  createdAt: string | Date
  lines: ReceiptLine[]
  cashierName?: string
  cashReceived?: number
}

export const STORE_PROFILE = {
  name: process.env.NEXT_PUBLIC_STORE_NAME ?? "RM Gerobak Hayam Taman Sari",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "",
}

/**
 * Human-readable receipt number, e.g. TRX-20261120-4F9A2C. Derived from the
 * creation date and the order UUID so it stays stable without a schema change.
 */
export function buildReceiptNumber(orderId: string, createdAt: Date | string): string {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  const compact = orderId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  const suffix = compact.slice(-6).padStart(6, "0")

  return `TRX-${year}${month}${day}-${suffix}`
}
