import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  transaction: vi.fn(),
  menuCreate: vi.fn(),
  userCreate: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("REDIRECT:/login")
  },
}))

vi.mock("@/auth", () => ({ auth: mocks.auth }))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUnique, create: mocks.userCreate },
    $transaction: mocks.transaction,
    menu: { create: mocks.menuCreate },
  },
}))

import { checkoutPOS } from "./orders"
import { createMenu } from "./menu"
import { createAccount } from "./users"

function sessionAs(role: string) {
  mocks.auth.mockResolvedValue({ user: { id: "u1", role } })
  mocks.findUnique.mockResolvedValue({
    id: "u1",
    role,
    active: true,
    name: "User",
    email: "user@pointofsale.id",
  })
}

describe("server action guards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("checkoutPOS requires transactions:create", () => {
    it.each(["ADMIN", "OWNER"])("rejects %s before touching the database", async (role) => {
      sessionAs(role)

      await expect(
        checkoutPOS({ items: [{ menuId: "m1", quantity: 1 }], paymentMethod: "CASH" }),
      ).rejects.toThrow("REDIRECT:/login")
      expect(mocks.transaction).not.toHaveBeenCalled()
    })
  })

  describe("createMenu requires menu:manage", () => {
    it.each(["KASIR", "OWNER"])("rejects %s before writing", async (role) => {
      sessionAs(role)

      await expect(
        createMenu({ name: "Menu", price: 1000, stock: 1 }),
      ).rejects.toThrow("REDIRECT:/login")
      expect(mocks.menuCreate).not.toHaveBeenCalled()
    })
  })

  describe("createAccount requires users:manage", () => {
    it.each(["KASIR", "OWNER"])("rejects %s before writing", async (role) => {
      sessionAs(role)

      await expect(
        createAccount({ name: "Akun", email: "a@b.co", password: "Pointofsale123!", role: "KASIR" }),
      ).rejects.toThrow("REDIRECT:/login")
      expect(mocks.userCreate).not.toHaveBeenCalled()
    })
  })
})
