import { test, expect } from "@playwright/test"

const HEADLINE = "Setiap pesanan tercatat. Setiap stok terhitung."

test("login tidak menampilkan foto menu sebagai dekorasi", async ({ page }) => {
  await page.goto("/login")

  await expect(page.getByTestId("login-showcase")).toHaveCount(0)
  await expect(page.locator('img[src*="blob.vercel-storage.com"]')).toHaveCount(0)
})

test("panel brand memakai copy faktual tentang pekerjaan toko", async ({ page }) => {
  await page.goto("/login")

  const panel = page.getByTestId("login-brand-panel")
  await expect(panel).toBeVisible()
  await expect(panel.getByText(HEADLINE, { exact: false }).first()).toBeVisible()
  await expect(panel.getByText("Pilih menu, susun keranjang, cetak struk.")).toBeVisible()
  await expect(panel.getByText("Kelola menu, stok, akun pengguna, unduh laporan PDF.")).toBeVisible()
  await expect(panel.getByText("Lihat omzet harian, menu terlaris, dan riwayat transaksi.")).toBeVisible()
})

test("headline login muncul bertahap dan tetap terbaca saat reduced motion", async ({ page }) => {
  await page.goto("/login")

  const word = page.getByTestId("login-brand-panel").locator("[data-text-generate] span").first()
  await expect(word).toHaveCSS("opacity", "1", { timeout: 10000 })

  const reduced = await page.context().newPage()
  await reduced.emulateMedia({ reducedMotion: "reduce" })
  await reduced.goto("/login")
  const reducedWord = reduced.getByTestId("login-brand-panel").locator("[data-text-generate] span").first()
  await expect(reducedWord).toHaveCSS("opacity", "1")
})
