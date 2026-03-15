import { test as base, type ElectronApplication, type Page } from "@playwright/test";
import { _electron } from "playwright";
import path from "path";
import fs from "fs";
import os from "os";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const electronBin = require("electron") as unknown as string;

type ElectronFixtures = {
  electronApp: ElectronApplication;
  page: Page;
  workspaceDir: string;
  userDataDir: string;
};

export const test = base.extend<ElectronFixtures>({
  workspaceDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "greyboard-e2e-"));
    // Seed test files
    fs.writeFileSync(path.join(dir, "hello.md"), "# Hello World\n\nTest content.");
    const subfolder = path.join(dir, "subfolder");
    fs.mkdirSync(subfolder);
    fs.writeFileSync(path.join(subfolder, "nested.md"), "# Nested\n\nNested content.");

    await use(dir);

    fs.rmSync(dir, { recursive: true, force: true });
  },

  userDataDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "greyboard-e2e-userdata-"));
    await use(dir);
    fs.rmSync(dir, { recursive: true, force: true });
  },

  electronApp: async ({ userDataDir }, use) => {
    const appEntry = path.resolve(__dirname, "../../dist/main/index.js");
    // --no-sandbox is required on CI runners (Linux root/restricted namespaces)
    const ciArgs = process.env.CI ? ["--no-sandbox", "--disable-gpu-sandbox"] : [];
    const electronApp = await _electron.launch({
      executablePath: electronBin,
      args: [appEntry, `--user-data-dir=${userDataDir}`, ...ciArgs],
      env: { ...process.env, ELECTRON_IS_E2E: "1" },
    });
    await use(electronApp);
    await electronApp.close();
  },

  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    await page.waitForLoadState("domcontentloaded");
    await use(page);
  },
});

export { expect } from "@playwright/test";
