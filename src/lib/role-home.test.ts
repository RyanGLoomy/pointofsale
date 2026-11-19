import { describe, it, expect } from "vitest"
import { homePathForRole } from "./role-home"

describe("homePathForRole", () => {
  it("sends ADMIN users to /admin", () => {
    expect(homePathForRole("ADMIN")).toBe("/admin")
  })

  it("sends OWNER users to /owner", () => {
    expect(homePathForRole("OWNER")).toBe("/owner")
  })

  it("sends KASIR users to /kasir", () => {
    expect(homePathForRole("KASIR")).toBe("/kasir")
  })

  it("trims and ignores case so seeded roles still route correctly", () => {
    expect(homePathForRole(" admin ")).toBe("/admin")
    expect(homePathForRole("owner")).toBe("/owner")
  })

  it("falls back to /kasir for unknown roles", () => {
    expect(homePathForRole("SUPERVISOR")).toBe("/kasir")
  })

  it("falls back to /kasir when the role is missing", () => {
    expect(homePathForRole(null)).toBe("/kasir")
    expect(homePathForRole(undefined)).toBe("/kasir")
    expect(homePathForRole("")).toBe("/kasir")
  })
})
