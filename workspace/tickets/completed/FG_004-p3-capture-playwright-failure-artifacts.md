---
id: FG_004
title: "Capture Playwright failure artifacts in E2E runs"
date: 2026-03-15
type: test
status: completed
priority: p3
description: "The Playwright setup only emits an HTML report, so CI failures lack traces and other debugging artifacts that are especially useful for Electron regressions."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "Failed E2E runs produce Playwright traces"
  - "CI uploads the artifact directory containing those traces"
  - "A failed smoke test can be debugged from CI artifacts without reproducing locally"
owner_agent: "E2E Review Agent"
---

# Capture Playwright failure artifacts in E2E runs

## Context

The current Playwright config is intentionally minimal: HTML reporting only, no trace, screenshot, or video capture. The GitHub Actions job uploads `playwright-report/` on failure, but not the richer Playwright artifacts that help diagnose Electron-specific failures.

Relevant files:

- `e2e/playwright.config.ts`
- `.github/workflows/e2e.yml`

## Goal

Improve failure-path observability so CI-only Electron issues are easier to debug.

## Scope

- Add Playwright failure artifacts such as traces
- Upload the corresponding artifact directory from CI

## Out of Scope

- Large changes to the smoke suite itself
- Non-E2E observability work

## Approach

Start with `trace: "retain-on-failure"` and upload `test-results/` from CI. Screenshots and video can be added too if artifact size remains acceptable.

## Implementation Steps

1. Update `e2e/playwright.config.ts` to retain traces on failure.
2. Optionally add screenshots or video on failure if helpful.
3. Update `.github/workflows/e2e.yml` to upload the resulting artifact directory.
4. Validate by running the suite and confirming artifact paths.

## Constraints

- Keep artifact size reasonable for routine CI usage.
- Preserve the simple local `bun run test:e2e` workflow.

## Resources

- Review finding captured on 2026-03-15
