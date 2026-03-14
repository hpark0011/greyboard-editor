# Greyboard — Electron Whiteboard App

## Architecture Overview

Three-process Electron app with Bun bundler and Vite for the renderer:

- **`src/main/`** — Electron main process (Node/CJS). Window management, IPC handlers, native menus.
- **`src/preload/`** — contextBridge scripts (CJS). Exposes IPC API to renderer.
- **`src/renderer/`** — React + Zustand + Tailwind frontend, served by Vite in dev.
- **`packages/`** — Monorepo workspaces: `core`, `features`, `shared`, `ui`.

## Build Commands

| Command              | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `bun run dev`        | Start all processes (main + renderer + electron)      |
| `bun run dev:safe`   | Kill zombie processes, then `dev`                     |
| `bun run build`      | Production build (main → preload → renderer)          |
| `bun run typecheck`  | `tsc --noEmit`                                        |
| `bun run test:smoke` | Build + verify output artifacts exist and are correct |

## Stack Gotchas

1. **Bun `__dirname` inlining**: Bun's bundler inlines `__dirname` as the _source_ directory path at build time. Never use `__dirname` in preload/main to reference sibling build outputs — use `path.join(app.getAppPath(), 'dist/...')` or `path.resolve` relative to the built file instead.
2. **Build order matters**: Preload must build before main (main references preload path). The `build` script handles this: `build:main && build:preload && build:renderer`.
3. **CJS format required**: Main and preload must use `--format cjs` (Electron loads them as CommonJS). ESM will silently fail.
4. **Tiptap version pinning**: All `@tiptap/*` packages must be on the same minor version. Mismatched versions cause runtime errors with no useful stack trace.
5. **Vite port 5173 hardcoded**: `dev:electron` uses `wait-on http://localhost:5173`. If Vite picks another port (because 5173 is occupied by a zombie), Electron hangs. Use `bun run dev:safe` to clean up first.
6. **tsconfig `moduleResolution: "bundler"`**: Required for Vite + workspace imports. Don't change to `node` or `nodenext`.

## Zustand Conventions

The renderer uses Zustand (v5) with the **slice pattern** (`src/renderer/store/`). Follow these rules when touching store code:

1. **Always use selectors** — never call `useStore()` bare. Use `useShallow` from `zustand/react/shallow` to pick only the fields the component needs. Bare `useStore()` subscribes to the entire store and causes unnecessary re-renders.
   ```ts
   // WRONG
   const { theme, setTheme } = useStore();
   // RIGHT
   const { theme, setTheme } = useStore(useShallow((s) => ({ theme: s.theme, setTheme: s.setTheme })));
   ```
2. **Use plain objects (`Record<string, T>`) for collections, not `Map`** — Zustand's `===` equality check always sees a new reference after `new Map()` copy, defeating selective re-rendering. Maps also don't JSON-serialize (breaks `persist` middleware and devtools).
3. **Mutate state through store actions only** — never call `useStore.setState()` from a component. Add an action to the relevant slice instead. This keeps state mutations traceable and centralized.
4. **Clean up side-effect subscriptions** — if an action registers a listener (e.g., `onFileChange`), store the cleanup function and call it before registering a new one. Otherwise repeated calls leak listeners.
5. **Wrap async IPC calls in try/catch** — all `window.greyboard.*` calls can fail (missing file, permission error, disconnected IPC). Catch errors and surface them via the store's `error` state rather than letting unhandled rejections propagate.
6. **Keep persistence co-located** — if state is read from `localStorage`/`persist`, the write should happen in the same file (or via `persist` middleware), not split across a hook and a slice.

## Efficiency Rules

- **Don't spawn Agent for bugs involving <5 files** — read them directly with Read/Grep. Agent sub-calls have high overhead and are only worth it for broad exploration.
- **Don't re-read files already examined in this session** — when planning and implementing in the same conversation, reuse context from planning reads.
- **Check CLAUDE.md gotchas before trial-and-error** — most build/runtime issues have a known cause listed above.

## Verification

After implementing any feature, you MUST run a hard verification step before considering the work complete:

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
