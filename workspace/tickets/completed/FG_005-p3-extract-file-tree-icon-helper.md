---
id: FG_005
title: "Extract shared icon rendering into a helper component"
date: 2026-03-15
type: refactor
status: completed
priority: p3
description: "Chevron + folder/file icon JSX is duplicated identically across the renaming and non-renaming branches of FileTreeItem, totalling ~50 lines of duplication."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "A single helper component renders the chevron + folder/file icon block"
  - "Both the renaming and non-renaming branches use the helper instead of inline JSX"
  - "No visual or behavioral change to the file tree"
owner_agent:
---

# Extract shared icon rendering into a helper component

## Context

In `packages/features/file-explorer/src/file-tree-item.tsx`, the chevron + folder/file icon JSX (lines ~96–120) is duplicated identically in the non-renaming branch (lines ~147–171). This is ~50 lines of pure duplication that makes the component harder to maintain—any icon change must be applied in two places.

Relevant files:

- `packages/features/file-explorer/src/file-tree-item.tsx`

## Goal

Eliminate the duplicated icon rendering JSX by extracting it into a shared helper component.

## Scope

- Extract the chevron + folder/file icon block into a small helper component (e.g. `FileTreeIcon`)
- Replace both inline usages with the helper

## Out of Scope

- Restructuring the overall FileTreeItem render logic (covered by FG_006)
- Extracting rename/create inputs (covered by FG_007)

## Approach

Create a helper component (either co-located in the same file or a sibling module) that accepts the relevant props (`isFolder`, `expanded`, `depth`, etc.) and renders the chevron + icon block. Replace both occurrences in the render body.

## Implementation Steps

1. Identify the exact duplicated JSX block in both branches.
2. Extract it into a `FileTreeIcon` component with the minimal required props.
3. Replace both inline blocks with `<FileTreeIcon ... />`.
4. Verify visually that the file tree renders identically.

## Constraints

- No behavioral or visual changes.
- Keep the helper minimal—don't over-abstract.

## Resources

- Code review finding captured on 2026-03-15
