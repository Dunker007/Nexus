# PROJECT SCOPE

**Version:** 1.2.0  
**Last Updated:** December 16, 2025  
**Status:** Hardening Phase

---

## ⚠️ READ NEXUS_MASTER_PLAN.md FIRST

This file is the quick reference. The Master Plan has full context.

---

## Active Development

### Desktop Tools (Active)

| Module | Location | Status |
|--------|----------|--------|
| **Chat** | webapp/src/app/chat | 🟢 Working |
| **News Hub** | webapp/src/app/news | 🟢 Working |
| **Agents Hub** | webapp/src/app/agents | 🟢 Working |
| **Dashboard** | webapp/src/app/dashboard | 🟢 Working |
| **Settings** | webapp/src/app/settings | 🟢 Working |
| **Terminal** | webapp/src/app/terminal | 🟢 Working |
| **Music Studio** | webapp/src/app/music | 🟢 Working |

### Profit Side (Deferred)

| Module | Location | Status |
|--------|----------|--------|
| **Content Pipeline** | pipeline/ | ⏸️ Deferred |
| **Income Dashboard** | webapp/src/app/income | ⏸️ Deferred |
| **Distribution** | bridge/routes/distribution.js | ⏸️ Deferred |
| **Art Studio** | webapp/src/app/studios/art | ⏸️ Deferred |

### Backend

| Component | Location | Status |
|-----------|----------|--------|
| Bridge API | bridge/ | 🟢 Working (port 3456) |
| Agent Services | bridge/services/ | 🟢 15+ agents defined |
| Database | bridge/prisma/ | 🟢 SQLite working |

---

## ⏸️ CONTENT PIPELINE (DEFERRED)

**Location:** `pipeline/`

The PowerShell content pipeline is deferred until Hardening Phase is complete.

### What It Does (When Active)
- LM Studio → content generation
- WordPress/HTML publishing
- Automated blog posts

### To Resume Later
```powershell
cd pipeline/core
.\Orchestrator.ps1
```

---

## Infrastructure Work (Always Allowed)

- Tauri shell improvements
- Build tooling
- Git operations
- Documentation
- Bug fixes in desktop modules
- Local LLM integration improvements

---

## For AI Agents

**Before starting work:**

1. ✅ Read NEXUS_MASTER_PLAN.md
2. ✅ Check this file for scope
3. ✅ Read AI_PROTOCOL.md for handoff rules
4. ❓ If unclear, ask before building

**Hardening Phase Rules:**
- Desktop tools → ✅ GO (improvements allowed)
- Profit/Revenue features → ⏸️ DEFERRED
- New features → Only for desktop tools

---

*Fix what exists. Polish what works.*

