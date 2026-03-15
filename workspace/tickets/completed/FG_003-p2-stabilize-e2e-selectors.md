---
id: FG_003
title: "Stabilize E2E selectors for title-bar controls"
date: 2026-03-15
type: test
status: completed
priority: p2
description: "The smoke suite relies on CSS structure and sibling-order selectors for title-bar icon buttons, which will break on harmless UI refactors."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "Title-bar controls used by E2E tests expose stable accessible names or explicit test IDs"
  - "Smoke specs no longer use .titlebar-drag positional selectors or XPath sibling lookups for those controls"
  - "A harmless title-bar layout refactor does not require E2E selector rewrites"
owner_agent: "E2E Review Agent"
---

# Stabilize E2E selectors for title-bar controls

## Context

The smoke suite currently reaches title-bar controls through DOM structure rather than stable user-facing semantics:

- The sidebar toggle is selected through `.titlebar-drag button`
- The theme toggle is selected via an XPath sibling of the `Chat` button

Those selectors are brittle because the title-bar icon controls do not currently expose durable accessible names, especially the theme toggle.

Relevant files:

- `e2e/smoke.spec.ts`
- `src/renderer/components/layouts/title-bar.tsx`
- `packages/ui/src/components/theme-toggle.tsx`
- `packages/ui/src/components/icon-button.tsx`

## Goal

Use stable selectors that track the intended controls instead of their current placement in the DOM.

## Scope

- Add accessible names or explicit test hooks for the sidebar and theme controls
- Update the smoke suite to use those selectors

## Out of Scope

- Rewriting the rest of the smoke suite if selectors there are already stable
- Broad accessibility work outside the affected controls

## Approach

Prefer accessible names and role-based Playwright locators first. If a control cannot expose a durable accessible label, add a targeted `data-testid` rather than relying on CSS structure or sibling order.

## Implementation Steps

1. Add stable labels or test IDs to the title-bar controls used in E2E.
2. Replace the fragile locators in `e2e/smoke.spec.ts` with role- or test-id-based locators.
3. Re-run `bun run test:e2e`.

## Constraints

- Avoid introducing selectors that depend on transient tooltip rendering.
- Keep the control semantics clear for both accessibility and testing.

## Resources

- Review finding captured on 2026-03-15

