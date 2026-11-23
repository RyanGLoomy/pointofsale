import { describe, expect, it } from "vitest"
import { buildReceiptNumber, PAYMENT_LABELS, paymentLabel, STORE_PROFILE } from "./receipt"

describe("buildReceiptNumber", () => {
  const orderId = "12345678-90ab-cdef-1234-567890abcdef"

  it("combines the local date and the end of the order id", () => {
    expect(buildReceiptNumber(orderId, new Date(2026, 10, 20, 10, 30))).toBe(
      "TRX-20261120-ABCDEF",
    )
  })

  it("pads month and day", () => {
    expect(buildReceiptNumber(orderId, new Date(2026, 0, 5, 8, 0))).toBe("TRX-20260105-ABCDEF")
  })

  it("accepts ISO strings", () => {
    expect(buildReceiptNumber(orderId, "2026-11-20T03:00:00.000Z")).toMatch(
      /^TRX-\d{8}-ABCDEF$/,
    )
  })

  it("pads short ids", () => {
    expect(buildReceiptNumber("abc", new Date(2026, 10, 20))).toBe("TRX-20261120-000ABC")
  })

  it("is stable for the same input", () => {
    const at = new Date(2026, 10, 20, 10, 30)
    expect(buildReceiptNumber(orderId, at)).toBe(buildReceiptNumber(orderId, at))
  })
})

describe("STORE_PROFILE", () => {
  it("uses the shop name on receipts and reports", () => {
    expect(STORE_PROFILE.name).toBe("RM Gerobak Hayam Taman Sari")
  })
})

describe("paymentLabel", () => {
  it("maps every method to an Indonesian label", () => {
    expect(paymentLabel("CASH")).toBe("Tunai")
    expect(paymentLabel("CARD")).toBe("Kartu")
    expect(paymentLabel("QRIS")).toBe("QRIS")
  })

  it("exposes the label record", () => {
    expect(Object.keys(PAYMENT_LABELS)).toEqual(["CASH", "CARD", "QRIS"])
  })
})
