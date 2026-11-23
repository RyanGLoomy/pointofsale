import { test, expect } from "@playwright/test"

test("halaman login memakai spotlight dekoratif yang hormati reduced motion", async ({ page }) => {
  await page.goto("/login")

  const desktop = page.getByTestId("login-spotlight-desktop")
  await expect(desktop).toHaveAttribute("aria-hidden", "true")
  expect(await desktop.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none")
  expect(await desktop.evaluate((el) => getComputedStyle(el).animationName)).not.toBe("none")

  const durations = await desktop.evaluate((el) =>
    el.getAnimations().map((animation) => (animation.effect as KeyframeEffect).getTiming().duration),
  )
  expect(durations).toContain(1800)

  await page.setViewportSize({ width: 390, height: 844 })
  const mobile = page.getByTestId("login-spotlight-mobile")
  await expect(mobile).toHaveAttribute("aria-hidden", "true")
  expect(await mobile.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none")
  expect(await mobile.evaluate((el) => getComputedStyle(el).animationName)).not.toBe("none")
})

test("spotlight login berhenti bergerak saat reduced motion aktif", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/login")

  const duration = await page
    .getByTestId("login-spotlight-desktop")
    .evaluate((el) => getComputedStyle(el).animationDuration)

  expect(Number.parseFloat(duration)).toBeLessThan(0.05)
})
