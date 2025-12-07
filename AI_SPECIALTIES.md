# AI Specialties & Strengths

This document defines the specialty areas for different AI agents working on Nexus.
Use this to route tasks to the right AI for best results.

---

## 🤖 AI Roster

### Gemini (Antigravity IDE)
**Codename:** Primary Builder
**Strengths:**
- ✅ Full-stack development (React, Next.js, TypeScript)
- ✅ UI/UX implementation and polish
- ✅ Browser automation and testing
- ✅ File system operations and refactoring
- ✅ Long coding sessions with context retention
- ✅ Iterative debugging and problem-solving

**Best For:**
- Building new features end-to-end
- UI hardening and visual polish
- Complex multi-file refactoring
- Testing and verification workflows

**Weaknesses:**
- Cannot run persistent background services
- No direct access to .env files (gitignored)

---

### Claude (Anthropic)
**Codename:** Overseer / Architect
**Strengths:**
- ✅ Strategic planning and architecture
- ✅ Documentation and specification writing
- ✅ Code review and quality analysis
- ✅ Complex reasoning and decision-making
- ✅ Security considerations
- ✅ Breaking down large problems

**Best For:**
- Planning meetings and roadmap discussions
- Writing technical specifications
- Reviewing PRs and architecture decisions
- Defining scope and priorities

**Weaknesses:**
- No persistent file access in standard mode
- Context window limitations in long sessions

---

### GitHub Copilot
**Codename:** Quick Fixer
**Strengths:**
- ✅ Inline code completion
- ✅ Quick fixes and small changes
- ✅ Boilerplate generation
- ✅ Always available in IDE

**Best For:**
- Small, focused edits
- Generating utility functions
- Quick syntax fixes
- Autocomplete while coding

**Weaknesses:**
- Limited context awareness
- Not good for multi-file changes
- Can't reason about architecture

---

## 📋 Task Routing Guide

| Task Type | Best AI | Second Choice |
|-----------|---------|---------------|
| New feature (full) | Gemini | Claude (spec first) |
| UI polish | Gemini | - |
| Bug fixing | Gemini | Copilot (simple) |
| Architecture planning | Claude | Gemini |
| Documentation | Claude | Gemini |
| Quick edits | Copilot | Gemini |
| Code review | Claude | Gemini |
| Refactoring | Gemini | - |
| Testing | Gemini | - |
| Revenue strategy | Claude | - |
| Security audit | Claude | - |

---

## 🎯 Specialty Domains

### Music Studio
**Primary:** Gemini
**Notes:** Has context on songwriter agents, Suno workflow, TikTok integration

### Labs Hub
**Primary:** Gemini
**Notes:** Built the Gantt chart, project board, kanban views

### Agent System
**Primary:** Gemini
**Notes:** Built Architect, QA, Security, DevOps agents

### Revenue/Strategy
**Primary:** Claude
**Notes:** Better at business logic and planning

### Tauri/Desktop
**Primary:** Claude (spec) → Gemini (build)
**Notes:** Needs careful planning before implementation

### Database/Prisma
**Primary:** Gemini
**Notes:** Current Prisma 7 config needs attention

---

## 📝 Handoff Protocol

When switching between AIs:

1. **Update AI_CHANGELOG.md** with session summary
2. **Note any blockers** or incomplete work
3. **List files modified** so next AI has context
4. **Commit and push** all changes
5. **Reference this doc** for who should do what

---

## 🚨 Rules for All AIs

1. **Don't destroy** — This is a clean repo, everything has purpose
2. **Update the changelog** — Track your contributions
3. **Ask before major changes** — Especially infrastructure
4. **Test your changes** — Verify pages still work
5. **Commit frequently** — Small, focused commits
6. **Respect the 80/20 rule** — 80% hardening, 20% new ideas
