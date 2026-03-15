---
id: FG_006
title: "Flatten nested ternaries in FileTreeItem render"
date: 2026-03-15
type: refactor
status: completed
priority: p3
description: "3+ levels of ternary nesting (isRenaming → isFolder → node.expanded) creates a pyramid that is hard to trace and reason about."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "No ternary nesting deeper than one level in FileTreeItem's render body"
  - "Render logic uses early returns or guard clauses instead of nested ternaries"
  - "No visual or behavioral change to the file tree"
owner_agent:
---

# Flatten nested ternaries in FileTreeItem render

## Context

In `packages/features/file-explorer/src/file-tree-item.tsx`, the render body uses 3+ levels of nested ternaries (`isRenaming` → `isFolder` → `node.expanded`) creating a pyramid structure that is difficult to read and maintain. Each branch contains substantial JSX, making the nesting especially hard to follow.

Relevant files:

- `packages/features/file-explorer/src/file-tree-item.tsx`

## Goal

Replace deeply nested ternaries with a flatter, more readable control flow pattern.

## Scope

- Flatten the nested ternary expressions in the render body
- Use early returns, guard clauses, or extracted sub-renders

## Out of Scope

- Extracting sub-components (covered by FG_005, FG_007)
- State management changes (covered by FG_008)

## Approach

Replace the nested ternaries with one of:
- Early returns for mutually exclusive branches (e.g. `if (isRenaming) return <RenameView />`)
- Extracted render functions for each branch
- Simple if/else blocks before the return statement

## Implementation Steps

1. Map the current ternary tree to identify all branches.
2. Refactor to early returns or extracted render helpers.
3. Verify no ternary nests deeper than one level.
4. Confirm no visual or behavioral regressions.

## Constraints

- No behavioral or visual changes.
- Prefer early returns over extracted functions where possible for simplicity.

## Resources

- Code review finding captured on 2026-03-15
