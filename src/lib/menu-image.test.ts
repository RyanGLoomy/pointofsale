import { describe, expect, it } from "vitest"
import { MAX_MENU_IMAGE_BYTES, validateMenuImage } from "./menu-image"

const file = (overrides: Partial<{ type: string; size: number; name: string }> = {}) => ({
  type: "image/jpeg",
  size: 1024,
  name: "kopi.jpg",
  ...overrides,
})

describe("validateMenuImage", () => {
  it("accepts jpeg, png and webp within the size limit", () => {
    for (const candidate of [
      file({ type: "image/jpeg", name: "a.jpg" }),
      file({ type: "image/png", name: "a.png" }),
      file({ type: "image/webp", name: "a.webp" }),
    ]) {
      expect(validateMenuImage(candidate).ok).toBe(true)
    }
  })

  it("rejects a missing file", () => {
    expect(validateMenuImage(null).ok).toBe(false)
  })

  it("rejects svg and other unsafe types", () => {
    expect(validateMenuImage(file({ type: "image/svg+xml", name: "a.svg" })).ok).toBe(false)
    expect(validateMenuImage(file({ type: "text/plain", name: "a.txt" })).ok).toBe(false)
  })

  it("rejects files above the size limit", () => {
    expect(validateMenuImage(file({ size: MAX_MENU_IMAGE_BYTES + 1 })).ok).toBe(false)
  })

  it("rejects an empty file", () => {
    expect(validateMenuImage(file({ size: 0 })).ok).toBe(false)
  })

  it("rejects a mismatched extension", () => {
    expect(validateMenuImage(file({ type: "image/png", name: "a.jpg" })).ok).toBe(false)
  })
})
