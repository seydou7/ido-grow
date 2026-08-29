---
name: ido-sprint-close
description: Execute formal sprint closure assessment across orchestration, QA, and memory.
---

Orchestrate formal sprint closure:
1. Invoke the `awa` custom subagent to check sprint scope and deliverables.
2. Awa delegates to `malick` subagent for full regression verification.
3. Awa delegates to `ndeye` subagent to record sprint closure artifacts and memory updates.
Do not simulate agents in the parent context.
