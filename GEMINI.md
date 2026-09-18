# 🧠 Brains Memory & Task Board Integration Rule

All agent operations in this workspace are linked to the external memory vault located at D:\Brains\brains.

## Mandatory Operational Rules

1. **Anti-Drift & Primary Task Retention**:
   - The **Main Task (Основная задача)** for this project remains active in D:\Brains\brains\Store\Store.md and TaskBoard.md until the user explicitly issues the completion command: *"всё выполнено"*.
   - Never deviate from the primary goal without explicit instruction.

2. **Task Board Synchronization**:
   - Keep D:\Brains\brains\Store\TaskBoard.md synchronized across all 4 categories:
     - **📋 Задача есть**: Active or queued work.
     - **⏳ Задача выполнена, ожидает доработки**: Changes implemented and waiting for user review.
     - **⚠️ Задача выполнена плохо / Критика / Что не получилось**: Detailed logs of user criticism, broken code, regressions, and root cause analysis in Criticism_and_Failures.md.
     - **✅ Выполнено полностью**: Tasks verified and explicitly approved by the user.

3. **Project & Sub-Branch Hierarchy**:
   - Project branch: `D:\Brains\brains\Store\`
   - Sub-branches: `D:\Brains\brains\Store\tasks\` (`frontend.md`, `store-logic.md`, `carousel.md`, `database.md`) linked with Obsidian `[[WikiLinks]]`.
   - When new projects or modules are introduced, create a new branch directory under `D:\Brains\brains\<ProjectName>/` and link in `D:\Brains\brains\Dashboard.md`.
