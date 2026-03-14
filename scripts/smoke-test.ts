import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");

// Step 1: Build
console.log("Running build...");
try {
  execSync("bun run build", { cwd: root, stdio: "inherit" });
} catch {
  console.error("FAIL: build failed");
  process.exit(1);
}

// Step 2: Assert expected output files exist
const requiredFiles = [
  "main/index.js",
  "preload/index.js",
  "renderer/index.html",
];

let passed = true;
for (const file of requiredFiles) {
  const fullPath = join(dist, file);
  if (existsSync(fullPath)) {
    console.log(`OK: ${file} exists`);
  } else {
    console.error(`FAIL: ${file} missing`);
    passed = false;
  }
}

// Step 3: Check preload for hardcoded source paths (__dirname inlining regression)
const preloadPath = join(dist, "preload/index.js");
if (existsSync(preloadPath)) {
  const preloadContent = readFileSync(preloadPath, "utf-8");
  const srcDirPattern = /\/Users\/.*\/src\/(preload|main)\//;
  if (srcDirPattern.test(preloadContent)) {
    console.error(
      "FAIL: preload/index.js contains hardcoded source path (likely __dirname inlining bug)"
    );
    passed = false;
  } else {
    console.log("OK: preload/index.js has no hardcoded source paths");
  }
}

if (passed) {
  console.log("\nAll smoke tests passed.");
  process.exit(0);
} else {
  console.error("\nSome smoke tests failed.");
  process.exit(1);
}
