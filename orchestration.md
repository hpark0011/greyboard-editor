# **Agent Orchestration Loop**

## **Core Roles**

- **Orchestrator** – sets objectives; allocates and monitors resource budgets (tokens, tool calls, compute time); dispatches work to specialists; adapts execution based on remaining budget and task progress; controls the flow and ensures tasks stay within cost and time limits.
- **Planner/Architect** – breaks down objectives into discrete tasks, identifies components, and defines acceptance criteria. It designs what needs to be done but does not execute tasks or manage budgets.
- **Specialist Workers** – implement narrow tasks such as coding, debugging, test generation, refactoring and documentation.
- **Verifier** – runs tests and static analysis to ensure outputs meet acceptance criteria and do not degrade architecture.
- **Ranker/Selector** – compares multiple candidate outputs and selects the best one.
- **Commit** – applies the selected change to the code base.
- **Meta‑Optimizer** – monitors runs and updates prompts and policies to improve performance.

## **Memory and Logging**

- **Plan store** – generated plans and acceptance criteria should be persisted for each session (e.g., plan\_<sessionID>.md). Storing the plan allows the plan verifier and meta‑optimizer to revisit what was intended.
- **Session log store** – capture the full sequence of agent calls, tool invocations, budgets, and outcomes during a session. Save these logs under a consistent naming convention (e.g., session\_<sessionID>.log) to enable debugging and retro analysis.
- **Retro and learning store** – after each session, summarise what worked, what failed, and how prompts or policies were updated. Save these learnings to a central knowledge base (e.g., retro\_<sessionID>.md) for the meta‑optimizer to adjust future runs.

## **Flow**

1. **Orchestrator → Planner → Workers → Verifier → Ranker → Commit** – execute tasks in sequence, with feedback loops back to the planner or workers when verification fails.
2. **Meta‑Optimizer → Orchestrator** – an outer loop uses logs and outcomes to refine how tasks are decomposed, routed, and verified, enabling continuous improvement.

## **Evaluation Metric**

To evaluate the orchestration loop, use a single primary metric:

- **True verification rate** – true verified / (true verified + false verified). A true verified task is one that passed verification and requires no rework.
