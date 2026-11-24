import { test, expect } from "@playwright/test"

test("latar login memakai wash krem hangat dan light rays di belakang form", async ({ page }) => {
  await page.goto("/login")

  const wash = page.getByTestId("login-wash")
  await expect(wash).toHaveAttribute("aria-hidden", "true")
  expect(await wash.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none")
  expect(await wash.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
    "linear-gradient",
  )
  expect(await wash.evaluate((el) => getComputedStyle(el).animationName)).toContain("wash")

  const rays = page.getByTestId("login-rays")
  await expect(rays).toHaveAttribute("aria-hidden", "true")
  expect(await rays.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none")
  expect(await rays.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
    "conic-gradient",
  )
  expect(await rays.evaluate((el) => getComputedStyle(el).animationName)).toContain("rays")

  await expect(page.locator("#email")).toBeEditable()
})

test("wash dan light rays berhenti bergerak saat reduced motion aktif", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/login")

  for (const testId of ["login-wash", "login-rays"]) {
    const duration = await page
      .getByTestId(testId)
      .evaluate((el) => getComputedStyle(el).animationDuration)
    expect(Number.parseFloat(duration)).toBeLessThan(0.05)
  }
})
