import { test, expect } from "./fixtures/electron";

test.describe("Smoke Tests", () => {
  test("app launches and shows empty state", async ({ page }) => {
    await expect(page.locator("text=Greyboard")).toBeVisible();
    await expect(page.locator("text=Open a folder to get started")).toBeVisible();
  });

  test("open workspace via mocked dialog", async ({ electronApp, page, workspaceDir }) => {
    // Mock the native dialog to return our temp workspace
    await electronApp.evaluate(async ({ dialog }, dir) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [dir] });
    }, workspaceDir);

    // Click "Open Folder" button in the empty state
    await page.locator("button", { hasText: "Open Folder" }).first().click();

    // File tree should show seeded files
    await expect(page.locator("text=hello.md")).toBeVisible();
    await expect(page.locator("text=subfolder")).toBeVisible();
  });

  test("open file in editor", async ({ electronApp, page, workspaceDir }) => {
    await electronApp.evaluate(async ({ dialog }, dir) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [dir] });
    }, workspaceDir);

    await page.locator("button", { hasText: "Open Folder" }).first().click();
    await expect(page.locator("text=hello.md")).toBeVisible();

    // Click on hello.md to open it
    await page.locator("text=hello.md").click();

    // Editor should render (Tiptap uses .ProseMirror)
    await expect(page.locator(".ProseMirror")).toBeVisible({ timeout: 5000 });
  });

  test("sidebar toggle hides and shows explorer", async ({ page }) => {
    // The sidebar should be visible by default with "Archive" header
    await expect(page.locator("text=Archive")).toBeVisible();

    // Click the sidebar toggle
    const sidebarToggle = page.getByLabel("Toggle sidebar");
    await sidebarToggle.click();

    // "Archive" text should disappear
    await expect(page.locator("text=Archive")).not.toBeVisible();

    // Click again to show
    await sidebarToggle.click();
    await expect(page.locator("text=Archive")).toBeVisible();
  });

  test("theme toggle cycles theme", async ({ page }) => {
    // Theme cycle: system → light → dark → system
    // With isolated user-data, starts at "system". Click through the full cycle
    // and verify the dark class changes at least once, proving the toggle works.
    const themeToggle = page.getByLabel("Toggle theme");

    const initialHasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    // Click through all three states (system → light → dark → system)
    let darkChanged = false;
    for (let i = 0; i < 3; i++) {
      await themeToggle.click();
      await page.waitForTimeout(100);
      const hasDark = await page.evaluate(() =>
        document.documentElement.classList.contains("dark")
      );
      if (hasDark !== initialHasDark) darkChanged = true;
    }

    expect(darkChanged).toBe(true);
  });

  test("chat panel toggles", async ({ page }) => {
    // "AI Assistant coming soon" should not be visible initially (right sidebar hidden by default)
    // Click "Chat" button to open
    await page.locator("button", { hasText: "Chat" }).click();

    await expect(page.locator("text=AI Assistant coming soon")).toBeVisible();

    // Click "Chat" again to close
    await page.locator("button", { hasText: "Chat" }).click();

    await expect(page.locator("text=AI Assistant coming soon")).not.toBeVisible();
  });
});
