import { test as base, expect, type Page } from "@playwright/test";

type Issues = { pageErrors: string[]; consoleErrors: string[]; failedApi: string[] };

// Console noise that is unrelated to the app code.
const IGNORED_CONSOLE = [/Download the React DevTools/i, /favicon/i, /sw\.js/i, /mapbox/i, /Failed to load resource.*(googleapis|gstatic)/i];

export const test = base.extend<{ issues: Issues }>({
  issues: async ({ page }, use, testInfo) => {
    const issues: Issues = { pageErrors: [], consoleErrors: [], failedApi: [] };
    page.on("pageerror", (err) => issues.pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (!IGNORED_CONSOLE.some((re) => re.test(text))) issues.consoleErrors.push(text);
    });
    page.on("response", (res) => {
      if (res.url().includes("/api/") && res.status() >= 500) issues.failedApi.push(`${res.status()} ${res.url()}`);
    });

    await use(issues);

    if (issues.consoleErrors.length) {
      await testInfo.attach("console-errors", { body: issues.consoleErrors.join("\n\n"), contentType: "text/plain" });
    }
    // Uncaught exceptions and server errors always fail the test.
    expect(issues.pageErrors, "uncaught page errors").toEqual([]);
    expect(issues.failedApi, "API 5xx responses").toEqual([]);
  },
});

/** MUI/React warnings that indicate a broken MUI 9 migration (unknown DOM props etc). */
export const migrationWarnings = (issues: Issues) =>
  issues.consoleErrors.filter((e) =>
    /React does not recognize|Unknown prop|is not a valid prop|Invalid prop|Failed prop type|MUI:/i.test(e),
  );

export async function waitForAppIdle(page: Page) {
  await page.waitForLoadState("networkidle");
  // Wait for the global loading spinner (if any) to disappear.
  await page.locator(".loading-container, .loader, [role=progressbar]").first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
}

export { expect };
