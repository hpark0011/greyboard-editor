---
paths:
  - "src/main/**"
---

# Electron Security Verification

When modifying main process code, ensure these security invariants hold:

- Production builds must NOT include dangerous flags: `--no-sandbox`, `--disable-web-security`, `--remote-debugging-port`.
- `contextIsolation: true` must be set in all `webPreferences`.
- Never expose Node.js APIs directly to the renderer — all communication goes through the preload contextBridge.
