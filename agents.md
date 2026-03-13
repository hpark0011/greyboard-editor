# Verification

After implementing any feature, you MUST run a hard verification step before considering the work complete:

## 1. Requirements Check

- Re-read the original requirements or user request in full.
- For each requirement, verify it is satisfied by reading the relevant code, running tests, or executing the feature — do not assume correctness from memory.

## 2. End-to-End Testing (Electron)

- Run the E2E test suite (Playwright with `electron.launch()`) and confirm all tests pass.
- Tests must replicate real user workflows against actual protocols (WebSocket/IPC) — do not rely on mocks that can mask integration bugs.
- Verify user-visible outcomes, not just internal state.
- If cross-platform behavior is relevant, confirm tests pass on macOS, Windows, and Linux.

## 3. Security Verification (Electron)

- Confirm production builds do NOT include dangerous flags: `--no-sandbox`, `--disable-web-security`, `--remote-debugging-port`.
- Confirm `contextIsolation: true` in all `webPreferences`.

## 4. Fix and Report

- If any requirement or check is not met, fix it before reporting completion.
- Report verification results explicitly: list each requirement/check and its pass/fail status.
