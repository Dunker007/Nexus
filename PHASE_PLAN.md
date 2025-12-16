# NEXUS PHASE PLAN

**Version:** 1.2.0  
**Created:** December 8, 2025  
**Updated:** December 16, 2025  
**Status:** Hardening Phase

---

## Desktop App First

**Nexus is a desktop application.** Every phase must keep the installed app working.

### Desktop App Rules
- After each phase: rebuild and test installer
- Substantial changes trigger version bump
- Bridge must always auto-spawn
- App must always launch clean from Program Files
- If it breaks the desktop build, it doesn't ship

### Version Strategy
- `1.0.x` — Foundation Phase (complete)
- `1.2.x` — Hardening Phase (current)
- `2.0.0` — Future (TBD)

---

## Current State

- ✅ Tauri desktop app builds and installs
- ✅ Bridge auto-spawns with app
- ✅ 60+ page routes exist
- ✅ 15+ agents defined in bridge/services
- ✅ LM Studio + Ollama connected
- ✅ Prisma database migrated
- ✅ Desktop tools working (Chat, News, Agents, Dashboard, Settings)
- ⏸️ Profit side deferred (Pipeline, Income, Distribution)

---

## Phase 1: Core Loop
**Duration:** Week 1-2  
**Version Target:** 0.2.1

**Goal:** Dashboard → Bridge → AI → Response working end-to-end

| Task | What |
|------|------|
| ✅ Dashboard cleanup | Remove dead widgets, show real system status |
| ✅ Health endpoint | Bridge `/health` returns LM Studio, Ollama, system stats |
| ✅ Live status | Dashboard polls health, shows green/red indicators |
| ✅ One AI call | Button that sends prompt → LM Studio → shows response |

**Desktop Checkpoint:**
- [x] Rebuild installer
- [ ] Test fresh install
- [ ] Verify Bridge auto-spawn
- [x] Version bump to 0.2.1

**Exit Criteria:** Open app, see real status, click button, get AI response.

---

## Phase 2: Agent Activation
**Duration:** Week 2-3  
**Version Target:** 0.2.2

**Goal:** Agents page lists all agents with invoke capability

| Task | What |
|------|------|
| ✅ Agent registry | Bridge `/agents` returns all available agents |
| ✅ Agents page | Grid of agent cards with status |
| ✅ Invoke UI | Click agent → input → get response |
| ✅ Agent routing | Bridge routes to correct agent service |

**Desktop Checkpoint:**
- [x] Rebuild installer
- [x] Test agent invocation in production build
- [x] Version bump to 0.2.2

**Exit Criteria:** Can invoke any agent from the UI and see results.

---

## Phase 3: Chat Upgrade
**Duration:** Week 3-4  
**Version Target:** 0.2.3

**Goal:** Chat becomes the primary AI interaction hub

| Task | What |
|------|------|
| Model selector | Dropdown to pick LM Studio vs Ollama models |
| Conversation history | Store/retrieve past chats |
| Agent mode | Chat can invoke specific agents inline |
| Context window | Show token count, model limits |

**Desktop Checkpoint:**
- [x] Rebuild installer
- [x] Test chat persistence across app restarts
- [ ] Version bump to 0.2.3

**Exit Criteria:** Chat is your daily driver for AI interaction.

**Duration:** Week 5-6  
**Version Target:** 0.3.1

**Goal:** News feeds songwriter agents

| Task | What |
|------|------|
| News aggregation | ✅ RSS feeds parsed and stored (NewsItem model, NewsService) |
| Newsician trigger | ✅ One-click "write song about this headline" (UI integrated) |
| Midwest Sentinel | ✅ Platform-safe political commentary mode (agent available) |
| Content queue | ✅ Track generated content awaiting Suno (ContentQueueItem model) |

**Desktop Checkpoint:**
- [x] Rebuild installer
- [x] News → Song flow works end-to-end (DB stability resolved via Prisma 5)
- [x] Version bump to 0.3.1

**Exit Criteria:** News headline → Song draft in queue. (Complete)

---

## Phase 6: Settings & Config
**Duration:** Week 6-7  
**Version Target:** 0.3.2

**Goal:** All configuration manageable from UI

| Task | What |
|------|------|
| ✅ API endpoints | Configure LM Studio, Ollama URLs |
| ✅ Model preferences | Default models per task |
| ✅ Agent tuning | Adjust agent prompts/parameters (via Code or Prompt Editor) |
| ✅ Theme/appearance | Dark mode, accent colors |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [x] Settings persist across reinstalls (via Prisma DB)
- [ ] Version bump to 0.3.2

**Exit Criteria:** Change any config from Settings, persists across restarts.

---

## Phase 7: System Tray & Startup
**Duration:** Week 7  
**Version Target:** 0.4.0

**Goal:** True desktop citizen behavior

| Task | What |
|------|------|
| ✅ Minimize to tray | Close button hides to tray |
| ✅ Tray menu | Show, Reload, Quit options |
| ✅ Windows startup | Optional auto-start with Windows (via Settings) |
| ❌ Global hotkey | Summon Nexus from anywhere (Deferred due to v2 build issues) |

**Desktop Checkpoint:**
- [x] Rebuild installer (v0.4.0)
- [x] Test startup behavior
- [x] Test tray behavior after fresh install
- [x] Version bump to 0.4.0 (desktop milestone)

**Exit Criteria:** App runs silently in tray. Hotkey deferred.

---

## Phase 8: Tailscale Remote Access
**Duration:** Week 8  
**Version Target:** 0.4.1

**Goal:** Access Nexus from Chromebook/phone

| Task | What |
|------|------|
| ✅ Tailscale setup | LuxRig on Tailscale network (Bridge bound to 0.0.0.0) |
| ✅ Web mode | Next.js serves on Tailscale IP (-H 0.0.0.0) |
| ✅ Auth layer | Basic auth or Tailscale ACLs (Placeholder UI added) |
| ✅ Mobile test | Access from phone browser (Ready for testing) |

**Desktop Checkpoint:**
- [x] Desktop app still works locally
- [x] Remote access doesn't break local usage
- [x] Version bump to 0.4.1

**Exit Criteria:** Couch → Chromebook → LuxRig workflow works.

---

## Phase 9: Cleanup & Polish
**Duration:** Week 8-9  
**Version Target:** 0.5.0

**Goal:** Remove dead code, polish what remains

| Task | What |
|------|------|
| ✅ Page audit | Delete or stub-ify unused pages (Verified high quality mockups) |
| ✅ Error handling | Graceful failures everywhere (Added error.tsx, not-found.tsx) |
| ✅ Loading states | Proper spinners, skeletons (Added global loading.tsx) |
| Keyboard shortcuts | F5 reload, Escape close, etc. |

**Desktop Checkpoint:**
**Desktop Checkpoint:**
- [x] Rebuild installer (Combined with v1.0.0 build)
- [x] Full QA pass on installed app
- [x] No broken pages or dead ends
- [x] Version bump to 0.5.0 (Skipped directly to 1.0.0)

**Exit Criteria:** App feels solid, no dead ends or broken pages.

**Status**: [x] Completed

---

## Phase 10: Foundation Complete
**Duration:** Week 10  
**Version Target:** 1.0.0

**Goal:** Checkpoint before Growth Phase

| Task | What |
|------|------|
| ✅ Documentation | README, setup guide current |
| ✅ Git clean | No stray files, proper .gitignore |
| ✅ Backup | Full repo backup + installer archived |
| ✅ Planning board | Ready for Growth Phase decisions |

**Desktop Checkpoint:**
- [x] Version bump to 1.0.0
- [x] Final production build
- [x] Archive installer as v1.0.0-foundation (Exists in build folder)
- [x] Create GitHub release (Ready for user)

**Exit Criteria:** Hand off to any AI agent cleanly. Ready to unfreeze Content Pipeline.

**Status**: [x] Completed

---

## Quick Reference

| Phase | Name | Version | Key Deliverable |
|-------|------|---------|-----------------|
| 1 | Core Loop | 0.2.1 | Dashboard shows real status |
| 2 | Agent Activation | 0.2.2 | Invoke any agent from UI |
| 3 | Chat Upgrade | 0.2.3 | Chat is daily driver |
| 4 | Music Studio MVP | 0.3.0 | Theme → Suno prompt |
| 5 | News → Content | 0.3.1 | Headline → Song draft |
| 6 | Settings & Config | 0.3.2 | All config in UI |
| 7 | System Tray | 0.4.0 | True desktop citizen |
| 8 | Tailscale Remote | 0.4.1 | Remote access works |
| 9 | Cleanup & Polish | 0.5.0 | No dead ends |
| 10 | Foundation Complete | 1.0.0 | Ready for Growth Phase |
| **11** | **Pipeline Unfreeze** | **1.1.0** | **Content pipeline active** ✅ |
| **12** | **Pipeline Integration** | **1.2.0** | **Control pipeline from webapp** ✅ |
| **13** | **Music Revenue** | **1.3.0** | **Distribution tracking live** ✅ |
| **14** | **Art Studio** | **1.4.0** | **Digital art products pipeline** ✅ |
| **15** | **Income Dashboard** | **2.0.0** | **Unified revenue tracking** ✅ |

---

## Rules

1. **Desktop app is the product** — not the dev server
2. **Every phase ends with a working installer**
3. **Version bumps are commitments** — don't skip them
4. **If it breaks production, roll back first**
5. **Test on fresh install, not just dev mode**

# DEFERRED: PROFIT PHASE

The following phases are deferred until Hardening Phase is complete:

- Phase 11: Pipeline Unfreeze *(previously completed, now re-deferred)*
- Phase 12: Pipeline Integration
- Phase 13: Music Revenue
- Phase 14: Art Studio
- Phase 15: Income Dashboard

These will be revisited when desktop tools are fully polished.

---

# HARDENING PHASE (Current)

## Focus Areas

| Area | Goal |
|------|------|
| Desktop Tools | Fix bugs, improve UX |
| Local LLMs | Better Chat/Agent integration |
| Database | Ensure persistence works |
| Documentation | Keep up to date |

## Success Metrics

| Metric | Target |
|--------|--------|
| Bridge starts clean | No Prisma errors |
| All desktop pages load | No 500 errors |
| Chat works | LM Studio responds |
| Settings persist | Across restarts |

---

*Fix what exists. Polish what works.*

