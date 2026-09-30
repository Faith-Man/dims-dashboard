# CLAUDE.md — standing rules for every Claude session in dims-dashboard

This file is read automatically at the start of every Claude Code session in this
repository. It holds owner-approved working rules. The repository is the authority;
chat is discovery (see DIMS-STD-0005).

## Where work is tracked

- Projects and tasks live in Supabase project **DIMS-v3** (`sdquzhsylqpbhrmqjqgk`),
  tables `public.projects` (PROJ-####) and `public.tasks` (TASK-####).
- A task links to its project through `tasks.project_id`. `project_id` may be null
  for a standalone task.

## Project or task: check the owner's framing every time

When the owner asks for something to be tracked, decide the level and **say so
plainly if they named the wrong one** ("This fits better as a task under PROJ-0041,
not a new project").

- **Task**: one action, finished in one sitting or a few steps, with a clear done
  state. Example: "Install Claude Code on the Mac mini."
- **Project**: an outcome that needs two or more tasks, or a standing area that
  keeps collecting work. Example: "Personal & Family Records."
- **Standalone task** (no project): fine for a one-off that serves no larger outcome.
- **Promote**: when a task grows past about three steps, or other tasks start
  depending on it, make it a project and put the original task inside it.
- **A step toward an existing task** goes in that task's `next_action` or notes,
  not in a new task.

## Before creating any project or task

1. Search for an existing item first (by title keywords and by project). Update it
   instead of creating a duplicate.
2. Never type `task_number` or `project_number` by hand. Leave them empty; the
   triggers `assign_task_number()` / `assign_project_number()` fill them from
   `task_number_seq` / `project_number_seq`. Hand-typed numbers leave the sequence
   behind and break the next insert (happened 2026-09-30; see TASK-0161 notes).
3. Use a status the dashboard already uses (`open`, `in_progress`, `deferred`,
   `blocked`, `complete` ...). For "future idea / not now", use `deferred`,
   usually under PROJ-0023 (Deferred Governance & Architecture Tracking).
4. Do not mark anything complete because a chat ended (DIMS-STD-0005 pause/resume).

## Decided, not to be reopened without the owner

- Projects and tasks stay as two sections and two tables. Merging them into one
  work-items table is a deferred future idea (TASK-0161); do not start it without
  owner approval.

## Other AI tools

ChatGPT (and any other assistant) does not read this file. Its Library holds
reference copies only and is never authoritative over this repository
(DIMS-STD-0005). When a rule here changes, the owner updates ChatGPT's project
instructions separately.
