import { test, expect, type Page } from "@playwright/test"

const PASSWORD = process.env.E2E_PASSWORD ?? "Pointofsale123!"

async function login(page: Page, email: string) {
  await page.goto("/login")
  await page.fill("#email", email)
  await page.fill("#password", PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/kasir|\/admin|\/owner/, { timeout: 20000 })
}

async function expectDenied(page: Page, path: string, homePath: RegExp) {
  await page.goto(path)
  await expect(page).toHaveURL(homePath, { timeout: 20000 })
  await expect(page).not.toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"))
}

test.describe("RBAC v2 — hak akses per peran", () => {
  test("KASIR hanya bisa mengakses terminal kasir", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id")
    await expect(page).toHaveURL(/\/kasir$/)

    for (const path of ["/admin", "/admin/menus", "/admin/accounts", "/admin/transactions", "/admin/reports", "/owner"]) {
      await expectDenied(page, path, /\/kasir$/)
    }

    await page.goto("/kasir")
    const nav = page.getByRole("navigation", { name: "Navigasi utama" })
    await expect(nav.getByRole("link", { name: "Kasir" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Kelola Menu" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Kelola Akun" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Transaksi" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Laporan" })).toHaveCount(0)
  })

  test("ADMIN tidak bisa membuka kasir atau owner", async ({ page }) => {
    await login(page, "admin@pointofsale.id")
    await expect(page).toHaveURL(/\/admin$/)

    for (const path of ["/kasir", "/owner"]) {
      await expectDenied(page, path, /\/admin$/)
    }

    const nav = page.getByRole("navigation", { name: "Navigasi utama" })
    await expect(nav.getByRole("link", { name: "Kasir" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Kelola Akun" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Kelola Menu" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Transaksi" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Laporan" })).toBeVisible()
  })

  test("OWNER hanya melihat laporan dan riwayat, tanpa ekspor PDF", async ({ page }) => {
    await login(page, "owner@pointofsale.id")
    await expect(page).toHaveURL(/\/owner$/)

    for (const path of ["/kasir", "/admin", "/admin/menus", "/admin/accounts"]) {
      await expectDenied(page, path, /\/owner$/)
    }

    await page.goto("/admin/reports")
    await expect(page.getByRole("heading", { name: /Laporan Penjualan/ })).toBeVisible()
    await expect(page.getByRole("button", { name: "Unduh PDF" })).toHaveCount(0)

    await page.goto("/admin/transactions")
    await expect(page.getByText("Daftar Transaksi").first()).toBeVisible()
  })

  test("ADMIN bisa mengunduh laporan PDF", async ({ page }) => {
    await login(page, "admin@pointofsale.id")
    await page.goto("/admin/reports")

    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("button", { name: "Unduh PDF" }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^laporan-penjualan-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  test("ADMIN bisa menambah dan menonaktifkan akun", async ({ page }) => {
    await login(page, "admin@pointofsale.id")
    await page.goto("/admin/accounts")

    const email = `e2e-${Date.now()}@pointofsale.id`
    await page.fill("#account-name", "Akun Uji E2E")
    await page.fill("#account-email", email)
    await page.fill("#account-password", "Pointofsale123!")
    await page.getByRole("button", { name: "Tambah Akun" }).click()

    const row = page.getByRole("row").filter({ hasText: email })
    await expect(row).toBeVisible({ timeout: 20000 })

    await row.getByRole("button", { name: "Nonaktifkan" }).click()
    const dialog = page.getByRole("alertdialog", { name: /Nonaktifkan/ })
    await dialog.getByRole("button", { name: "Nonaktifkan" }).click()
    await expect(row).toContainText("Nonaktif")
  })
})

test.describe("Login lockout", () => {
  test("menampilkan pesan terkunci setelah 5 kali gagal", async ({ page }) => {
    const email = `lockout-${Date.now()}@pointofsale.id`
    await page.goto("/login")

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.fill("#email", email)
      await page.fill("#password", "password-salah-sengaja")
      await page.click('button[type="submit"]')
    }

    await expect(page.locator('form [role="alert"]')).toContainText("Akun terkunci", { timeout: 15000 })
    await expect(page.locator('form [role="alert"]')).toContainText("Coba lagi dalam")
  })
})

test.describe("Logout & cart", () => {
  test("logout tetap di origin yang sama dan mengosongkan keranjang", async ({ page }) => {
    await login(page, "kasir@pointofsale.id")
    const origin = new URL(page.url()).origin

    await page.getByRole("button", { name: /Tambah Kopi Suroko/ }).first().click()
    await expect(page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })).toBeVisible()

    await page.getByRole("button", { name: "Keluar" }).click()
    const dialog = page.getByRole("alertdialog", { name: /Keluar dari akun/ })
    await dialog.getByRole("button", { name: "Keluar" }).click()
    await expect(page).toHaveURL(/\/login$/, { timeout: 20000 })
    expect(new URL(page.url()).origin).toBe(origin)

    const cart = await page.evaluate(() => window.localStorage.getItem("pos.cart.v1"))
    expect(cart).toBeNull()
  })
})
