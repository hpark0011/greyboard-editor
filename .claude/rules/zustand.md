---
paths:
  - "src/renderer/**"
---

# Zustand Conventions

The renderer uses Zustand (v5) with the **slice pattern** (`src/renderer/store/`). Follow these rules when touching store code:

1. **Always use selectors** — never call `useStore()` bare. Bare `useStore()` subscribes to the entire store and causes unnecessary re-renders.

   a. **Use `useShallow` when a selector returns a new object or array** — `useShallow` from `zustand/react/shallow` prevents re-renders when the selected fields haven't changed.
   ```ts
   // WRONG — bare call, subscribes to everything
   const { theme, setTheme } = useStore();

   // RIGHT — useShallow for multi-field object selectors
   const { theme, setTheme } = useStore(
     useShallow((s) => ({ theme: s.theme, setTheme: s.setTheme })),
   );

   // Also fine — array-pick style
   const [nuts, honey] = useStore(useShallow((s) => [s.nuts, s.honey]));
   ```

   b. **Skip `useShallow` for single primitive or stable-reference selectors** — a plain selector returning a primitive (`string`, `number`, `boolean`) already uses `===` and won't cause extra re-renders. Actions are stable function references and also don't need `useShallow`.
   ```ts
   // No useShallow needed — primitive value
   const count = useStore((s) => s.count);

   // No useShallow needed — action is a stable reference
   const toggleSidebar = useStore((s) => s.toggleLeftSidebar);
   ```

2. **Use plain objects (`Record<string, T>`) for collections, not `Map`** — Zustand's `===` equality check always sees a new reference after `new Map()` copy, defeating selective re-rendering. Maps also don't JSON-serialize (breaks `persist` middleware and devtools).

3. **Mutate state through store actions only** — never call `useStore.setState()` from a component. Add an action to the relevant slice instead. This keeps state mutations traceable and centralized.

4. **Clean up side-effect subscriptions** — if an action registers a listener (e.g., `onFileChange`), store the cleanup function and call it before registering a new one. Otherwise repeated calls leak listeners.

5. **Wrap async IPC calls in try/catch** — all `window.greyboard.*` calls can fail (missing file, permission error, disconnected IPC). Catch errors and surface them via the store's `error` state rather than letting unhandled rejections propagate.

6. **Keep persistence co-located** — if state is read from `localStorage`/`persist`, the write should happen in the same file (or via `persist` middleware), not split across a hook and a slice.

7. **Apply middleware at the combined store level, not per-slice** — `persist`, `devtools`, and other middleware should wrap the final combined `create()` call, not individual slice creators. Applying middleware inside slices causes unexpected behavior (e.g., each slice persisting independently with conflicting keys).

8. **Multiple focused stores, split by domain** — create separate stores per domain (`useAgentStore`, `useWorkspaceStore`, `useUIStore`). No god stores that mix unrelated concerns.

9. **Derive, don't duplicate** — compute derived values in selectors or `useMemo`. Never store a derived copy alongside its source data; it will inevitably drift.

10. **Immer middleware is opt-in** — allowed for complex nested updates but not required for flat state. When not using Immer, use immutable spread patterns.

11. **Use immutable update patterns for nested state** — `set()` only does a shallow merge at the top level. Nested objects must be spread manually or use `immer` middleware. Never mutate nested state in place.
   ```ts
   // WRONG — mutates in place
   set((state) => { state.person.firstName = 'New'; });

   // RIGHT — immutable spread
   set((state) => ({
     person: { ...state.person, firstName: 'New' },
   }));
   ```
