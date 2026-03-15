import fs from "fs";
import path from "path";
import { _electron } from "playwright";
import { test, expect } from "./fixtures/electron";
import type { AppConfig } from "@greyboard/core/config";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const electronBin = require("electron") as unknown as string;

async function launchElectronApp(userDataDir: string) {
  const appEntry = path.resolve(__dirname, "../dist/main/index.js");
  const ciArgs = process.env.CI ? ["--no-sandbox", "--disable-gpu-sandbox"] : [];

  return _electron.launch({
    executablePath: electronBin,
    args: [appEntry, `--user-data-dir=${userDataDir}`, ...ciArgs],
    env: { ...process.env, ELECTRON_IS_E2E: "1" },
  });
}

async function mockFolderDialog(
  electronApp: Awaited<ReturnType<typeof launchElectronApp>>,
  workspaceDir: string
) {
  await electronApp.evaluate(async ({ dialog }, dir) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [dir] });
  }, workspaceDir);
}

function writeUserConfig(userDataDir: string, config: Partial<AppConfig>) {
  fs.writeFileSync(
    path.join(userDataDir, "config.json"),
    JSON.stringify(config, null, 2),
    "utf-8"
  );
}

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

  test("restores previous session after relaunch", async ({ userDataDir, workspaceDir }) => {
    const firstApp = await launchElectronApp(userDataDir);
    const firstPage = await firstApp.firstWindow();
    await firstPage.waitForLoadState("domcontentloaded");

    await mockFolderDialog(firstApp, workspaceDir);
    await firstPage.locator("button", { hasText: "Open Folder" }).first().click();
    await firstPage.locator("text=hello.md").click();
    await firstPage.locator("text=subfolder").click();
    await firstPage.locator("text=nested.md").click();
    await firstPage.locator("button", { hasText: "Chat" }).click();

    await expect(firstPage.locator(".ProseMirror")).toContainText("Nested");
    await expect(firstPage.locator("text=AI Assistant coming soon")).toBeVisible();

    await firstApp.close();

    const secondApp = await launchElectronApp(userDataDir);
    try {
      const secondPage = await secondApp.firstWindow();
      await secondPage.waitForLoadState("domcontentloaded");

      await expect(secondPage.getByRole("button", { name: "subfolder" })).toBeVisible();
      await expect(secondPage.getByRole("button", { name: "nested.md" })).toBeVisible();
      await expect(secondPage.locator(".ProseMirror")).toContainText("Nested");
      await expect(secondPage.locator("text=AI Assistant coming soon")).toBeVisible();
    } finally {
      await secondApp.close();
    }
  });

  test("restores selected explorer item without reopening a file", async ({ userDataDir, workspaceDir }) => {
    writeUserConfig(userDataDir, {
      lastOpenedFolder: workspaceDir,
      openFilePaths: [],
      selectedFilePath: path.join(workspaceDir, "hello.md"),
      activeFilePath: null,
      expandedFolderPaths: [],
    });

    const electronApp = await launchElectronApp(userDataDir);
    try {
      const page = await electronApp.firstWindow();
      await page.waitForLoadState("domcontentloaded");

      const selectedFileButton = page.getByRole("button", { name: "hello.md" });
      await expect(selectedFileButton).toBeVisible();
      await expect(selectedFileButton).toHaveClass(/bg-accent/);
      await expect(page.locator(".ProseMirror")).not.toBeVisible();
      await expect(page.locator("text=Select a file to start editing")).toBeVisible();
    } finally {
      await electronApp.close();
    }
  });

  test("skips missing files during session restore", async ({ userDataDir, workspaceDir }) => {
    const firstApp = await launchElectronApp(userDataDir);
    const firstPage = await firstApp.firstWindow();
    await firstPage.waitForLoadState("domcontentloaded");

    await mockFolderDialog(firstApp, workspaceDir);
    await firstPage.locator("button", { hasText: "Open Folder" }).first().click();
    await firstPage.locator("text=hello.md").click();
    await expect(firstPage.locator(".ProseMirror")).toContainText("Hello World");

    await firstApp.close();
    fs.rmSync(path.join(workspaceDir, "hello.md"));

    const secondApp = await launchElectronApp(userDataDir);
    try {
      const secondPage = await secondApp.firstWindow();
      await secondPage.waitForLoadState("domcontentloaded");

      await expect(secondPage.locator("text=Greyboard")).toBeVisible();
      await expect(secondPage.locator("text=Select a file to start editing")).toBeVisible();
      await expect(secondPage.locator("text=hello.md")).not.toBeVisible();
      await expect(secondPage.locator("text=subfolder")).toBeVisible();
    } finally {
      await secondApp.close();
    }
  });

  test("persists dark theme across relaunch", async ({ userDataDir }) => {
    const firstApp = await launchElectronApp(userDataDir);
    const firstPage = await firstApp.firstWindow();
    await firstPage.waitForLoadState("domcontentloaded");

    const themeToggle = firstPage.getByLabel("Toggle theme");
    await themeToggle.click();
    await themeToggle.click();

    await expect.poll(async () =>
      firstPage.evaluate(() => document.documentElement.classList.contains("dark"))
    ).toBe(true);
    await firstPage.waitForTimeout(250);

    await firstApp.close();

    const secondApp = await launchElectronApp(userDataDir);
    try {
      const secondPage = await secondApp.firstWindow();
      await secondPage.waitForLoadState("domcontentloaded");

      await expect.poll(async () =>
        secondPage.evaluate(() => document.documentElement.classList.contains("dark"))
      ).toBe(true);
    } finally {
      await secondApp.close();
    }
  });

  test("applies configured dark theme on startup", async ({ userDataDir }) => {
    writeUserConfig(userDataDir, { theme: "dark" });

    const electronApp = await launchElectronApp(userDataDir);
    try {
      const page = await electronApp.firstWindow();
      await page.waitForLoadState("domcontentloaded");

      await expect.poll(async () =>
        page.evaluate(() => document.documentElement.classList.contains("dark"))
      ).toBe(true);
    } finally {
      await electronApp.close();
    }
  });
});
