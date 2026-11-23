import { test, expect } from "@playwright/test"

test("latar form login punya aurora Aceternity yang tidak mengganggu input", async ({ page }) => {
  await page.goto("/login")

  const aurora = page.getByTestId("login-aurora")
  await expect(aurora).toHaveAttribute("aria-hidden", "true")
  expect(await aurora.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none")
  expect(await aurora.locator("span").count()).toBe(3)
  expect(await aurora.locator("span").first().evaluate((el) => getComputedStyle(el).animationName)).toContain("aurora")

  await expect(page.locator("#email")).toBeEditable()
})

test("kartu login punya shine border dari pola 21st.dev", async ({ page }) => {
  await page.goto("/login")

  const shine = page.getByTestId("login-shine")
  await expect(shine).toHaveAttribute("aria-hidden", "true")
  expect(await shine.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none")
  expect(await shine.evaluate((el) => getComputedStyle(el, "::after").animationName)).toContain("shine")
})

test("blok form login masuk bertahap", async ({ page }) => {
  await page.goto("/login")

  const delays = await page.locator("[data-login-enter]").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).animationDelay),
  )
  expect(delays).toEqual(["0s", "0.08s", "0.16s", "0.24s"])
})

test("aurora dan shine berhenti saat reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/login")

  const auroraDuration = await page
    .getByTestId("login-aurora")
    .locator("span")
    .first()
    .evaluate((el) => getComputedStyle(el).animationDuration)
  const shineDuration = await page
    .getByTestId("login-shine")
    .evaluate((el) => getComputedStyle(el, "::after").animationDuration)

  expect(Number.parseFloat(auroraDuration)).toBeLessThan(0.05)
  expect(Number.parseFloat(shineDuration)).toBeLessThan(0.05)

  const delays = await page.locator("[data-login-enter]").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).animationDelay),
  )
  expect(delays).toEqual(["0s", "0s", "0s", "0s"])
})
