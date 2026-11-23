import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  menuCreate: vi.fn(),
  menuUpdate: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("REDIRECT:/login")
  },
}))

vi.mock("@/auth", () => ({ auth: mocks.auth }))

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUnique },
    menu: { create: mocks.menuCreate, update: mocks.menuUpdate },
  },
}))

import { createMenu, setMenuActive, updateMenu } from "./menu"

describe("menu mutations refresh the menu views", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ user: { id: "u1", role: "ADMIN" } })
    mocks.findUnique.mockResolvedValue({
      id: "u1",
      role: "ADMIN",
      active: true,
      name: "Admin",
      email: "admin@pointofsale.id",
    })
    mocks.menuCreate.mockResolvedValue({ id: "m1" })
    mocks.menuUpdate.mockResolvedValue({ id: "m1" })
  })

  it("revalidates the admin and kasir views after creating a menu", async () => {
    await createMenu({ name: "Menu", price: 1000, stock: 1 })

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/menus")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/kasir")
  })

  it("revalidates the admin and kasir views after updating a menu", async () => {
    await updateMenu("m1", { name: "Menu", price: 1000, stock: 1, active: true })

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/menus")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/kasir")
  })

  it("revalidates the admin and kasir views after toggling menu status", async () => {
    await setMenuActive("m1", false)

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/menus")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/kasir")
  })
})
