import { test, expect, migrationWarnings, waitForAppIdle } from "./fixtures";

test("login page renders and rejects wrong credentials", async ({ page, issues }, testInfo) => {
  await page.goto("/login");
  await waitForAppIdle(page);

  const email = page.getByPlaceholder("name@example.com").first();
  const password = page.getByPlaceholder("••••••••").first();
  await expect(email).toBeVisible();
  await expect(password).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: true });

  await email.fill("e2e-not-a-user@example.com");
  await password.fill("wrong-password-123");
  await page.locator('button[type="submit"]').first().click();

  // Must stay on /login and must not crash.
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/login/);
  expect(migrationWarnings(issues)).toEqual([]);
});

test("register: member Autocomplete inputs are interactive", async ({ page, issues }, testInfo) => {
  await page.goto("/register");
  await waitForAppIdle(page);

  const memberNo = page.getByPlaceholder("Masukkan nomor anggota");
  const memberName = page.getByPlaceholder("Masukkan nama lengkap anggota");
  await expect(memberNo).toBeVisible();
  await expect(memberName).toBeVisible();

  // Typing proves the input received Autocomplete's htmlInput props (ref + handlers) after the slotProps migration.
  await memberName.click();
  await memberName.pressSequentially("a", { delay: 50 });
  await expect(memberName).toHaveValue("a");
  await expect(memberName).toHaveAttribute("aria-autocomplete", "list");

  await page.screenshot({ path: testInfo.outputPath("register.png"), fullPage: true });
  expect(migrationWarnings(issues)).toEqual([]);
});
