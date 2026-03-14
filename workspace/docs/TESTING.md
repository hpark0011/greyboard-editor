# Testing Strategy

This document is the single source of truth for how we test.

## Philosophy

We optimize for **high-confidence, low-maintenance tests**:

1. **Pure logic first** — the highest-ROI tests verify stateless functions and state machines. No DOM, no Electron, no network.
2. **Types as tests** — TypeScript strict mode catches entire classes of bugs at compile time. We lean on it heavily and avoid duplicating what the type checker already guarantees.
3. **Test behavior, not implementation** — assert on outputs and observable side effects, not internal method calls or component trees.
4. **Explicit gaps over false confidence** — we document what we intentionally skip (see [What NOT to Test](#what-not-to-test)) rather than writing brittle tests that pass without catching bugs.

## Test Layers

### Layer 1: Pure Logic Unit Tests

**What:** Stateless functions, state machines, validators, permission rules, utilities.

**Where:** Colocated `__tests__/` directories next to source files, plus `packages/shared/tests/` for cross-module tests.

**Examples:**

- Permission mode cycling and shell guard rules
- Bash command security validation
- Source config and credential validation
- Session validation and path traversal prevention
- Turn lifecycle and phase transitions

**This is our strongest layer.** Most new tests should land here.

### Layer 2: IPC Contract Tests

**What:** Channel parity between main and renderer, preload/main type alignment, message serialization round-trips.

**Where:** `apps/electron/src/shared/__tests__/` and `apps/electron/src/transport/__tests__/`

**Examples:**

- `ipc-channels.test.ts` — auto-generated channel inventory verifying `RPC_CHANNELS` structure
- `channel-map-parity.test.ts` — main ↔ renderer channel symmetry
- `codec.test.ts` — message envelope serialization

These tests catch mismatches between processes at build time instead of at runtime.

### Layer 3: Integration Tests

**What:** Module interactions with mocked Electron APIs, session persistence round-trips, event processing pipelines.

**Where:** `apps/electron/src/main/__tests__/` and `packages/shared/tests/`

**Examples:**

- Session message parity (StoredMessage round-trip with all optional fields)
- Session branching and rollback
- Notification routing with mocked Electron
- Auth state transitions

Use this layer selectively — only when the interaction between modules is the thing under test.

### Layer 4: E2E Smoke Tests

**What:** Critical user journeys exercised against a real Electron window via Playwright.

**Status:** Not yet implemented. See [Adding E2E Tests](#adding-e2e-tests) for the target setup.

**Target scenarios:**

- App launches and renders the main window
- Create a new session
- Send a chat message and receive a streamed response
- Switch between workspaces
- Navigate to settings and back

These are smoke tests, not comprehensive UI tests — they verify that the critical path works end-to-end.

## What NOT to Test

Be explicit about what we skip and why:

- **React component rendering via jsdom** — our components are tightly coupled to Electron and Vite; jsdom fidelity is too low to catch real bugs. Test the logic hooks extract, not the JSX.
- **Simple prop-passing components** — if a component just forwards props to a child, TypeScript already validates the contract.
- **Layout-only components** — CSS and layout are better caught by visual review or E2E screenshots than unit tests.
- **Third-party library behavior** — don't test that `zustand` or `shadcn/ui` work correctly.
- **Electron/Node.js APIs directly** — mock at the boundary, test your logic.

## File Organization

### Directory structure

Tests live in colocated `__tests__/` directories next to the code they test:

```
src/agent/
├── mode-manager.ts
├── __tests__/
│   ├── mode-manager.test.ts
│   └── test-utils.ts           # Shared factories for this module
```

Cross-module integration tests live in `packages/shared/tests/`.

### Naming conventions

| Pattern         | Use                                                                                     |
| --------------- | --------------------------------------------------------------------------------------- |
| `*.test.ts`     | Standard test files                                                                     |
| `*.isolated.ts` | Tests requiring module-level mocking (`mock.module()`) that could affect parallel tests |
| `*.e2e.test.ts` | Tests hitting real external services (auth flows, etc.)                                 |
| `test-utils.ts` | Test helpers and factories, colocated with tests                                        |

### The `.isolated.ts` convention

Use `.isolated.ts` when your test needs `mock.module()` to replace a module's exports. Module mocks are global — running them alongside other tests that import the same module can cause flaky failures. Bun runs `.isolated.ts` files in their own process.

Examples:

- `pre-tool-use-checks.isolated.ts` — mocks permission internals
- `notifications-routing.isolated.ts` — mocks the `electron` module
- `prerequisite-manager.isolated.ts` — mocks `fs.existsSync`

## Writing Tests

### Test helpers and factories

Use the shared factories in `packages/shared/src/agent/__tests__/test-utils.ts`:

```typescript
import {
  createMockWorkspace,
  createMockSession,
  createMockSource,
  TestAgent,
} from "../test-utils";
```

Available factories:

- `createMockWorkspace()` — returns a valid `Workspace` object
- `createMockSession()` — returns a valid `Session` object
- `createMockSource()` — returns a valid `LoadedSource` object
- `createMockBackendConfig()` — returns a valid `BackendConfig`
- `TestAgent` — concrete `BaseAgent` with call tracking (`chatCalls`, `abortCalls`, etc.)
- `collectEvents()` — collects async generator output
- `createCallbackSpy()` — creates a tracked callback

For domain-specific helpers, define them locally in the test file.

### bun:test conventions

```typescript
import { describe, it, expect, beforeEach, mock } from "bun:test";

describe("ModuleName", () => {
  describe("methodOrBehavior", () => {
    it("should do the expected thing", () => {
      // Arrange → Act → Assert
    });
  });
});
```

- Use `beforeEach` to reset state between tests
- Use `mock()` for function-level spies
- Use `mock.module()` only in `.isolated.ts` files
- Prefer direct assertions (`expect(x).toBe(y)`) over snapshot tests

## Running Tests

```bash
# Run all tests across the monorepo
bun test

# Run tests in a specific package
cd packages/shared && bun test

# Run a single test file
bun test packages/shared/tests/mode-manager.test.ts

# Watch mode (package-level)
cd packages/shared && bun test --watch

# Type checking (catches a different class of bugs)
bun run typecheck:all
```

## Adding E2E Tests

When we add E2E smoke tests, we'll use [Playwright Electron](https://playwright.dev/docs/api/class-electron) support.

### Planned setup

```
apps/electron/
├── e2e/
│   ├── fixtures/          # App launch helpers
│   ├── smoke.spec.ts      # Core smoke suite
│   └── playwright.config.ts
```

### Initial smoke suite targets

1. **App launch** — window opens, renderer loads without errors
2. **Session create** — new session appears in sidebar
3. **Chat send** — message sends and streamed response renders
4. **Workspace switch** — switching workspaces updates the session list
5. **Settings navigation** — settings panel opens and closes cleanly

### Guidelines for E2E tests

- Keep the suite small — these are smoke tests, not comprehensive regression tests
- Each test should complete in under 10 seconds
- Use `_electron.launch()` with the built app, not dev mode
- Mock external API calls (Claude API) to avoid flakiness and cost
- Run in CI on every PR, but not on every commit

### Prerequisites before adding E2E

- [ ] Add `@playwright/test` and `playwright` as dev dependencies
- [ ] Create Playwright config targeting the Electron app
- [ ] Add `bun run test:e2e` script
- [ ] Set up CI job for E2E tests
