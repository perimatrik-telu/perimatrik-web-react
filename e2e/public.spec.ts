import { test, expect, migrationWarnings, waitForAppIdle } from "./fixtures";

const PAGES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/article", name: "article" },
  { path: "/news", name: "news" },
  { path: "/gallery", name: "gallery" },
];

for (const p of PAGES) {
  test(`public page renders: ${p.name}`, async ({ page, issues }, testInfo) => {
    await page.goto(p.path);
    await waitForAppIdle(page);

    await expect(page.locator("nav, header").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();

    // No horizontal overflow (layout regressions after Grid v2 / sx migration).
    // Compare against the device viewport: on mobile, overflowing content widens innerWidth itself.
    const deviceWidth = page.viewportSize()!.width;
    const overflow = (await page.evaluate(() => Math.max(document.documentElement.scrollWidth, window.innerWidth))) - deviceWidth;
    expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(1);

    await page.screenshot({ path: testInfo.outputPath(`${p.name}.png`), fullPage: true });
    expect(migrationWarnings(issues), "MUI/React prop warnings").toEqual([]);
  });
}

test("home: stories section shows cards or a readable empty state", async ({ page, issues }) => {
  await page.goto("/");
  await waitForAppIdle(page);
  const section = page.locator("section", { has: page.getByRole("heading", { name: /Cerita Kita|Our Stories/i }) });
  await section.scrollIntoViewIfNeeded();
  const cards = section.locator(".article-card-new");
  const empty = section.getByRole("status");
  await expect(cards.first().or(empty)).toBeVisible();
  if (await empty.isVisible()) {
    // Empty-state text must have real contrast against the background.
    const ok = await empty.locator("h3").evaluate((el) => getComputedStyle(el).color !== getComputedStyle(document.body).backgroundColor);
    expect(ok).toBe(true);
  }
  expect(migrationWarnings(issues)).toEqual([]);
});

for (const kind of ["article", "news"] as const) {
  test(`${kind}: list → detail navigation`, async ({ page, issues }, testInfo) => {
    await page.goto(`/${kind}`);
    await waitForAppIdle(page);
    const firstLink = page.locator(`a[href*="/${kind}/detail/"]`).first();
    if ((await firstLink.count()) === 0) {
      await expect(page.getByRole("status")).toBeVisible();
      testInfo.annotations.push({ type: "note", description: `no ${kind} data; checked empty state only` });
      return;
    }
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`/${kind}/detail/`));
    await waitForAppIdle(page);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`${kind}-detail.png`), fullPage: true });
    expect(migrationWarnings(issues)).toEqual([]);
  });

  test(`${kind}: unknown slug redirects back to the list`, async ({ page }) => {
    // Current app behaviour: API 404 → toast + navigate back to the list page.
    await page.goto(`/${kind}/detail/e2e-slug-that-does-not-exist`);
    await expect(page).toHaveURL(new RegExp(`/${kind}$`), { timeout: 15_000 });
    await expect(page.getByText(/not found|tidak ditemukan/i).first()).toBeVisible();
  });
}
