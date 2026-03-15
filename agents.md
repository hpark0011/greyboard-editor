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

## State Management Conventions

State lives at the lowest scope that satisfies its needs. Three tiers, in order of preference:

1. **`useState` / `useReducer`** — Default choice. UI-only, ephemeral state (form inputs, toggles, hover, animation flags). If state resets on unmount and no sibling needs it, it belongs here.

2. **React Context** — Only for compound component patterns (e.g., Tabs sharing active index with TabPanel children) or theme/locale providers. Never for app state.

3. **Zustand** — Shared state across distant components, state that persists across navigation, or state accessed outside the React tree (Electron IPC handlers, tray logic, background tasks). See [.claude/rules/zustand.md](.claude/rules/zustand.md) for conventions and examples.

## Efficiency Rules

- **Don't spawn Agent for bugs involving <5 files** — read them directly with Read/Grep. Agent sub-calls have high overhead and are only worth it for broad exploration.
- **Don't re-read files already examined in this session** — when planning and implementing in the same conversation, reuse context from planning reads.
- **Check AGENTS.md gotchas before trial-and-error** — most build/runtime issues have a known cause listed above.

## Verification

After implementing any feature, run this checklist before considering work complete:

1. **Requirements Check** — Re-read the original request; verify each requirement by reading code, running tests, or exercising the feature.
2. **Build & Test** — `bun run typecheck`, `bun run build`, and `bun run test:smoke` must all pass. When a `test:e2e` script exists in `package.json`, run the E2E suite too.
3. **Security (Electron)** — See [.claude/rules/electron-security.md](.claude/rules/electron-security.md).
4. **Fix and Report** — Fix any failure before reporting. List each check and its pass/fail status.
