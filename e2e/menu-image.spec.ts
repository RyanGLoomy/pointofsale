import { execFileSync } from "node:child_process"
import { test, expect, type Browser, type Page } from "@playwright/test"

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="

// The test owns this menu row so the seeded menu photos are never touched.
const TEST_MENU_NAME = "Menu Uji Foto E2E"

async function login(page: Page, email: string) {
  await page.goto("/login")
  await page.fill("#email", email)
  await page.fill("#password", process.env.E2E_PASSWORD ?? "Pointofsale123!")
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/kasir|\/admin|\/owner/, { timeout: 20000 })
}

test.afterAll(() => {
  // Drop the fixture row so the shared database keeps no test leftovers.
  execFileSync("npx", ["--no-install", "prisma", "db", "execute", "--stdin"], {
    input: `DELETE FROM "Menu" WHERE name = '${TEST_MENU_NAME}';`,
    stdio: ["pipe", "ignore", "inherit"],
  })
})

test("admin mengunggah foto menu dan tampil di terminal kasir", async ({ browser }: { browser: Browser }) => {
  const adminCtx = await browser.newContext()
  const admin = await adminCtx.newPage()
  await login(admin, "admin@pointofsale.id")

  await admin.goto("/admin/menus")
  const photosBefore = await admin.locator("table img").count()

  // Fixture menu created by the test, never a seeded menu.
  await admin.fill("#menu-name", TEST_MENU_NAME)
  await admin.fill("#menu-price", "10000")
  await admin.fill("#menu-stock", "10")
  await admin.getByRole("button", { name: "Tambah Menu" }).click()
  await expect(admin.getByText("Menu ditambahkan").first()).toBeVisible({ timeout: 20000 })

  const row = admin.getByRole("row").filter({ hasText: TEST_MENU_NAME })
  await row.getByRole("button", { name: "Edit" }).click()
  await admin.locator("#menu-image").setInputFiles({
    name: "kopi.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(PNG_BASE64, "base64"),
  })
  await admin.getByRole("button", { name: "Simpan Perubahan" }).click()
  await expect(admin.getByText("Menu diperbarui").first()).toBeVisible({ timeout: 20000 })
  await expect(row.locator("img").first()).toBeVisible()

  const kasirCtx = await browser.newContext()
  const kasir = await kasirCtx.newPage()
  await login(kasir, "kasir@pointofsale.id")
  await expect(kasir.getByRole("heading", { name: /^Kasir$/ })).toBeVisible()
  const tile = kasir.getByRole("button", { name: `Tambah ${TEST_MENU_NAME} ke keranjang` })
  await expect(tile.locator("img")).toBeVisible()
  expect(await tile.locator("img").getAttribute("src")).toContain("public.blob.vercel-storage.com")
  await kasirCtx.close()

  // Cleanup: remove the uploaded image so no blob is left behind.
  await admin.goto("/admin/menus")
  const editRow = admin.getByRole("row").filter({ hasText: TEST_MENU_NAME })
  await editRow.getByRole("button", { name: "Edit" }).click()
  await admin.getByRole("button", { name: "Hapus gambar" }).click()
  await admin.getByRole("button", { name: "Simpan Perubahan" }).click()
  await expect(admin.getByText("Menu diperbarui").first()).toBeVisible({ timeout: 20000 })
  await expect(editRow.locator("img")).toHaveCount(0)

  // Regression guard: the seeded menu photos must survive this test.
  await admin.reload()
  await expect(admin.locator("table img")).toHaveCount(photosBefore)

  await adminCtx.close()
})
