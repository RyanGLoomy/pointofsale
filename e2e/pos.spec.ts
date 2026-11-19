import { test, expect } from "@playwright/test"

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login")
  await page.fill("#email", email)
  await page.fill("#password", password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/kasir|\/admin|\/owner/, { timeout: 20000 })
}

test.describe("Returning signed-in users", () => {
  const password = process.env.E2E_PASSWORD ?? "Pointofsale123!"

  test("signed-in admin visiting / is redirected to the dashboard", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "admin@pointofsale.id", password)

    await page.goto("/")
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole("heading", { name: /Ringkasan/ })).toBeVisible()
  })

  test("signed-in admin re-opening /login is sent to the dashboard", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "admin@pointofsale.id", password)

    await page.goto("/login")
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole("heading", { name: /Ringkasan/ })).toBeVisible()
  })

  test("signed-out user visiting / is redirected to /login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login/)
  })
})

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

test.describe("Login screen", () => {
  test("shows the branded sign-in experience", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByRole("heading", { name: /Masuk ke POS/ })).toBeVisible()
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible()
    await expect(page.getByText(/Kasir yang rapi/)).toBeVisible()
  })
})

test.describe("Kasir POS flow", () => {
  test("kasir can login and see the POS terminal", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await expect(page).toHaveURL(/\/kasir/)
    await expect(page.getByRole("heading", { name: /^Kasir$/ })).toBeVisible()
    await expect(page.getByText(/Pesanan Saat Ini/)).toBeVisible()
  })

  test("kasir can add item to cart and checkout", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    const itemButton = page.getByRole("button", { name: /Tambah Kopi Suroko/ }).first()
    await expect(itemButton).toBeVisible()
    await itemButton.click()

    const cartLine = page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })
    await expect(cartLine).toContainText("× 1")
    await expect(cartLine).toContainText("Rp 15.000")

    await page.getByRole("button", { name: /Bayar Sekarang/ }).click()

    const receipt = page.getByRole("dialog", { name: /Struk Transaksi/ })
    await expect(receipt).toBeVisible({ timeout: 20000 })
    await expect(receipt).toContainText(/Pembayaran Berhasil/)
  })
})

test.describe("Admin flow", () => {
  test("admin lands on the dashboard with key stats", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "admin@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await expect(page.getByRole("heading", { name: /Ringkasan/ })).toBeVisible()
    await expect(page.getByText("Total Penjualan").first()).toBeVisible()
    await expect(page.getByRole("navigation", { name: /Navigasi utama/ })).toBeVisible()
  })

  test("admin can open menu management", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "admin@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await page.goto("/admin/menus")
    await expect(page.getByRole("heading", { name: /Kelola Data Menu/ })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Tambah Menu" })).toBeVisible()
  })
})

test.describe("Owner flow", () => {
  test("owner can open sales report", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "owner@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await expect(page).toHaveURL(/\/owner/)
    await expect(page.getByRole("heading", { name: /Laporan Penjualan/ })).toBeVisible()
    await expect(page.getByText(/Rata-rata Transaksi/)).toBeVisible()
  })
})
