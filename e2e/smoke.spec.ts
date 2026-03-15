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

    // Click the sidebar toggle — first button in the title bar
    const sidebarToggle = page.locator(".titlebar-drag button").first();
    await sidebarToggle.click();

    // "Archive" text should disappear
    await expect(page.locator("text=Archive")).not.toBeVisible();

    // Click again to show
    await sidebarToggle.click();
    await expect(page.locator("text=Archive")).toBeVisible();
  });

  test("theme toggle cycles theme", async ({ page }) => {
    // Default theme is "system" (or "light" depending on localStorage)
    // Click ThemeToggle — it's the button before "Chat" in the title bar
    const themeButton = page.locator("button").filter({ has: page.locator("svg") }).locator("nth=-2");

    // Get initial dark class state
    const initialHasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    // Click theme toggle multiple times to cycle through light → dark → system
    // Find the theme toggle more reliably — it's the IconButton right before Chat
    const chatButton = page.locator("button", { hasText: "Chat" });
    const themeToggle = chatButton.locator("xpath=preceding-sibling::button[1]");
    await themeToggle.click();

    // After one click, the class list should have potentially changed
    const afterFirstClick = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    // Click again
    await themeToggle.click();

    const afterSecondClick = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    // At least one of the transitions should show a change (light→dark adds "dark", dark→system may change)
    // We verify the toggle is functional by checking at least one state change occurred
    const changed = initialHasDark !== afterFirstClick || afterFirstClick !== afterSecondClick;
    expect(changed).toBe(true);
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
