# PROJECT SCOPE

**Version:** 1.1.0  
**Last Updated:** December 8, 2025  
**Status:** Growth Phase (Active)

---

## ⚠️ READ NEXUS_MASTER_PLAN.md FIRST

This file is the quick reference. The Master Plan has full context.

---

## Active Development

### Deep Focus (Build These)

| Module | Location | Status |
|--------|----------|--------|
| **Music Studio** | webapp/src/app/music | 🟢 Operational |
| **Content Pipeline** | pipeline/ | 🟢 UNFROZEN - Active |
| **Income Dashboard** | webapp/src/app/income | 🟡 Building |
| **Dev Studio** | webapp/src/app/studios/dev | 🟡 Rises with tide |
| **Agents Hub** | webapp/src/app/agents | 🟢 Core infrastructure |

### Revenue Streams (Growth Phase)

| Stream | Location | Status |
|--------|----------|--------|
| Blog/AdSense | pipeline/ + WordPress | 🟢 Ready to activate |
| Music/Streaming | webapp/src/app/music | 🟡 Distribution tracking |
| Art/Etsy | webapp/src/app/studios/art | 🔘 Planned |

### Supporting Cast (Maintain)

| Module | Location | Status |
|--------|----------|--------|
| News Hub | webapp/src/app/news | 🟢 Working |
| Chat | webapp/src/app/chat | 🟢 Working |
| Dashboard | webapp/src/app/dashboard | 🟢 Working |
| Terminal | webapp/src/app/terminal | 🟢 Working |
| Settings | webapp/src/app/settings | 🟢 Working |

### Backend

| Component | Location | Status |
|-----------|----------|--------|
| Bridge API | bridge/ | 🟢 Working (port 3456) |
| Agent Services | bridge/services/ | 🟢 15+ agents defined |
| Database | bridge/prisma/ | 🟢 SQLite working |

---

## 🟢 CONTENT PIPELINE (UNFROZEN)

**Location:** `pipeline/`

The PowerShell content pipeline is now **ACTIVE** for Growth Phase.

### What It Does
- LM Studio → content generation
- WordPress/HTML publishing
- Automated blog posts with AdSense
- Affiliate link injection

### Activation Checklist
Before running in production:
- [ ] Verify `pipeline/core/Config.json` has correct WordPress credentials
- [x] Test with `WordPress.Enabled: false` first (Verified successful dry-run)
- [ ] Confirm AdSense account is approved
- [x] Run `.\tests\verify_phases_1_2_3.ps1` to validate (Passed)

### Running the Pipeline
```powershell
cd pipeline/core
.\Orchestrator.ps1
```

---

## 🟡 In Progress (Growth Phase)

| Stream | Status | Next Step |
|--------|--------|-----------|
| Blog/AdSense | Ready | Configure WordPress, run pipeline |
| Music/Streaming | Tracking | Build distribution dashboard |
| Art/Etsy | Planned | Create Art Studio UI |

---

## Infrastructure Work (Always Allowed)

- Tauri shell setup
- Build tooling
- Git operations
- Documentation
- Bug fixes in active modules
- Revenue feature development

---

## For AI Agents

**Before starting work:**

1. ✅ Read NEXUS_MASTER_PLAN.md
2. ✅ Check this file for scope
3. ✅ Read AI_PROTOCOL.md for handoff rules
4. ❓ If unclear, ask before building

**Growth Phase Rules:**
- Content generation → ✅ GO (pipeline is active)
- Revenue features → ✅ GO (approved in Growth Phase)
- New revenue streams → Check against plan first

---

*Revenue engine activated. Build, ship, earn.*
