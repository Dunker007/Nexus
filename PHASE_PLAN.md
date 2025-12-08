# NEXUS 10-PHASE PLAN

**Version:** 1.0.0  
**Created:** December 8, 2025  
**Status:** Foundation Phase

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
- `0.1.x` — Foundation Phase (current)
- `0.2.x` — Core features complete
- `0.3.x` — Music Studio functional
- `1.0.0` — Foundation Phase complete

---

## Current State

- ✅ Tauri desktop app builds and installs (v0.2.0)
- ✅ Bridge auto-spawns with app
- ✅ 72 page routes exist (mostly stubs)
- ✅ 15+ agents defined in bridge/services
- ✅ LM Studio + Ollama connected
- ❌ Most pages are empty shells
- ❌ No unified data flow
- ❌ Agents not wired to UI

---

## Phase 1: Core Loop
**Duration:** Week 1-2  
**Version Target:** 0.2.1

**Goal:** Dashboard → Bridge → AI → Response working end-to-end

| Task | What |
|------|------|
| Dashboard cleanup | Remove dead widgets, show real system status |
| Health endpoint | Bridge `/health` returns LM Studio, Ollama, system stats |
| Live status | Dashboard polls health, shows green/red indicators |
| One AI call | Button that sends prompt → LM Studio → shows response |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [ ] Test fresh install
- [ ] Verify Bridge auto-spawn
- [ ] Version bump to 0.2.1

**Exit Criteria:** Open app, see real status, click button, get AI response.

---

## Phase 2: Agent Activation
**Duration:** Week 2-3  
**Version Target:** 0.2.2

**Goal:** Agents page lists all agents with invoke capability

| Task | What |
|------|------|
| Agent registry | Bridge `/agents` returns all available agents |
| Agents page | Grid of agent cards with status |
| Invoke UI | Click agent → input → get response |
| Agent routing | Bridge routes to correct agent service |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [ ] Test agent invocation in production build
- [ ] Version bump to 0.2.2

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
- [ ] Rebuild installer
- [ ] Test chat persistence across app restarts
- [ ] Version bump to 0.2.3

**Exit Criteria:** Chat is your daily driver for AI interaction.

---

## Phase 4: Music Studio MVP
**Duration:** Week 4-5  
**Version Target:** 0.3.0

**Goal:** Generate usable Suno prompts from the UI

| Task | What |
|------|------|
| Songwriter room | UI for Lyricist → Composer → Critic → Producer flow |
| Theme input | Enter theme, style, mood |
| Lyrics output | See generated lyrics with revisions |
| Suno prompt | Export formatted prompt ready for Suno |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [ ] Full songwriter flow works in production
- [ ] Version bump to 0.3.0 (feature milestone)

**Exit Criteria:** Input theme → Get lyrics + Suno prompt you'd actually use.

---

## Phase 5: News → Content Pipeline
**Duration:** Week 5-6  
**Version Target:** 0.3.1

**Goal:** News feeds songwriter agents

| Task | What |
|------|------|
| News aggregation | RSS feeds parsed and stored |
| Newsician trigger | One-click "write song about this headline" |
| Midwest Sentinel | Platform-safe political commentary mode |
| Content queue | Track generated content awaiting Suno |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [ ] News → Song flow works end-to-end
- [ ] Version bump to 0.3.1

**Exit Criteria:** News headline → Song draft in queue.

---

## Phase 6: Settings & Config
**Duration:** Week 6-7  
**Version Target:** 0.3.2

**Goal:** All configuration manageable from UI

| Task | What |
|------|------|
| API endpoints | Configure LM Studio, Ollama URLs |
| Model preferences | Default models per task |
| Agent tuning | Adjust agent prompts/parameters |
| Theme/appearance | Dark mode, accent colors |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [ ] Settings persist across reinstalls
- [ ] Version bump to 0.3.2

**Exit Criteria:** Change any config from Settings, persists across restarts.

---

## Phase 7: System Tray & Startup
**Duration:** Week 7  
**Version Target:** 0.4.0

**Goal:** True desktop citizen behavior

| Task | What |
|------|------|
| Minimize to tray | Close button hides to tray |
| Tray menu | Show, Reload, Quit options |
| Windows startup | Optional auto-start with Windows |
| Global hotkey | Summon Nexus from anywhere |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [ ] Test startup behavior
- [ ] Test tray behavior after fresh install
- [ ] Version bump to 0.4.0 (desktop milestone)

**Exit Criteria:** App runs silently in tray, hotkey brings it up.

---

## Phase 8: Tailscale Remote Access
**Duration:** Week 8  
**Version Target:** 0.4.1

**Goal:** Access Nexus from Chromebook/phone

| Task | What |
|------|------|
| Tailscale setup | LuxRig on Tailscale network |
| Web mode | Next.js serves on Tailscale IP |
| Auth layer | Basic auth or Tailscale ACLs |
| Mobile test | Access from phone browser |

**Desktop Checkpoint:**
- [ ] Desktop app still works locally
- [ ] Remote access doesn't break local usage
- [ ] Version bump to 0.4.1

**Exit Criteria:** Couch → Chromebook → LuxRig workflow works.

---

## Phase 9: Cleanup & Polish
**Duration:** Week 8-9  
**Version Target:** 0.5.0

**Goal:** Remove dead code, polish what remains

| Task | What |
|------|------|
| Page audit | Delete or stub-ify unused pages |
| Error handling | Graceful failures everywhere |
| Loading states | Proper spinners, skeletons |
| Keyboard shortcuts | F5 reload, Escape close, etc. |

**Desktop Checkpoint:**
- [ ] Rebuild installer
- [ ] Full QA pass on installed app
- [ ] No broken pages or dead ends
- [ ] Version bump to 0.5.0

**Exit Criteria:** App feels solid, no dead ends or broken pages.

---

## Phase 10: Foundation Complete
**Duration:** Week 10  
**Version Target:** 1.0.0

**Goal:** Checkpoint before Growth Phase

| Task | What |
|------|------|
| Documentation | README, setup guide current |
| Git clean | No stray files, proper .gitignore |
| Backup | Full repo backup + installer archived |
| Planning board | Ready for Growth Phase decisions |

**Desktop Checkpoint:**
- [ ] Final production build
- [ ] Archive installer as v1.0.0-foundation
- [ ] Create GitHub release
- [ ] Version bump to 1.0.0

**Exit Criteria:** Hand off to any AI agent cleanly. Ready to unfreeze Content Pipeline.

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

---

## Rules

1. **Desktop app is the product** — not the dev server
2. **Every phase ends with a working installer**
3. **Version bumps are commitments** — don't skip them
4. **If it breaks production, roll back first**
5. **Test on fresh install, not just dev mode**

---

*Build the app. Ship the app. Use the app.*
