# AI Agent Protocol

**Version:** 2.0.0  
**Last Updated:** December 7, 2025  
**Maintainer:** Claude (Overseer)

---

## ⚠️ FIRST: Read These Docs

1. **NEXUS_MASTER_PLAN.md** — The full architecture and governance
2. **SCOPE.md** — What's active vs frozen
3. **This file** — Handoff procedures

---

## Purpose

This protocol standardizes handoffs between AI agents working on Nexus. All agents (Claude, Gemini Pro, Copilot, etc.) should read this document before starting work.

---

## Environment Context

### Target Platform
- **Primary OS:** Windows 11 Pro (LuxRig)
- **Desktop Framework:** Tauri 2.x
- **Node Version:** v24.x
- **Rust Version:** 1.91.x
- **Package Manager:** npm

### Key Paths
```
C:\Repos GIT\Nexus\              # Main repo
C:\Repos GIT\Nexus\webapp\       # Next.js frontend
C:\Repos GIT\Nexus\bridge\       # Express backend (port 3456)
C:\Repos GIT\Nexus\src-tauri\    # Tauri Rust backend
C:\Repos GIT\Nexus\pipeline\     # PowerShell automation (frozen)
```

### Local Services
- **LM Studio:** http://localhost:1234 (qwen2.5-vl-7b-instruct)
- **Bridge API:** http://localhost:3456
- **Webapp Dev:** http://localhost:3000

---

## Pre-Work Checklist

Every AI agent must verify before writing code:

### 1. Read the Plan
- [ ] Read NEXUS_MASTER_PLAN.md
- [ ] Check SCOPE.md for what's active/frozen
- [ ] Understand where your work fits

### 2. Branch Awareness
```powershell
git branch -a                    # What branches exist?
git log --oneline -5 main        # What's on main?
```

### 3. Know Your Boundaries
- [ ] Am I working in an approved area?
- [ ] Is this module active or frozen?
- [ ] Does this change need Planning Meeting approval?

---

## Handoff Protocol

### Incoming Handoff (Receiving Work)

A proper handoff MUST include:

```markdown
## HANDOFF: [Feature Name]

**Branch:** [current branch]
**Module:** [which front door]

**Context:**
- [What exists]
- [What's been tried]

**Task:**
1. [Specific task]

**Success Criteria:**
- [ ] [How to verify it works]
```

### Outgoing Handoff (Completing Work)

Before finishing, provide:

```markdown
## COMPLETION: [Feature Name]

**Branch:** [branch name]
**Module:** [which front door]

**What Was Done:**
- [Change 1]
- [Change 2]

**Files Changed:**
- `path/to/file` - [what changed]

**Testing Performed:**
- [x] [Test 1]
- [ ] [Test 2] - NOT TESTED

**To Run:**
```powershell
# Commands to verify
```

**Known Issues:**
- [Any bugs or incomplete items]

**Next Steps:**
- [What should be done next]
```

---

## Branch Naming

```
[agent]/[module]-[description]

Examples:
claude/music-studio-ui-polish
gemini/agents-hub-deploy-modal
copilot/hotfix-bridge-crash
```

**Rules:**
- Feature branches, never commit directly to main
- Include agent name for traceability
- Keep names descriptive but short

---

## The Advisory Council

### Before Building New Features

If the work involves:
- New revenue streams → Income Seeker researches first
- Platform TOS / legal implications → Legal Advisor reviews
- Significant new direction → Planning Meeting approval

**Agents don't have GO authority. Only the human does.**

---

## Agent Capabilities

| Agent | Strengths | Limitations |
|-------|-----------|-------------|
| Claude | Planning, oversight, documentation, Git | No direct file system (uses tools) |
| Gemini 3 Pro | Multi-file builds, architecture | May not have full Git context |
| Copilot | Inline completions, quick fixes | Limited context window |

---

## Quick Reference: Commands

### PowerShell (LuxRig)
```powershell
# Navigate
cd "C:\Repos GIT\Nexus"

# Webapp
cd webapp; npm run dev

# Bridge
cd bridge; node server.js

# Tauri
cd src-tauri; cargo tauri dev

# Git
git status
git add .
git commit -m "message"
git push
```

---

## Incident Log

Document issues here to prevent recurrence:

### December 7, 2025: Nexus Created from Fresh-Start
- **What happened:** Nexus (Repo #18) created as clean slate migration from Fresh-Start (Repo #17)
- **Issue:** Incomplete transplant — missing pipeline, config, tests, protocol docs
- **Resolution:** NEXUS_MASTER_PLAN.md created, migration in progress

---

*This is a living document. Update when new patterns emerge.*
