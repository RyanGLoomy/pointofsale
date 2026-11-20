import { describe, expect, it } from "vitest"
import {
  addLine,
  cartCount,
  cartTotal,
  decreaseLine,
  increaseLine,
  insertLine,
  removeLine,
  sanitizeCart,
  type CartItem,
  type CartLine,
} from "./cart"

const coffee: CartItem = { id: "coffee", name: "Kopi", price: 15000, stock: 3 }
const tea: CartItem = { id: "tea", name: "Teh", price: 10000, stock: 10 }

function line(overrides: Partial<CartLine> = {}): CartLine {
  return { menuId: "coffee", name: "Kopi", price: 15000, quantity: 1, stock: 3, ...overrides }
}

describe("addLine", () => {
  it("adds a new line with quantity one", () => {
    expect(addLine([], coffee)).toEqual([line()])
  })

  it("increments an existing line", () => {
    expect(addLine([line()], coffee)[0].quantity).toBe(2)
  })

  it("does not exceed stock", () => {
    const cart = [line({ quantity: 3 })]
    expect(addLine(cart, coffee)).toBe(cart)
  })

  it("does not mutate the input cart", () => {
    const cart = [line()]
    addLine(cart, coffee)
    expect(cart[0].quantity).toBe(1)
  })
})

describe("decreaseLine", () => {
  it("decrements a line above one", () => {
    expect(decreaseLine([line({ quantity: 2 })], "coffee")[0].quantity).toBe(1)
  })

  it("removes a line at quantity one", () => {
    expect(decreaseLine([line()], "coffee")).toEqual([])
  })

  it("leaves unknown lines untouched", () => {
    expect(decreaseLine([line()], "unknown")).toEqual([line()])
  })
})

describe("increaseLine", () => {
  it("increments below stock", () => {
    expect(increaseLine([line()], "coffee")[0].quantity).toBe(2)
  })

  it("clamps at stock", () => {
    expect(increaseLine([line({ quantity: 3 })], "coffee")[0].quantity).toBe(3)
  })
})

describe("removeLine", () => {
  it("removes the matching line", () => {
    expect(removeLine([line(), line({ menuId: "tea", name: "Teh", price: 10000 })], "tea")).toEqual([
      line(),
    ])
  })
})

describe("insertLine", () => {
  it("restores a removed line at its original position", () => {
    const teaLine = line({ menuId: "tea", name: "Teh", price: 10000 })
    const restored = insertLine([line()], teaLine, 0)
    expect(restored.map((entry) => entry.menuId)).toEqual(["tea", "coffee"])
  })

  it("clamps the quantity to the current stock", () => {
    const restored = insertLine([], line({ quantity: 99 }), 0)
    expect(restored[0].quantity).toBe(3)
  })

  it("skips a line whose stock is exhausted", () => {
    expect(insertLine([], line({ stock: 0 }), 0)).toEqual([])
  })

  it("clamps an out-of-range index", () => {
    const teaLine = line({ menuId: "tea", name: "Teh", price: 10000 })
    expect(insertLine([line()], teaLine, 99).map((entry) => entry.menuId)).toEqual([
      "coffee",
      "tea",
    ])
  })
})

describe("cartTotal and cartCount", () => {
  it("sums line totals", () => {
    const cart = [line({ quantity: 2 }), line({ menuId: "tea", price: 10000, quantity: 3 })]
    expect(cartTotal(cart)).toBe(60000)
  })

  it("counts units rather than lines", () => {
    const cart = [line({ quantity: 2 }), line({ menuId: "tea", price: 10000, quantity: 3 })]
    expect(cartCount(cart)).toBe(5)
  })

  it("returns zero for an empty cart", () => {
    expect(cartTotal([])).toBe(0)
    expect(cartCount([])).toBe(0)
  })
})

describe("sanitizeCart", () => {
  it("restores valid stored lines using current menu data", () => {
    const stored = [{ menuId: "coffee", quantity: 2, price: 1, name: "Old name" }]
    expect(sanitizeCart(stored, [coffee])).toEqual([line({ quantity: 2 })])
  })

  it("drops unknown menu ids", () => {
    expect(sanitizeCart([{ menuId: "ghost", quantity: 1 }], [coffee])).toEqual([])
  })

  it("drops inactive menus", () => {
    expect(sanitizeCart([{ menuId: "coffee", quantity: 1 }], [])).toEqual([])
  })

  it("drops menus that are out of stock", () => {
    expect(sanitizeCart([{ menuId: "coffee", quantity: 1 }], [{ ...coffee, stock: 0 }])).toEqual([])
  })

  it("clamps quantities to available stock", () => {
    const restored = sanitizeCart([{ menuId: "coffee", quantity: 99 }], [coffee])
    expect(restored[0].quantity).toBe(3)
  })

  it("merges duplicate lines without exceeding stock", () => {
    const restored = sanitizeCart(
      [
        { menuId: "coffee", quantity: 2 },
        { menuId: "coffee", quantity: 2 },
      ],
      [coffee],
    )
    expect(restored).toHaveLength(1)
    expect(restored[0].quantity).toBe(3)
  })

  it("rejects malformed payloads", () => {
    expect(sanitizeCart(null, [coffee])).toEqual([])
    expect(sanitizeCart("nope", [coffee])).toEqual([])
    expect(sanitizeCart([null, 42, { menuId: 7 }], [coffee])).toEqual([])
  })

  it("rejects non-positive quantities", () => {
    expect(sanitizeCart([{ menuId: "coffee", quantity: 0 }], [coffee])).toEqual([])
  })

  it("preserves stored order", () => {
    const restored = sanitizeCart(
      [
        { menuId: "tea", quantity: 1 },
        { menuId: "coffee", quantity: 1 },
      ],
      [coffee, tea],
    )
    expect(restored.map((entry) => entry.menuId)).toEqual(["tea", "coffee"])
  })
})
