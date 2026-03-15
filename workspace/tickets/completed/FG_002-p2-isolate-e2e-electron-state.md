---
id: FG_002
title: "Isolate Electron user state during E2E runs"
date: 2026-03-15
type: test
status: completed
priority: p2
description: "The Playwright Electron fixture launches with normal persisted browser/app state, so smoke tests can inherit localStorage and future user-data state from prior runs."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "Each E2E app launch uses an isolated temporary profile or user-data directory"
  - "Smoke tests no longer depend on prior localStorage contents"
  - "The theme smoke test asserts a deterministic initial state"
  - "bun run test:e2e passes after the isolation change"
owner_agent: "E2E Review Agent"
---

# Isolate Electron user state during E2E runs

## Context

The current Playwright fixture launches Electron with the built main entry, but it does not isolate persisted app state between runs. The renderer reads theme state from `localStorage` during boot, and the smoke suite already compensates for non-determinism by allowing the initial theme to vary depending on previous runs.

Relevant files:

- `e2e/fixtures/electron.ts`
- `src/renderer/index.html`
- `src/renderer/store/ui-slice.ts`
- `e2e/smoke.spec.ts`

## Goal

Make every E2E run hermetic so smoke tests start from a known app state regardless of what a developer or earlier CI run did before launch.

## Scope

- Update the Electron E2E fixture to use an isolated temporary profile
- Remove smoke-test assumptions that prior localStorage state may exist
- Keep the current temp workspace seeding behavior

## Out of Scope

- Broad refactors of app persistence
- Adding new smoke scenarios unrelated to launch-state isolation

## Approach

Prefer solving this in the fixture rather than clearing state after launch. A temporary profile avoids cross-run contamination from localStorage now and from any future state written under Electron user-data directories later.

## Implementation Steps

1. Update `e2e/fixtures/electron.ts` to create and clean up a temporary profile directory in addition to the temporary workspace directory.
2. Pass that profile override into Electron when launching the app.
3. Tighten the theme smoke test so it asserts a deterministic starting state.
4. Run `bun run test:e2e` to confirm the suite remains green.

## Constraints

- The isolation mechanism needs to work with Playwright Electron on CI and local development.
- The fixture should continue cleaning up all temporary directories after each test.

## Resources

- Review finding captured on 2026-03-15

