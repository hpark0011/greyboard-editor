---
name: verify
description: Post-implementation verification workflow. Runs requirements check, build/test verification, security checks, and reports pass/fail status. Use after completing any feature or fix.
disable-model-invocation: false
---

# Verification Workflow

Run this checklist after implementing any feature or fix. Do not consider work complete until all steps pass.

## 1. Requirements Check

- Re-read the original requirements or user request in full.
- For each requirement, verify it is satisfied by reading the relevant code, running tests, or executing the feature — do not assume correctness from memory.

## 2. Build & Test Verification

Verification is phased — check which phase applies:

**Current phase** (no `test:e2e` script in `package.json`):

- `bun run typecheck` passes
- `bun run build` succeeds
- `bun run test:smoke` passes

**Future phase** (when `test:e2e` script exists in `package.json`):

- All of the above, plus:
- Run the E2E test suite (Playwright with `electron.launch()`) and confirm all tests pass
- Tests must replicate real user workflows against actual protocols (WebSocket/IPC) — do not rely on mocks that can mask integration bugs
- Verify user-visible outcomes, not just internal state
- If cross-platform behavior is relevant, confirm tests pass on macOS, Windows, and Linux

> **How to check:** Look for a `test:e2e` script in `package.json`. If it doesn't exist, use the current phase.

## 3. Security Verification (Electron)

- Confirm production builds do NOT include dangerous flags: `--no-sandbox`, `--disable-web-security`, `--remote-debugging-port`.
- Confirm `contextIsolation: true` in all `webPreferences`.

## 4. Fix and Report

- If any requirement or check is not met, fix it before reporting completion.
- Report verification results explicitly: list each requirement/check and its pass/fail status.
