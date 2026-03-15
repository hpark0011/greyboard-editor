---
id: FG_008
title: "Isolate rename and create state into subcomponents"
date: 2026-03-15
type: refactor
status: completed
priority: p3
description: "isRenaming, renameValue, isCreating, and newName are all managed at the FileTreeItem top level even though renaming and creating are mutually exclusive modes. State should be co-located with the extracted sub-components."
dependencies:
  - FG_007
parent_plan_id:
acceptance_criteria:
  - "Rename state (isRenaming, renameValue) is owned by the RenameInput component"
  - "Create state (isCreating, newName) is owned by the CreateInput component"
  - "FileTreeItem no longer manages rename/create local state directly"
  - "No visual or behavioral change"
owner_agent:
---

# Isolate rename and create state into subcomponents

## Context

In `packages/features/file-explorer/src/file-tree-item.tsx`, `isRenaming`, `renameValue`, `isCreating`, and `newName` are all declared as top-level state in `FileTreeItem`. However, renaming and creating are mutually exclusive modes—only one is ever active at a time. This unnecessarily widens the component's state surface and makes it harder to reason about which state belongs to which UI path.

This ticket depends on FG_007 (extract inline input components). Once rename and create inputs are separate components, their state can be moved into those components.

Relevant files:

- `packages/features/file-explorer/src/file-tree-item.tsx`

## Goal

Co-locate rename and create state with the sub-components that use it, reducing FileTreeItem's state footprint.

## Scope

- Move `isRenaming` and `renameValue` state into the `RenameInput` component
- Move `isCreating` and `newName` state into the `CreateInput` component
- FileTreeItem triggers mode entry via a simpler mechanism (e.g. a `mode` state or callback)

## Out of Scope

- The initial extraction of components (covered by FG_007)
- Icon rendering or ternary flattening (covered by FG_005, FG_006)

## Approach

After FG_007 extracts `RenameInput` and `CreateInput`, move the associated `useState` calls from FileTreeItem into those components. FileTreeItem only needs to know whether to render the normal view, the rename view, or the create view—not the internal state of each mode.

## Implementation Steps

1. Move `isRenaming` / `renameValue` useState into `RenameInput`.
2. Move `isCreating` / `newName` useState into `CreateInput`.
3. Replace FileTreeItem's mode tracking with a single `mode` state or conditional render.
4. Verify rename and create workflows are functionally identical.

## Constraints

- Depends on FG_007 being completed first.
- No behavioral or visual changes.

## Resources

- Code review finding captured on 2026-03-15
