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

    await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible()
    await expect(page.getByText(/Setiap pesanan tercatat/)).toBeVisible()
  })

  test("reveals and hides the password without losing its value", async ({ page }) => {
    await page.goto("/login")

    const password = page.locator("#password")
    await password.fill("Pointofsale123!")

    await page.getByRole("button", { name: "Tampilkan password" }).click()
    await expect(password).toHaveAttribute("type", "text")
    await expect(password).toHaveValue("Pointofsale123!")

    await page.getByRole("button", { name: "Sembunyikan password" }).click()
    await expect(password).toHaveAttribute("type", "password")
    await expect(password).toHaveValue("Pointofsale123!")
  })

  test("validates required fields before submitting", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Masuk" }).click()

    await expect(page.getByText("Email wajib diisi.")).toBeVisible()
    await expect(page.getByText("Password wajib diisi.")).toBeVisible()
    await expect(page.locator("#email")).toBeFocused()
  })
})

test.describe("Kasir POS flow", () => {
  test("kasir can login and see the POS terminal", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await expect(page).toHaveURL(/\/kasir/)
    await expect(page.getByRole("heading", { name: /^Kasir$/ })).toBeVisible()
    await expect(page.getByText(/Pesanan Saat Ini/)).toBeVisible()
  })

  test("kasir can add item to cart and checkout with exact cash", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    const itemButton = page.getByRole("button", { name: /Tambah Kopi Suroko/ }).first()
    await expect(itemButton).toBeVisible()
    await itemButton.click()

    const cartLine = page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })
    await expect(cartLine).toContainText("× 1")
    await expect(cartLine).toContainText("Rp 15.000")

    await page.getByRole("button", { name: "Uang pas" }).click()
    await page.getByRole("button", { name: /Bayar Sekarang/ }).click()

    const receipt = page.getByRole("dialog", { name: /Pembayaran Berhasil/ })
    await expect(receipt).toBeVisible({ timeout: 20000 })
    await expect(receipt).toContainText(/TRX-\d{8}-/)
    await expect(receipt).toContainText("Kembali")
  })

  test("cash overpayment shows the change before payment", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await page.getByRole("button", { name: /Tambah Kopi Suroko/ }).first().click()
    await page.fill("#cash-received", "100000")

    await expect(page.getByText("Rp 85.000")).toBeVisible()
    await expect(page.getByRole("button", { name: /Bayar Sekarang/ })).toBeEnabled()

    await page.getByRole("button", { name: /Bayar Sekarang/ }).click()
    const receipt = page.getByRole("dialog", { name: /Pembayaran Berhasil/ })
    await expect(receipt).toBeVisible({ timeout: 20000 })
    await expect(receipt).toContainText("Rp 85.000")
  })

  test("cart is restored after a reload", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await page.getByRole("button", { name: /Tambah Kopi Suroko/ }).first().click()
    await expect(page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })).toBeVisible()

    await page.reload()
    await expect(page.getByText("Keranjang sebelumnya dipulihkan.")).toBeVisible()
    await expect(page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })).toContainText("× 1")
  })

  test("removing the last unit can be undone", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await page.getByRole("button", { name: /Tambah Kopi Suroko/ }).first().click()
    await page.getByRole("button", { name: "Kurangi jumlah" }).click()

    const toast = page.getByRole("status").filter({ hasText: "Item dihapus" })
    await expect(toast).toBeVisible()
    await toast.getByRole("button", { name: "Urungkan" }).click()

    await expect(page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })).toContainText("× 1")
  })

  test("clearing the cart requires confirmation", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "kasir@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await page.getByRole("button", { name: /Tambah Kopi Suroko/ }).first().click()
    await page.getByRole("button", { name: "Kosongkan keranjang" }).click()

    const dialog = page.getByRole("alertdialog", { name: /Kosongkan keranjang/ })
    await expect(dialog).toBeVisible()
    await dialog.getByRole("button", { name: "Batal" }).click()
    await expect(page.getByRole("listitem").filter({ hasText: "Kopi Suroko" })).toBeVisible()

    await page.getByRole("button", { name: "Kosongkan keranjang" }).click()
    await page.getByRole("alertdialog", { name: /Kosongkan keranjang/ })
      .getByRole("button", { name: "Kosongkan" })
      .click()
    await expect(page.getByText("Keranjang masih kosong")).toBeVisible()
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

  test("admin can open transaction detail and reprint", async ({ page }) => {
    await login(page, process.env.E2E_EMAIL ?? "admin@pointofsale.id", process.env.E2E_PASSWORD ?? "Pointofsale123!")

    await page.goto("/admin/transactions")
    await expect(page.getByRole("heading", { name: /Riwayat Transaksi/ })).toBeVisible()

    const detail = page.getByRole("button", { name: /Lihat detail transaksi/ }).first()
    if ((await detail.count()) > 0) {
      await detail.click()
      const dialog = page.getByRole("dialog", { name: /Detail Transaksi/ })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole("button", { name: /Cetak Ulang/ })).toBeVisible()
      await dialog.getByRole("button", { name: "Selesai" }).click()
      await expect(dialog).toBeHidden()
    }
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
