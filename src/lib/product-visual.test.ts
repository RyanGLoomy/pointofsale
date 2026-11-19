import { describe, expect, it } from "vitest"
import { productGradient, productInitial } from "./product-visual"

describe("productGradient", () => {
  it("returns a deterministic gradient for the same seed", () => {
    expect(productGradient("Kopi Suroko")).toBe(productGradient("Kopi Suroko"))
  })

  it("returns a linear gradient", () => {
    expect(productGradient("Teh Tarik")).toMatch(/^linear-gradient\(135deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 100%\)$/)
  })

  it("handles an empty seed", () => {
    expect(productGradient("")).toMatch(/^linear-gradient\(135deg/)
  })
})

describe("productInitial", () => {
  it("uses the first letter of the name", () => {
    expect(productInitial("Kopi Suroko")).toBe("K")
  })

  it("trims leading whitespace", () => {
    expect(productInitial("  teh tarik")).toBe("T")
  })

  it("falls back to a question mark when the name is empty", () => {
    expect(productInitial("   ")).toBe("?")
  })
})
