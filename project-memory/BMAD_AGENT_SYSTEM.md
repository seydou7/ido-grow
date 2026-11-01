# I Do Grow — BMAD Agent System Specification

## 1. Overview
BMAD (version 6.0.4) is the **primary operational agent framework** for the I Do Grow project. It provides:
- Standardized, structured agent specifications with executable menus, rules, and personas.
- Multi-agent collaborative discussions via the `/party-mode` slash command.
- Shared project context via `_bmad/_memory/ido-grow-sidecar/ido-grow-project-context.md`.
- Explicit separation between **Project Agents** (development assistance) and **Platform Agents** (future in-product AI assistants for Sprints 10–14).
- A verified, fully resolvable roster of **39 active BMAD agents** (33 stock/custom engineering specialists + 6 canonical I Do Grow domain agents).

---

## 2. Antigravity Slash Command & Execution Architecture

Antigravity IDE discovers slash commands by scanning:
1. **Workspace Skills:** `.agents/skills/<skill-name>/SKILL.md`
2. **Global Customizations:** `~/.gemini/config/skills/` and built-in IDE skills.

### Execution Chain
```
Antigravity Slash Command (/party-mode)
  └── .agents/skills/party-mode/SKILL.md
        └── BMAD Party Mode Workflow (_bmad/core/workflows/party-mode/workflow.md)
              └── BMAD Agent Manifest (_bmad/_config/agent-manifest.csv)
                    ├── 33 Stock & Engineering Specialist Agents
                    └── 6 Custom I Do Grow Domain Agents
```

### Verified Registration Conventions:
- **`/party-mode`** is the confirmed workspace slash entrypoint for multi-agent discussions.
- Individual **`/ido-grow-*`** slash commands are **NOT registered** (and individual slash wrappers are unnecessary); domain specialists participate directly via Party Mode or direct agent loading.
- Other workspace skills registered in `.agents/skills/` are: `code-review`, `qa-validation`, `sprint-close`, `task-specification`, `update-project-memory`.
- Workflows such as `brainstorming` exist as **BMAD WORKFLOW ONLY** (`_bmad/core/workflows/brainstorming/workflow.md`) and are not workspace slash commands.

---

## 3. Canonical I Do Grow Custom Domain Agents

The six I Do Grow domain specialists are authored under `_bmad/custom/agents/` and registered in `_bmad/_config/agent-manifest.csv`:

| Agent Name | Persona | Title & Role | Exact Path | Activation / Participation | Party Mode |
|---|---|---|---|---|---|
| `ido-grow-product-authority` | **Cheikh** 📋 | Product & Business Requirements Authority | `_bmad/custom/agents/ido-grow-product-authority.md` | Load agent file or via Party Mode | **YES** |
| `ido-grow-trading-ops` | **Babacar** 🌾 | Commodity Trading & Operations Specialist | `_bmad/custom/agents/ido-grow-trading-ops.md` | Load agent file or via Party Mode | **YES** |
| `ido-grow-quality-dpp` | **Sokhna** 🔬 | Quality, Traceability & DPP Specialist | `_bmad/custom/agents/ido-grow-quality-dpp.md` | Load agent file or via Party Mode | **YES** |
| `ido-grow-delivery-manager` | **Awa** 🎯 | Delivery Governance & Sprint Orchestrator | `_bmad/custom/agents/ido-grow-delivery-manager.md` | Load agent file or via Party Mode | **YES** |
| `ido-grow-project-memory` | **Ndeye** 📝 | Project State & Documentation Keeper | `_bmad/custom/agents/ido-grow-project-memory.md` | Load agent file or via Party Mode | **YES** |
| `ido-grow-ai-platform` | **Ousmane** 🤖 | AI Platform & Platform Agent Architect | `_bmad/custom/agents/ido-grow-ai-platform.md` | Load agent file or via Party Mode | **YES** |

*Shared Context Resource:* `_bmad/_memory/ido-grow-sidecar/ido-grow-project-context.md` (loaded at activation by all six domain agents).

---

## 4. Stock & Engineering BMAD Specialist Agents Utilized

Standard engineering disciplines and creative workflows are handled by canonical BMAD experts across modules:

- **System Architecture:** `architect` (`_bmad/bmm/agents/architect.md` — Winston)
- **General Full-Stack Dev:** `dev` (`_bmad/bmm/agents/dev.md` — Amelia) & `quick-flow-solo-dev` (`_bmad/bmm/agents/quick-flow-solo-dev.md` — Barry)
- **Frontend / Angular & Spring:** `frontend-angular-expert` (`_bmad/custom/agents/frontend-angular-expert.md` — Sakura) & `backend-spring-expert` (`_bmad/custom/agents/backend-spring-expert.md` — Hiro)
- **UX & Design:** `ux-designer` (`_bmad/bmm/agents/ux-designer.md` — Sally)
- **QA & Test Strategy:** `qa` (`_bmad/bmm/agents/qa.md` — Quinn) & `tea` (`_bmad/tea/agents/tea.md` — Murat)
- **Regression Guardian:** `regression-guardian` (`_bmad/custom/agents/regression-guardian.md` — Sentinel)
- **Application Security:** `application-security-reviewer` (`_bmad/custom/agents/application-security-reviewer.md` — Cipher)
- **Database & Safe Migrations:** `database-migration-expert` (`_bmad/custom/agents/database-migration-expert.md` — Atlas)
- **DevOps & Production Reliability:** `devops-deployment-guardian` (`_bmad/custom/agents/devops-deployment-guardian.md` — Forge)
- **Product Management & Analysis:** `pm` (`_bmad/bmm/agents/pm.md` — John), `sm` (`_bmad/bmm/agents/sm.md` — Bob) & `analyst` (`_bmad/bmm/agents/analyst.md` — Mary)
- **Technical Documentation:** `tech-writer` (`_bmad/bmm/agents/tech-writer/tech-writer.md` — Paige)
- **BMAD Metas & Creative Intelligence:** `bmad-master`, `agent-builder`, `module-builder`, `workflow-builder`, `brainstorming-coach`, `creative-problem-solver`, `design-thinking-coach`, `innovation-strategist`, `presentation-master`, `storyteller`, plus GDS game design specialists.

Total active, resolvable manifest count: **39 agents** (0 broken/missing entries).

---

## 5. Task Routing Guide

| Task Domain | Primary Specialist | Supporting Agents | Collaboration Mode |
|---|---|---|---|
| **Requirements & Client Ambiguities** | `ido-grow-product-authority` | `pm`, `analyst` | Direct activation or `/party-mode` |
| **Commodity Trading & Workflows** | `ido-grow-trading-ops` | `ido-grow-product-authority`, `architect` | Direct activation |
| **Fibre Quality, Lab Tests & DPP** | `ido-grow-quality-dpp` | `ido-grow-product-authority`, `architect` | Direct activation |
| **Sprint Planning & Delivery Gates** | `ido-grow-delivery-manager` | `regression-guardian`, `qa` | Direct activation |
| **Project State & Documentation** | `ido-grow-project-memory` | `tech-writer` | Direct activation |
| **Frontend Implementation (Next.js/React)** | `dev` | `ux-designer`, `ido-grow-product-authority` | Direct activation |
| **Backend Implementation (NestJS/APIs)** | `dev` | `architect`, `database-migration-expert` | Direct activation |
| **Database Schemas & Migrations** | `database-migration-expert` | `architect`, `dev` | Direct activation |
| **Security & Authentication** | `application-security-reviewer` | `architect`, `dev` | Direct activation |
| **Architecture Decisions** | `architect` | `dev`, `ido-grow-product-authority` | `/party-mode` |
| **Future AI Platform (Sprints 10+)** | `ido-grow-ai-platform` | `architect`, `application-security-reviewer` | Direct activation |

---

## 6. Status of Legacy `.codex/agents/` Profiles

All 13 `.codex/agents/*.toml` profiles are preserved on disk with status **LEGACY / TEMPORARY REFERENCE** while the BMAD system is verified in active development:

| Profile | Status | Modern Equivalent |
|---|---|---|
| `cheikh.toml` | **LEGACY / TEMPORARY REFERENCE** | `ido-grow-product-authority` |
| `babacar.toml` | **LEGACY / TEMPORARY REFERENCE** | `ido-grow-trading-ops` |
| `sokhna.toml` | **LEGACY / TEMPORARY REFERENCE** | `ido-grow-quality-dpp` |
| `awa.toml` | **LEGACY / TEMPORARY REFERENCE** | `ido-grow-delivery-manager` |
| `ndeye.toml` | **LEGACY / TEMPORARY REFERENCE** | `ido-grow-project-memory` |
| `ousmane.toml` | **LEGACY / TEMPORARY REFERENCE** | `ido-grow-ai-platform` |
| `fatou.toml` | **LEGACY / TEMPORARY REFERENCE** | `dev` |
| `ibrahima.toml` | **LEGACY / TEMPORARY REFERENCE** | `dev` |
| `khady.toml` | **LEGACY / TEMPORARY REFERENCE** | `database-migration-expert` |
| `malick.toml` | **LEGACY / TEMPORARY REFERENCE** | `qa` / `tea` / `regression-guardian` |
| `mamadou.toml` | **LEGACY / TEMPORARY REFERENCE** | `architect` |
| `mariama.toml` | **LEGACY / TEMPORARY REFERENCE** | `ux-designer` |
| `abdoulaye.toml` | **LEGACY / TEMPORARY REFERENCE** | `application-security-reviewer` / `devops-deployment-guardian` |
