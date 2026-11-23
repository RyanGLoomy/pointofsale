import { test, expect, type Page } from "@playwright/test"

const BRAND = "RM Gerobak Hayam Taman Sari"

async function login(page: Page) {
  await page.goto("/login")
  await page.fill("#email", "kasir@pointofsale.id")
  await page.fill("#password", process.env.E2E_PASSWORD ?? "Pointofsale123!")
  await page.click('button[type="submit"]')
  // "/" redirects by role on the server; wait for the shell instead of racing that redirect.
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible({
    timeout: 30000,
  })
}

test("login and sidebar show the shop logo and name", async ({ page }) => {
  await page.goto("/login")
  const logo = page.locator('img[src="/logo.png"]').first()
  await expect(logo).toBeVisible()
  expect(await logo.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await expect(page.getByText(BRAND, { exact: true }).first()).toBeVisible()

  await login(page)
  const nav = page.getByRole("navigation", { name: "Navigasi utama" })
  await expect(nav.getByRole("link", { name: BRAND })).toBeVisible()
  await expect(nav.locator('img[src="/logo.png"]')).toBeVisible()
})
