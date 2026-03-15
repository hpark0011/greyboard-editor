import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 10_000,
  retries: 0,
  reporter: [["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "electron" }],
});
