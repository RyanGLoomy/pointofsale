import { describe, expect, it } from "vitest"
import { validateCheckoutInput, type CheckoutInput } from "./checkout"

const validPayload: CheckoutInput = {
  userId: "user-1",
  items: [{ menuId: "menu-1", quantity: 2 }],
  paymentMethod: "CASH",
}

describe("validateCheckoutInput", () => {
  it("accepts a valid checkout payload", () => {
    expect(validateCheckoutInput(validPayload)).toEqual({ ok: true, value: validPayload })
  })

  it("accepts multiple distinct menu lines", () => {
    expect(
      validateCheckoutInput({
        userId: "user-1",
        items: [
          { menuId: "menu-1", quantity: 1 },
          { menuId: "menu-2", quantity: 3 },
        ],
        paymentMethod: "QRIS",
      }),
    ).toEqual({
      ok: true,
      value: {
        userId: "user-1",
        items: [
          { menuId: "menu-1", quantity: 1 },
          { menuId: "menu-2", quantity: 3 },
        ],
        paymentMethod: "QRIS",
      },
    })
  })

  it("rejects an empty or missing item list", () => {
    expect(validateCheckoutInput({ ...validPayload, items: [] })).toEqual({
      ok: false,
      error: expect.any(String),
    })
    expect(validateCheckoutInput({ ...validPayload, items: undefined })).toEqual({
      ok: false,
      error: expect.any(String),
    })
  })

  it("rejects duplicate menu lines", () => {
    const result = validateCheckoutInput({
      ...validPayload,
      items: [
        { menuId: "menu-1", quantity: 1 },
        { menuId: "menu-1", quantity: 2 },
      ],
    })

    expect(result.ok).toBe(false)
  })

  it("rejects quantities below one or above the limit", () => {
    expect(validateCheckoutInput({ ...validPayload, items: [{ menuId: "menu-1", quantity: 0 }] }).ok).toBe(
      false,
    )
    expect(
      validateCheckoutInput({ ...validPayload, items: [{ menuId: "menu-1", quantity: 100 }] }).ok,
    ).toBe(false)
  })

  it("rejects more than the maximum number of lines", () => {
    const items = Array.from({ length: 51 }, (_, index) => ({
      menuId: `menu-${index}`,
      quantity: 1,
    }))

    expect(validateCheckoutInput({ ...validPayload, items }).ok).toBe(false)
  })

  it("rejects an unknown payment method", () => {
    expect(validateCheckoutInput({ ...validPayload, paymentMethod: "TRANSFER" }).ok).toBe(false)
  })

  it("rejects a missing user id", () => {
    expect(validateCheckoutInput({ ...validPayload, userId: "" }).ok).toBe(false)
  })
})
