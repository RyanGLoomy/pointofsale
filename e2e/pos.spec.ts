import { test, expect } from "@playwright/test"

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login")
  await page.fill("#email", email)
  await page.fill("#password", password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/kasir|\/admin|\/owner/, { timeout: 20000 })
}

test.describe("Auth guard", () => {
  test("redirects unauthenticated user from /kasir to /login", async ({ page }) => {
    await page.goto("/kasir")
    await expect(page).toHaveURL(/\/login/)
  })

  test("redirects unauthenticated user from /admin to /login", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Kasir POS flow", () => {
  test("kasir can login and see the POS terminal", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Kasir123!")

    await expect(page).toHaveURL(/\/kasir/)
    await expect(page.getByRole("heading", { name: /Kasir/ })).toBeVisible()
  })

  test("kasir can add item to cart and checkout", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Kasir123!")

    const itemButton = page.getByRole("button", { name: /Kopi Suroko/ }).first()
    await expect(itemButton).toBeVisible()
    await itemButton.click()

    const cartLine = page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })
    await expect(cartLine).toContainText("Kopi Suroko × 1")
    await expect(cartLine).toContainText("Rp 15000.00")

    await page.getByRole("button", { name: /Checkout & Catat Transaksi/ }).click()

    await expect(page.getByText(/Struk Transaksi/)).toBeVisible({ timeout: 20000 })
  })
})

test.describe("Admin flow", () => {
  test("admin can open menu management", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "admin@pointofsale.id", process.env.E2E_PASSWORD ?? "Admin123!")

    await page.goto("/admin/menus")
    await expect(page.getByRole("heading", { name: /Kelola Data Menu/ })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Tambah Menu" })).toBeVisible()
  })
})

test.describe("Owner flow", () => {
  test("owner can open sales report", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "owner@pointofsale.id", process.env.E2E_PASSWORD ?? "Owner123!")

    await page.goto("/owner")
    await expect(page.getByRole("heading", { name: /Owner — Laporan Penjualan/ })).toBeVisible()
  })
})
