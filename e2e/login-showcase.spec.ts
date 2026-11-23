import { test, expect } from "@playwright/test"

test("halaman login menampilkan foto menu asli di panel brand", async ({ page }) => {
  await page.goto("/login")

  const showcase = page.getByTestId("login-showcase")
  await expect(showcase).toBeVisible()

  const images = showcase.locator("img")
  const count = await images.count()
  expect(count).toBeGreaterThanOrEqual(3)

  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index)
    expect(await image.getAttribute("src")).toContain("public.blob.vercel-storage.com")
    expect(await image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  }
})

test("panel brand tetap tampil di layar ponsel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/login")

  await expect(page.getByTestId("login-showcase")).toBeVisible()
  await expect(page.getByText("Kasir yang rapi. Laporan yang jelas.")).toBeVisible()
})
