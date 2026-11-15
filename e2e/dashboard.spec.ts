import { test, expect, migrationWarnings, waitForAppIdle } from "./fixtures";

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

// Read-only visits: no create/edit form is submitted.
const ROUTES = [
  "/dashboard",
  "/dashboard/profile",
  "/dashboard/article",
  "/dashboard/article/create",
  "/dashboard/news",
  "/dashboard/news/create",
  "/dashboard/gallery",
  "/dashboard/gallery/create",
  "/dashboard/angkatan",
  "/dashboard/member",
  "/dashboard/setting/privacy/access",
  "/dashboard/setting/privacy/contact",
];

test.describe("dashboard", () => {
  test.skip(!EMAIL || !PASSWORD, "set E2E_EMAIL and E2E_PASSWORD to run dashboard tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").first().fill(EMAIL!);
    await page.getByPlaceholder("••••••••").first().fill(PASSWORD!);
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  for (const route of ROUTES) {
    test(`renders ${route}`, async ({ page, issues }, testInfo) => {
      await page.goto(route);
      await waitForAppIdle(page);
      // Never bounced to login: a valid session must survive a full page load.
      await expect(page).not.toHaveURL(/\/login/);
      const finalPath = new URL(page.url()).pathname;
      if (finalPath !== route) {
        // Role-gated route: the app sends users without access back to /dashboard.
        expect(finalPath).toBe("/dashboard");
        testInfo.annotations.push({ type: "role-redirect", description: `${route} -> ${finalPath}` });
      }
      await expect(page.locator("main, [role=main], #root > *").first()).toBeVisible();
      // Compare against the device viewport: on mobile, overflowing content widens innerWidth itself.
      const deviceWidth = page.viewportSize()!.width;
      const overflow = (await page.evaluate(() => Math.max(document.documentElement.scrollWidth, window.innerWidth))) - deviceWidth;
      expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(1);
      await page.screenshot({ path: testInfo.outputPath(`${route.replace(/\//g, "_")}.png`), fullPage: true });
      expect(migrationWarnings(issues)).toEqual([]);
    });
  }
});
