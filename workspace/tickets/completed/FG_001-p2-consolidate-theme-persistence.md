---
id: FG_001
title: "Theme persistence reads and writes are co-located in one file"
date: 2026-03-15
type: refactor
status: completed
priority: p2
description: "Theme localStorage persistence is split across ui-slice.ts (read) and use-theme-effect.ts (write), violating the project's own Zustand convention to keep persistence co-located. Consolidate read and write into a single location."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -rn 'localStorage.*greyboard-theme' src/renderer/ returns matches in at most one .ts file (excluding index.html)"
  - "bun run typecheck passes with zero errors"
  - "bun run build completes successfully"
  - "Theme preference survives a page reload (manual verification: set dark, reload, still dark)"
  - "The 'system' theme option still reacts to OS color-scheme changes (manual verification)"
owner_agent: "Frontend Store Refactor Agent"
---

# Theme persistence reads and writes are co-located in one file

## Context

During a review of `.claude/rules/zustand.md` against the actual codebase, Rule 6 ("Keep persistence co-located") was found to be violated by the theme feature:

- **Read:** `src/renderer/store/ui-slice.ts:18-20` reads `localStorage.getItem("greyboard-theme")` to initialize the `theme` state.
- **Write:** `src/renderer/hooks/use-theme-effect.ts:21` calls `localStorage.setItem(STORAGE_KEY, theme)` inside a `useEffect`.

This split means the storage key is defined in two places (`"greyboard-theme"` literal in the slice, `STORAGE_KEY` constant in the hook), and the read/write logic can drift independently.

## Goal

All `localStorage` read and write operations for the theme preference happen in a single file, so future changes to the persistence mechanism (e.g., switching to `persist` middleware) only need to touch one location.

## Scope

- Move the `localStorage.setItem` call out of `use-theme-effect.ts` and into the `setTheme` action in `ui-slice.ts`
- Extract the storage key `"greyboard-theme"` into a single constant shared between the init read and the write
- Keep the DOM side-effects (classList toggle, matchMedia listener) in `use-theme-effect.ts` where they belong
- Preserve the inline theme script in `index.html` (it runs before React to prevent FOUC)

## Out of Scope

- Migrating to Zustand `persist` middleware (viable but a larger change — separate ticket)
- Changing the `index.html` inline script (it must read localStorage directly for FOUC prevention)
- Adding theme options beyond light/dark/system

## Approach

Move the `localStorage.setItem` into the `setTheme` action so persistence happens at mutation time, not as a React effect. This is the minimal change that fixes the co-location violation without introducing middleware.

```ts
// ui-slice.ts
const THEME_STORAGE_KEY = "greyboard-theme";

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  theme: (typeof localStorage !== "undefined"
    ? (localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark" | "system")
    : null) || "system",
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
  // ...rest unchanged
});
```

Then remove the `localStorage.setItem` line from `use-theme-effect.ts`.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `src/renderer/store/ui-slice.ts`, add a `THEME_STORAGE_KEY` constant set to `"greyboard-theme"` and replace the inline string on line 19 with it.
2. Update the `setTheme` action in `ui-slice.ts` to call `localStorage.setItem(THEME_STORAGE_KEY, theme)` before `set({ theme })`.
3. In `src/renderer/hooks/use-theme-effect.ts`, remove the `STORAGE_KEY` constant and the `localStorage.setItem(STORAGE_KEY, theme)` line.
4. Run `bun run typecheck` and `bun run build` to verify no regressions.
5. Manually verify theme persistence survives reload and system theme still responds to OS changes.

## Constraints

- Must not change the public API surface of `UiSlice` (same `setTheme` signature)
- Must not remove or modify the inline script in `index.html` (FOUC prevention)
- The storage key string `"greyboard-theme"` must remain identical to what `index.html` uses

## Resources

- Zustand conventions: `.claude/rules/zustand.md` (Rule 6)
- Zustand docs on actions: https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions
