import { test, expect, type Browser, type Page } from "@playwright/test"

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="

async function login(page: Page, email: string) {
  await page.goto("/login")
  await page.fill("#email", email)
  await page.fill("#password", process.env.E2E_PASSWORD ?? "Pointofsale123!")
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/kasir|\/admin|\/owner/, { timeout: 20000 })
}

async function openKopiEditor(page: Page) {
  await page.goto("/admin/menus")
  const row = page.getByRole("row").filter({ hasText: "Kopi Suroko" })
  await row.getByRole("button", { name: "Edit" }).click()
  return row
}

test("admin mengunggah foto menu dan tampil di terminal kasir", async ({ browser }: { browser: Browser }) => {
  const adminCtx = await browser.newContext()
  const admin = await adminCtx.newPage()
  await login(admin, "admin@pointofsale.id")

  await openKopiEditor(admin)
  await admin.locator("#menu-image").setInputFiles({
    name: "kopi.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(PNG_BASE64, "base64"),
  })
  await admin.getByRole("button", { name: "Simpan Perubahan" }).click()
  await expect(admin.getByText("Menu diperbarui").first()).toBeVisible({ timeout: 20000 })

  const row = admin.getByRole("row").filter({ hasText: "Kopi Suroko" })
  await expect(row.locator("img").first()).toBeVisible()

  const kasirCtx = await browser.newContext()
  const kasir = await kasirCtx.newPage()
  await login(kasir, "kasir@pointofsale.id")
  await expect(kasir.getByRole("heading", { name: /^Kasir$/ })).toBeVisible()
  const tile = kasir.getByRole("button", { name: /Tambah Kopi Suroko/ }).first()
  await expect(tile.locator("img")).toBeVisible()
  expect(await tile.locator("img").getAttribute("src")).toContain("public.blob.vercel-storage.com")

  await kasirCtx.close()

  // Cleanup: remove the uploaded image so the seed menu is unchanged.
  await openKopiEditor(admin)
  await admin.getByRole("button", { name: "Hapus gambar" }).click()
  await admin.getByRole("button", { name: "Simpan Perubahan" }).click()
  await expect(admin.getByText("Menu diperbarui").first()).toBeVisible({ timeout: 20000 })
  await expect(row.locator("img")).toHaveCount(0)
  await adminCtx.close()
})
