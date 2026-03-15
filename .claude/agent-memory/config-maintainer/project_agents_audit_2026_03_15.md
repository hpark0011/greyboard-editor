---
name: AGENTS.md dedup audit 2026-03-15
description: Tracked what was deduplicated from AGENTS.md into .claude/rules/ references
type: project
---

Replaced duplicated sections in AGENTS.md with references to .claude/rules/ files:

1. **Zustand rules subsection** (was 6 bullet points + "See..." line under State Management Conventions) -> collapsed into one-line reference appended to the Zustand tier description. Three rules that were only in AGENTS.md were migrated into `.claude/rules/zustand.md` first:
   - "Multiple focused stores" (added as rule 8)
   - "Derive, don't duplicate" (added as rule 9)
   - "Immer middleware is opt-in" (added as rule 10; the old rule 8 about immutable updates became rule 11)
2. **Security (Electron) verification item** -> reference to `.claude/rules/electron-security.md`.

**Why:** AGENTS.md is shared across multiple agents (Codex, etc.) and should stay lean. Detailed conventions belong in scoped rules files that are auto-loaded by path.

**How to apply:** When adding new conventions, prefer a scoped `.claude/rules/` file over expanding AGENTS.md. AGENTS.md should only contain cross-cutting concerns (architecture, build commands, gotchas, verification checklist).

### Rules that are working well (don't touch)
- Architecture Overview, Build Commands, Stack Gotchas, Efficiency Rules sections -- these are unique to AGENTS.md and not duplicated elsewhere.
- State Management Conventions three-tier hierarchy -- good overview that doesn't duplicate the rules files.
- The `.claude/rules/tailwind-classname.md` rule is not mentioned in AGENTS.md and doesn't need to be (it's path-scoped and auto-loaded).

### Emerging patterns to watch
- If more verification checklist items get their own rules files, consider whether the Verification section itself should become a rules file.
