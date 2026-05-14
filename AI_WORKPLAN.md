# AI WORKPLAN - NEXUS DEVELOPMENT

**Version:** 2.1.0  
**Created:** January 11, 2026  
**Updated:** May 14, 2026  
**Primary Builder:** Antigravity (IDE Agent)  
**Overseer:** Claude  
**Status:** Hardening Phase + Post-Reinstall Stabilization

---

## 🎯 Prime Directive

> **Fix what exists. Polish what works. Nothing new until foundation is solid.**

This workplan guides AI agents through Nexus development. Tasks are organized into Waves with clear priorities. Items are never deleted—only moved to future waves for re-evaluation.

**Read these first:**
1. `NEXUS_MASTER_PLAN.md` — Strategic vision and governance
2. `PHASE_PLAN.md` — Phase history and version targets
3. `AI_PROTOCOL.md` — Handoff procedures between agents
4. `SCOPE.md` — What's active vs frozen

---

## 📊 Current State Summary

| Category | Count | Status |
|----------|-------|--------|
| Desktop Tools (Core) | 7 | 🟢 Working |
| Web Deployment | 1 | 🟢 Live (dlxstudios.online) |
| Bridge API | 1 | 🟢 Live (bridge.dlxstudios.online) |
| Labs Projects (Active) | 13 | 🟡 Various States |
| Labs Projects (Concept) | 4 | ⏸️ Deferred |
| Agent Services | 18 | 🟢 8 Operational, 10 Stubs |
| Page Routes | 62 | 🟢 Most functional |

---

## 🌊 WAVE 1: Core Desktop Hardening ✅ COMPLETE
**Timeline:** Jan 11 - Feb 14, 2026  
**Status:** Done (with deployment acceleration)

### 1.1 Chat System Polish ✅
| Task | Priority | Status |
|------|----------|--------|
| Verify LM Studio streaming end-to-end | High | ✅ Working |
| Add model selector (LM Studio vs Ollama) | High | ✅ Done (sidebar tabs) |
| Implement conversation persistence | Medium | ✅ Done (localStorage) |
| Add token count display | Low | ⏸️ Deferred |
| Test error states gracefully | High | ✅ Done |

### 1.2 Dashboard Stability ✅
| Task | Priority | Status |
|------|----------|--------|
| Fix hydration mismatch (quote widget) | High | ✅ Done |
| Verify all widgets load without errors | High | ✅ Working |
| Test localStorage persistence | Medium | ✅ Working |
| Add graceful offline state | Medium | ✅ Done |

### 1.3 Agents Hub Completion ✅
| Task | Priority | Status |
|------|----------|--------|
| Audit 16 registered agents | High | ✅ Done (now 18) |
| Complete stub agents (Research, Code, QA) | Medium | 🟡 Still stubs |
| Add invoke feedback (loading, success, error) | High | ✅ Done |
| Test agent routing from UI | High | ✅ Working |

### 1.4 News Hub Verification ✅
| Task | Priority | Status |
|------|----------|--------|
| Verify RSS feeds still working | Medium | ✅ Working (100 sources) |
| Test filter tabs (All, Local, National) | Medium | ✅ Working |
| Verify Newsician integration | Medium | ✅ Working |

### 1.5 Settings Persistence ✅
| Task | Priority | Status |
|------|----------|--------|
| Test all settings save to DB | High | ✅ Working |
| Verify theme persists across restart | Medium | ✅ Working |
| Test API endpoint configuration | Medium | ✅ Working |

---

## 🌊 WAVE 2: Music Studio & Creation ✅ COMPLETE
**Timeline:** Completed Dec 2025  
**Status:** Done

### 2.1 Music Studio Pipeline ✅
| Task | Priority | Status |
|------|----------|--------|
| Verify full songwriter pipeline (Lyricist → Suno) | High | ✅ Working |
| Test "Copy to Suno" workflow | High | ✅ Working |
| Polish pipeline visualization | Medium | ✅ Done |
| Add generated content history | Medium | ✅ Done |

### 2.2 Newsician Integration ✅
| Task | Priority | Status |
|------|----------|--------|
| Test news → song headline flow | High | ✅ Working |
| Verify Midwest Sentinel mode | Medium | ✅ Working |
| Add content queue tracking | Medium | ✅ Done |

### 2.3 Studios Hub Organization ✅
| Task | Priority | Status |
|------|----------|--------|
| Commit pending studios page change | Low | ✅ Done |
| Verify all "Live" studios link correctly | Medium | ✅ Working |
| Add status indicators to disabled studios | Low | ✅ Done |

---

## 🌊 WAVE 3: Labs Hub & Project Board ✅ COMPLETE
**Timeline:** Completed Jan 2026  
**Status:** Done + Smartfolio Added

### 3.1 Labs Data Management ✅
| Task | Priority | Status |
|------|----------|--------|
| Test DB sync functionality | Medium | ✅ Working |
| Verify Gantt/Kanban views work | Medium | ✅ Working |
| Add project progress tracking | Medium | ✅ Done |

### 3.2 Staff Meeting System ✅
| Task | Priority | Status |
|------|----------|--------|
| Verify multi-agent debate | Medium | ✅ Working |
| Add meeting transcript export | Low | ⏸️ Deferred |
| Test persona switching | Low | ✅ Working |

### 3.3 Smartfolio (NEW) ✅
| Task | Priority | Status |
|------|----------|--------|
| Portfolio CRUD API | High | ✅ Done |
| AI Analyst integration | High | ✅ Done |
| Journal tracking | Medium | ✅ Done |

---

## 🌊 WAVE 4: Infrastructure & Deployment ✅ COMPLETE
**Timeline:** Jan 15 - Feb 14, 2026  
**Status:** Done - Both Desktop and Web Live

### 4.1 Tauri Desktop ✅
| Task | Priority | Status |
|------|----------|--------|
| Test fresh Windows install | High | ✅ Working |
| Verify Bridge auto-spawn in production | High | ✅ Working |
| Test system tray behavior | Medium | ✅ Working |
| Add keyboard shortcuts (F5, Escape) | Low | ⏸️ Deferred |

### 4.2 Web Deployment (NEW) ✅
| Task | Priority | Status |
|------|----------|--------|
| Deploy to Vercel | High | ✅ Live (dlxstudios.online) |
| Configure environment detection | High | ✅ Done |
| API rewrites for CORS | High | ✅ Done |
| Prisma postinstall fix | High | ✅ Done |

### 4.3 Bridge Tunnel (NEW) ✅
| Task | Priority | Status |
|------|----------|--------|
| Cloudflare tunnel setup | High | ✅ Done (setup_tunnel.ps1) |
| Bridge accessible remotely | High | ✅ Live (bridge.dlxstudios.online) |
| API key authentication | High | ✅ Done |
| CORS hardening | High | ✅ Done |

### 4.4 Build & Release ✅
| Task | Priority | Status |
|------|----------|--------|
| Clean nested Nexus/Nexus folder | High | 🟡 Renamed to _OLD_COPY |
| Align Prisma versions (webapp/bridge) | Low | ⏸️ Deferred (works fine) |
| Create v2.0.0 release | Medium | ✅ Done |

### 4.5 Documentation 🟡
| Task | Priority | Status |
|------|----------|--------|
| Update README with current state | Medium | ⏸️ Needs update |
| Verify AI_PROTOCOL.md accuracy | Medium | ✅ Accurate |
| Update HARDENING_STATUS.md | Medium | ✅ Done (this session) |

---

## 🌊 WAVE 5: Operations Labs (Next)
**Timeline:** Feb 15 - Mar 15, 2026  
**Focus:** Labs projects in Operations category

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Voice Command | 90% | ⬜ Complete remaining 10% |
| Automation Lab | 60% | ⬜ Polish workflow builder |
| Smart Home Control | 45% | ⬜ Design Home Assistant integration |
| AI Staff Meeting | 80% | ⬜ Add transcript export |
| Nexus Implementation Plan | 60% | ⬜ Continue roadmap execution |

---

## 🌊 WAVE 6: Intelligence Labs (Month 3)
**Focus:** Labs projects in Intelligence category

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Analytics Hub | 40% | ⬜ Build performance dashboards |
| Knowledge Base | 20% | ⬜ Implement doc search |
| Data Weave | 10% | ⬜ Design ETL pipeline |

---

## 🌊 WAVE 7: Capital & Revenue (Month 3-4)
**Focus:** Revenue features now unblocked by deployment

### Profit Side (Ready to Activate):
| Module | Dependencies | Action |
|--------|--------------|--------|
| Income Dashboard | ✅ Wave 4 complete | ⬜ Activate |
| Content Pipeline | ✅ Hardening complete | ⬜ Activate |
| Distribution Tracking | ✅ Music Studio stable | ⬜ Activate |
| Art Studio | Income Dashboard | ⬜ Plan scope |

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Passive Income | 60% | ⬜ Resume |
| Crypto Lab | 30% | ⬜ Resume |
| Smartfolio | 100% | ✅ Complete |

---

## 🌊 WAVE 8: Creation Labs (Month 4)
**Focus:** Labs projects in Creation category

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Agent Forge | 50% | ⬜ Expand agent building UI |
| Code Generator | 75% | ⬜ Polish refactoring tools |
| Vision Lab | 5% | ⬜ Research scope |

---

## 🌊 WAVE 9+: Experimental & Future (Q2+ 2026)
**Focus:** Concept-stage items for future review

### From Labs Hub (Concepts):
| Project | Current Progress | Review Date | Notes |
|---------|------------------|-------------|-------|
| AURA Interface | 0% | Q2 2026 | Natural UI research |
| PC Optimizer | 0% | Q2 2026 | System tuning |
| LLM Lab | 0% | Q2 2026 | Model optimization |

### Future Ideas Backlog:
| Idea | Source | Review Date |
|------|--------|-------------|
| Etsy/Print-on-Demand | Master Plan | Q2 2026 |
| CafePress Integration | Master Plan | Q2 2026 |
| Blog/AdSense | Master Plan | Q2 2026 |
| Home Assistant Integration | Roadmap | Q2 2026 |

---

## 📋 Quick Reference: What's Where

### Live Deployment
```
Web:     https://www.dlxstudios.online
Bridge:  https://bridge.dlxstudios.online
Desktop: Tauri app (local)
```

### Active Desktop Tools
```
/dashboard  - Widget home ✅
/chat       - LM Studio chat ✅
/agents     - Agent tiles ✅
/news       - RSS feeds ✅
/settings   - Configuration ✅
/terminal   - Command interface ✅
/music      - Songwriter pipeline ✅
```

### Labs Projects (by Category)
```
Operations:    5 projects (nexus-plan, meeting, voice, automation, smarthome)
Intelligence:  3 projects (analytics, knowledge, dataweave)
Creation:      4 projects (music-studio, forge, codegen, vision)
Capital:       3 projects (income, crypto, smartfolio)
Experimental:  3 projects (aura, pcoptimize, llmoptimize)
```

### Backend Services (bridge/services/)
```
Operational:  lmstudio, ollama, system, google, github, agents, 
              agents-songwriter, agents-staff-meeting, news, content,
              settings, smartfolio, analyst, security, errors, performance
Stubs:        agents-advanced (research, code, workflow, architect, qa, security, devops)
```

---

## 🔄 Wave Completion Protocol

After each Wave:
1. [x] Run full test on installed desktop app
2. [x] Verify Bridge auto-spawn
3. [x] Commit all changes with clear message
4. [x] Update HARDENING_STATUS.md
5. [x] Version bump if substantial
6. [ ] Create release notes
7. [x] Review next Wave priorities

---

## 🚫 Out of Scope (Until Explicit GO)

- New page routes not in Labs Hub
- Features requiring Planning Meeting approval
- Major refactors without clear benefit

---

## 📞 Handoff Protocol

When switching between AI agents:
1. Complete current task or reach clean stopping point
2. Commit changes with descriptive message
3. Update this file with progress
4. Document any blockers or decisions made
5. Follow AI_PROTOCOL.md for full handoff

---

## 📝 Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-11 | 1.0.0 | Initial workplan created from project review |
| 2026-02-14 | 2.0.0 | Updated for reality: Wave 1-4 complete, deployment live, Smartfolio added |
| 2026-05-14 | 2.1.0 | Post-reinstall: Pieces OS + Hermes Agent integrated, app/ identified as hermes-workspace, all docs updated |

---

*Waves 1-4 Complete. Wave 5 (Operations Labs) is next.*
