---
id: FG_007
title: "Extract inline rename and create inputs"
date: 2026-03-15
type: refactor
status: completed
priority: p3
description: "FileTreeItem handles 6 concerns in ~260 lines: normal display, inline renaming, inline creation, context menu, recursive children, and folder expand/collapse. The rename and create input UIs should be extracted into focused sub-components."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "Inline rename input is a separate component (e.g. RenameInput)"
  - "Inline create input is a separate component (e.g. CreateInput)"
  - "FileTreeItem delegates to these components instead of inlining the JSX"
  - "No visual or behavioral change to renaming or creating"
owner_agent:
---

# Extract inline rename and create inputs

## Context

`packages/features/file-explorer/src/file-tree-item.tsx` is a ~260-line component handling 6 distinct concerns: normal file/folder display, inline renaming, inline creation, context menu, recursive children rendering, and folder expand/collapse. The inline rename and create input UIs each contain their own JSX, event handlers, and validation logic interleaved with the rest of the component.

Relevant files:

- `packages/features/file-explorer/src/file-tree-item.tsx`

## Goal

Reduce FileTreeItem's responsibility count by extracting the rename and create input UIs into dedicated sub-components.

## Scope

- Extract the inline rename input JSX + handlers into a `RenameInput` component
- Extract the inline create input JSX + handlers into a `CreateInput` component
- Wire the extracted components back into FileTreeItem

## Out of Scope

- Flattening ternaries (covered by FG_006)
- Isolating state (covered by FG_008, which depends on this ticket)

## Approach

Identify the JSX blocks and associated event handlers for rename and create modes. Move each into a co-located component that receives callbacks via props. Keep the components in the same file initially—they can be split into separate modules later if they grow.

## Implementation Steps

1. Identify the rename input JSX, its `onChange`, `onKeyDown`, `onBlur` handlers, and any validation logic.
2. Extract into a `RenameInput` component with props for `value`, `onCommit`, `onCancel`.
3. Repeat for the create input → `CreateInput` component.
4. Replace inline JSX in FileTreeItem with the new components.
5. Verify rename and create workflows function identically.

## Constraints

- No behavioral or visual changes.
- Keep components co-located initially to minimize file churn.

## Resources

- Code review finding captured on 2026-03-15
