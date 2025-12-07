# PROJECT SCOPE

**Version:** 1.0.0  
**Last Updated:** December 7, 2025  
**Status:** Foundation Phase (~88 days remaining)

---

## ⚠️ READ NEXUS_MASTER_PLAN.md FIRST

This file is the quick reference. The Master Plan has full context.

---

## Active Development

### Deep Focus (Build These)

| Module | Location | Status |
|--------|----------|--------|
| **Music Studio** | webapp/src/app/music | 🟡 Primary focus |
| **Dev Studio** | webapp/src/app/studios/dev | 🟡 Rises with tide |
| **Agents Hub** | webapp/src/app/agents | 🟡 Core infrastructure |

### Supporting Cast (Maintain)

| Module | Location | Status |
|--------|----------|--------|
| News Hub | webapp/src/app/news | 🟢 Working |
| Chat | webapp/src/app/chat | 🟢 Working |
| Dashboard | webapp/src/app/dashboard | 🟡 Needs cleanup |
| Terminal | webapp/src/app/terminal | 🟢 Working |
| Settings | webapp/src/app/settings | 🟡 Needs work |

### Backend

| Component | Location | Status |
|-----------|----------|--------|
| Bridge API | bridge/ | 🟢 Working (port 3456) |
| Agent Services | bridge/services/ | 🟢 15+ agents defined |
| Database | bridge/prisma/ | 🟢 SQLite working |

---

## 🚫 FROZEN

**Location:** `pipeline/` (to be migrated)

The PowerShell content pipeline is **frozen** until Foundation Phase completes.

### What It Is
- LM Studio → content generation
- WordPress/HTML publishing
- Automated blog posts

### Why Frozen
Foundation Before Revenue. We build the platform first.

### DO NOT
- Modify pipeline code
- Activate scheduled tasks
- Start revenue experiments

---

## 💡 Ideas Only (No Code Yet)

These exist in the Master Plan backlog only:

- Etsy/Print-on-Demand
- CafePress
- Blog/AdSense (pipeline ready, just frozen)

**No code until:**
1. Income Seeker researches
2. Legal Advisor reviews
3. Planning Meeting approves
4. Human gives GO

---

## Infrastructure Work (Always Allowed)

- Tauri shell setup
- Build tooling
- Git operations
- Documentation
- Bug fixes in active modules

---

## For AI Agents

**Before starting work:**

1. ✅ Read NEXUS_MASTER_PLAN.md
2. ✅ Check this file for scope
3. ✅ Read AI_PROTOCOL.md for handoff rules
4. ❓ If unclear, ask before building

**If a task mentions:**
- "content generation" / "blog posts" / "AdSense" → STOP, it's frozen
- "new revenue stream" / "monetization" → Needs Planning Meeting
- Active modules above → GO

---

*Stay in bounds. Build what matters.*
