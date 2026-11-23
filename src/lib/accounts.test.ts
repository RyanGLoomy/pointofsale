import { describe, expect, it } from "vitest"
import { createAccountSchema, resetPasswordSchema, updateAccountSchema } from "./accounts"

describe("createAccountSchema", () => {
  const valid = {
    name: "Kasir Baru",
    email: "Kasir.Baru@Pointofsale.id",
    password: "Pointofsale123!",
    role: "KASIR",
  }

  it("normalizes email to lowercase and accepts a valid account", () => {
    expect(createAccountSchema.parse(valid).email).toBe("kasir.baru@pointofsale.id")
  })

  it("rejects an invalid email", () => {
    expect(createAccountSchema.safeParse({ ...valid, email: "bukan-email" }).success).toBe(false)
  })

  it("rejects a short password", () => {
    expect(createAccountSchema.safeParse({ ...valid, password: "123" }).success).toBe(false)
  })

  it("rejects an unknown role", () => {
    expect(createAccountSchema.safeParse({ ...valid, role: "SUPERADMIN" }).success).toBe(false)
  })

  it("rejects an empty name", () => {
    expect(createAccountSchema.safeParse({ ...valid, name: "   " }).success).toBe(false)
  })
})

describe("updateAccountSchema", () => {
  it("accepts a role and active flag", () => {
    expect(
      updateAccountSchema.parse({ name: "Admin", email: "admin@pointofsale.id", role: "ADMIN", active: true }),
    ).toEqual({ name: "Admin", email: "admin@pointofsale.id", role: "ADMIN", active: true })
  })

  it("rejects a missing active flag", () => {
    expect(
      updateAccountSchema.safeParse({ name: "Admin", email: "admin@pointofsale.id", role: "ADMIN" }).success,
    ).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  it("accepts a strong password and rejects a weak one", () => {
    expect(resetPasswordSchema.safeParse({ password: "Pointofsale123!" }).success).toBe(true)
    expect(resetPasswordSchema.safeParse({ password: "pendek" }).success).toBe(false)
  })
})
