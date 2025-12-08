# Nexus Hardening - Task Breakdown

**Objective:** Top-down hardening with Music Studio operational first. Creative but grounded.

**Last Verified:** 2025-12-07 @ 22:20 CST

---

## Phase 1: Music Studio → Operational ✅ 100%
*Priority: PRIMARY FOCUS*

- [x] ✅ Verify Bridge API is running and agents are callable
  - `/music/agents` returns 4 agents: Lyricist, Composer, Critic, Producer
  - LM Studio + Ollama both online
- [x] ✅ Test full songwriter pipeline (Lyricist → Composer → Critic → Producer → Suno Prompt)
  - Lyricist brainstorm tested, returns concepts/imagery/emotions
  - Pipeline generates Suno-ready output with [Style] and [Lyrics]
- [x] ✅ Verify News integration for Newsician/Sentinel modes
  - RSS feeds configured (national + local MN sources)
  - Mode switching works, headlines appear in carousel
- [x] ✅ UI polish: Clean up pipeline visualization
  - Pipeline steps animate correctly
  - ✅ Added connection status indicator (green "Bridge Online" pill with Wifi icon)
- [x] ✅ Add error handling for LM Studio connection failures  
  - ✅ Added "Bridge Offline" red warning banner with retry button
  - ✅ Shows fallback agents when bridge is unreachable
  - ✅ Status indicator shows amber "Connecting..." during status check
- [x] ✅ Test "Copy to Suno" workflow end-to-end
  - Copy button shows "Copied!" with checkmark
  - Clipboard populated with [Style] + [Lyrics] format
  - Pipeline step activates after generation

---

## Phase 2: Labs Hub → Project Board Operational ✅ 95%
*Priority: Enable "build from within"*

- [x] ✅ Verify Gantt/Grid/Kanban views work correctly
  - 12-month timeline view displays all projects
  - Grid view shows cards with progress
  - Kanban view organizes by status columns
  - View switching is instant
- [x] ✅ Connect labs to database via Bridge API
  - Added Projects CRUD API to bridge (`GET/POST /projects`, `PUT/DELETE /projects/:id`)
  - Added `/projects/seed` endpoint for data migration
  - Labs Hub fetches from database with static data fallback
  - ✅ Green "DB Connected" status indicator in header
  - ✅ In-memory fallback for when Prisma operations fail
  - Prisma 7 with better-sqlite3 adapter configured
- [x] ✅ Staff Meeting Panel API tested
  - `/agents/meeting/start` - Start meeting with topic ✅
  - `/agents/meeting/status` - Get transcript and personas ✅
  - `/agents/meeting/stop` - End meeting ✅
  - Multi-agent debate with Architect, Security, QA personas working
- [ ] ⬜ Link projects to their respective "front door" pages
  - Projects with href navigate correctly
  - **TODO:** Ensure all active projects have valid hrefs

---

## Phase 3: Agents Hub → Core Infrastructure ✅ 95%
*Priority: Foundation for everything else*

- [x] ✅ Audit all 21 agent services in bridge/services/
  - Files: agent-core, agents, agents-advanced, agents-intent, agents-revenue, agents-songwriter, agents-staff-meeting
- [x] ✅ Verify agent registry is complete
  - 16 agent types registered in agentRegistry
- [x] ✅ Test agent invocation from webapp
  - `/agents/execute` tested successfully
- [x] ✅ Document which agents are operational vs stubs
  - Created `docs/AGENTS.md` with full documentation

### Agent Status:
| Agent | Status |
|-------|--------|
| lyricist | ✅ Operational |
| composer | ✅ Operational |
| critic | ✅ Operational |
| producer | ✅ Operational |
| revenue | ✅ Operational |
| intent | ✅ Operational |
| staff-meeting | ✅ Operational |
| research | ⚠️ Stub |
| code | ⚠️ Stub |
| workflow | ⚠️ Stub |
| architect | ⚠️ Stub |
| qa | ⚠️ Stub |
| security | ⚠️ Stub |
| devops | ⚠️ Stub |

---

## Phase 4: Supporting Cast → Hardening ⬜ Not Started
*Priority: Make daily-driver functional*

- [ ] Dashboard cleanup and system status display
- [ ] Chat → Verify LM Studio streaming works
- [ ] News Hub → Verify RSS feeds are operational
- [ ] Settings → Config management works

---

## Phase 5: Infrastructure → Tauri Integration ⬜ Not Started
*Priority: Desktop shell*

- [ ] Verify Tauri builds
- [ ] Test unified launch (webapp + bridge)
- [ ] Hot reload / dev cycle improvements

---

## Known Pain Points (From Master Plan)
- App restart is cumbersome
- Backend must start separately
- NODE_ENV warning spam
- Prisma CommonJS warnings
