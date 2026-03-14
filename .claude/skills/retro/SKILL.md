---
name: retro
description: Automated session retrospective. Analyzes the current session transcript to calculate rework rate and update the dashboard. Run at end of session.
user_invocable: true
triggers:
  - retro
  - session review
  - rework rate
---

# Session Retrospective — Automated Rework Rate Analysis

You are performing an automated session retrospective. Do NOT ask any questions — analyze silently and output results.

## Step 1: Find the Current Session Transcript

1. List JSONL files in `~/.claude/projects/-Users-disquiet-Desktop-greyboard/` sorted by modification time (most recent first).
2. The most recently modified `.jsonl` file is the current session transcript.
3. Read the entire file. Each line is a JSON record.

```bash
ls -t ~/.claude/projects/-Users-disquiet-Desktop-greyboard/*.jsonl | head -1
```

## Step 2: Parse Records

Each JSONL line is a JSON object. Key record types:

- **`type: "user"`** — user messages. Contains `message.content` (string or array of content blocks).
- **`type: "assistant"`** — assistant messages. Contains `message.content` array with text and `tool_use` blocks.
- **`type: "tool_result"`** — tool results. May contain `is_error: true`. Has `tool_use_id` linking back to the tool call.

Read the file and parse each line as JSON. Build arrays of:

- `userMessages[]` — all user-type records with their content text and index
- `toolCalls[]` — all tool_use blocks from assistant messages, with `name`, `input` (including file paths), and index
- `toolResults[]` — all tool_result records, noting `is_error` and `tool_use_id`
- `editActions[]` — all Edit/Write/MultiEdit tool calls, noting target file path and index

## Step 3: Count Tasks

A **task** is a substantive user request. Count user messages that are:

- Longer than 20 characters
- NOT short confirmations matching: `^(yes|ok|okay|sure|continue|go ahead|do it|y|k|yep|yeah|looks good|lgtm|approved|sounds good|👍)$` (case-insensitive)

This gives `total_user_tasks`.

## Step 4: Detect Rework Events

Scan for these patterns. Each detected pattern = 1 rework event (deduplicate per file/context):

### 4a. Error Loops (High weight)

Find sequences where the same tool produces `is_error: true` results 2+ times consecutively on the same file/target. Each such sequence = 1 rework event.

### 4b. File Edit Churn (High weight)

Count how many times each file path appears as a target of Edit/Write/MultiEdit tool calls. Any file edited **3+ times** in the session = 1 rework event per file.

### 4c. User Correction Requests (High weight)

Scan user messages for correction patterns (case-insensitive):

- `\bfix\b`, `\bwrong\b`, `\bdoesn't work\b`, `\bdoes not work\b`, `\bredo\b`, `\bthat's not\b`, `\btry again\b`, `\brevert\b`, `\bbreak\b`, `\bbroke\b`, `\bbug\b`, `\berror\b`, `\bfail\b`, `\bnot working\b`, `\bincorrect\b`, `\bactually\b.*\binstead\b`, `\bno,?\s+(not|don't|do)\b`

Each matching user message = 1 rework event (but deduplicate if the same message matches multiple patterns).

### 4d. Tool Retries (Medium weight)

Find cases where the same tool is called on the same target/file 2+ times back-to-back (within 3 consecutive tool calls). Each such cluster = 1 rework event.

### 4e. Reverted Changes (Medium weight)

If a file is written/edited and then later the content is overwritten back to a previous state (detected by Write calls where content matches an earlier version), count as 1 rework event.

## Step 5: Calculate Metrics

```
session_rework_rate = rework_events / total_user_tasks
```

If `total_user_tasks` is 0, set rate to 0%.

Also extract from the transcript:

- **Files modified**: unique file paths from Edit/Write/MultiEdit tool calls
- **Session date**: from the first record's timestamp, formatted as YYYY-MM-DD
- **Session ID**: from the JSONL filename (the UUID part)

## Step 6: Generate Session Entry

Format the session entry as:

```markdown
---

### Session: {date} (session ID: {short_id})

| Metric              | Value              |
| ------------------- | ------------------ |
| Tasks completed     | {total_user_tasks} |
| Rework events       | {rework_events}    |
| Session rework rate | {rate}%            |

**Rework details:**

- [list each detected rework event with brief description]

**Files modified:** {comma-separated list}
```

If no rework events, write: `**Rework details:** None detected`

## Step 7: Update Dashboard

1. Read `workspace/orchestration/dashboard.md`
2. Append the session entry at the end of the file (after the `<!-- Sessions are prepended below -->` comment, or at the end if no comment found)
3. Update the **Cumulative Metrics** table at the top:
   - Increment `Total sessions` by 1
   - Add `total_user_tasks` to `Total tasks completed`
   - Add `rework_events` to `Total rework events`
   - Recalculate `Cumulative rework rate` = `Total rework events / Total tasks completed` as percentage
   - Calculate `Last 5 sessions avg` from the most recent 5 session entries
   - Set `Trend` to one of: `↑ improving` (rate decreasing), `↓ declining` (rate increasing), `→ stable` (rate unchanged), or `N/A` (fewer than 2 sessions)

## Step 8: Output Summary

Print a brief summary to the user:

```
Session Retrospective Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tasks: {N} | Rework events: {N} | Rate: {X}%
Trend: {trend}
Dashboard updated: workspace/orchestration/dashboard.md
```

## Important Rules

- **Never ask questions.** This is fully automated.
- **Read the actual JSONL file** — do not guess or estimate from conversation memory.
- **Be conservative** in rework detection — only flag clear patterns, not ambiguous ones.
- **Deduplicate** — the same file causing both "edit churn" and "error loop" still counts as separate rework events (they're different failure modes), but the same error on the same file in the same loop is one event.
