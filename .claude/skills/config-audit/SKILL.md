---
name: config-audit
description: Audit and update Claude Code configuration
disable-model-invocation: true
---

## Audit Procedure

1. Read all config files: CLAUDE.md, .claude/rules/_, .claude/skills/_/SKILL.md, .claude/agents/\*
2. Scan codebase for actual patterns (grep for imports, conventions, file structure)
3. Compare rules against reality:
   - Rules referencing patterns no longer in the codebase → flag for removal
   - Repeated corrections in recent git history (reverted AI-generated code) not captured → flag for addition
   - Overlapping or contradicting rules → flag for merge
   - CLAUDE.md content scoped to specific paths → flag for extraction to rules/
4. Check instruction budget:
   - Is CLAUDE.md over 200 lines?
   - Are there rules without path targeting that should have it?
   - Are there rules that Claude follows correctly without being told?
5. Propose changes as a concrete diff. Don't apply without confirmation.
