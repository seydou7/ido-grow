# Agent Instructions

## Mandatory memory protocol

Before any significant task, agents must read:

1. `project-memory/PROJECT_CHARTER.md`
2. `project-memory/SOURCE_OF_TRUTH.md`
3. `project-memory/CURRENT_STATE.md`
4. Relevant entries in `project-memory/DECISION_LOG.md`
5. Relevant current sprint files

Read additional memory by task domain:

- Product: `project-memory/BACKLOG.md`, `project-memory/GLOSSARY.md`, and `project-memory/UX_MAP.md`
- Architecture: `project-memory/ARCHITECTURE.md` and `project-memory/DATA_MODEL.md`
- Testing: `project-memory/TEST_LOG.md` and relevant acceptance criteria

## Authority hierarchy

1. Original client documents
2. Explicit later client clarifications
3. Approved project decisions
4. Internal planning
5. Agent recommendations

No lower authority may silently override, narrow, or expand a higher authority. Agents must label facts, requirements, recommendations, assumptions, and unresolved points accurately.

## Scope rule

Current sprint and delivery status MUST be read from `project-memory/CURRENT_STATE.md`. Agents must never infer the active sprint from static or legacy instructions. Respect the active roadmap scope defined in `project-memory/CURRENT_STATE.md` and `project-memory/BACKLOG.md`.

Project Agents support design, delivery, testing, and project management. Platform Agents are future AI capabilities inside I Do Grow and must only be built in their designated roadmap sprints (Sprint 10+).

## Decision rule

If work introduces or changes a significant architecture choice, business rule, UX convention, security policy, data-model rule, or technology choice currently marked TBD, flag that a formal project decision may be required. Do not silently decide.

Important architectural or product decisions must be recorded in `project-memory/DECISION_LOG.md`. Never overwrite or revise a previous decision; record a new decision that explicitly supersedes the earlier one.

## Builder → Reviewer → QA working agreement

The default lifecycle for implementation work is:

1. Task specification
2. Builder
3. Reviewer
4. QA
5. Human validation
6. Memory update

The Builder must not be the sole final reviewer of their own work.

- Frontend: Builder Fatou; technical reviewer Mamadou; QA Malick.
- Backend: Builder Ibrahima; technical reviewer Mamadou; data review Khady when relevant; QA Malick.
- Database: Builder Khady; reviewers Mamadou and Ibrahima when relevant; QA Malick.
- AI: Builder Ousmane; reviewer Mamadou; product review Cheikh when relevant; QA/evaluation Malick.
- Security: Abdoulaye reviews relevant high-risk work.
