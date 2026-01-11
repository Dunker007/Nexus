# AI WORKPLAN - NEXUS DEVELOPMENT

**Version:** 1.0.0  
**Created:** January 11, 2026  
**Primary Builder:** Gemini 3 Pro (Antigravity IDE)  
**Overseer:** Claude  
**Status:** Hardening Phase

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
| Desktop Tools (Core) | 7 | 🟢 Active - Need Polish |
| Labs Projects (Active) | 12 | 🟡 Various States |
| Labs Projects (Concept) | 5 | ⏸️ Deferred |
| Agent Services | 16+ | 🟢 7 Operational, 7 Stubs |
| Page Routes | 60+ | 🟡 Many need review |

---

## 🌊 WAVE 1: Core Desktop Hardening (Current)
**Timeline:** Now - 2 weeks  
**Focus:** Make daily-driver features bulletproof

### 1.1 Chat System Polish
| Task | Priority | Status |
|------|----------|--------|
| Verify LM Studio streaming end-to-end | High | ⬜ |
| Add model selector (LM Studio vs Ollama) | High | ⬜ |
| Implement conversation persistence | Medium | ⬜ |
| Add token count display | Low | ⬜ |
| Test error states gracefully | High | ⬜ |

### 1.2 Dashboard Stability
| Task | Priority | Status |
|------|----------|--------|
| Fix hydration mismatch (quote widget) | High | ✅ Done |
| Verify all widgets load without errors | High | ⬜ |
| Test localStorage persistence | Medium | ⬜ |
| Add graceful offline state | Medium | ⬜ |

### 1.3 Agents Hub Completion
| Task | Priority | Status |
|------|----------|--------|
| Audit 16 registered agents | High | ⬜ |
| Complete stub agents (Research, Code, QA) | Medium | ⬜ |
| Add invoke feedback (loading, success, error) | High | ⬜ |
| Test agent routing from UI | High | ⬜ |

### 1.4 News Hub Verification
| Task | Priority | Status |
|------|----------|--------|
| Verify RSS feeds still working | Medium | ⬜ |
| Test filter tabs (All, Local, National) | Medium | ⬜ |
| Verify Newsician integration | Medium | ⬜ |

### 1.5 Settings Persistence
| Task | Priority | Status |
|------|----------|--------|
| Test all settings save to DB | High | ⬜ |
| Verify theme persists across restart | Medium | ⬜ |
| Test API endpoint configuration | Medium | ⬜ |

---

## 🌊 WAVE 2: Music Studio & Creation (Week 3-4)
**Focus:** Primary revenue-generating feature

### 2.1 Music Studio Pipeline
| Task | Priority | Status |
|------|----------|--------|
| Verify full songwriter pipeline (Lyricist → Suno) | High | 🟢 Working |
| Test "Copy to Suno" workflow | High | 🟢 Working |
| Polish pipeline visualization | Medium | ⬜ |
| Add generated content history | Medium | ⬜ |

### 2.2 Newsician Integration
| Task | Priority | Status |
|------|----------|--------|
| Test news → song headline flow | High | ⬜ |
| Verify Midwest Sentinel mode | Medium | ⬜ |
| Add content queue tracking | Medium | ⬜ |

### 2.3 Studios Hub Organization
| Task | Priority | Status |
|------|----------|--------|
| Commit pending studios page change | Low | ⬜ |
| Verify all "Live" studios link correctly | Medium | ⬜ |
| Add status indicators to disabled studios | Low | ⬜ |

---

## 🌊 WAVE 3: Labs Hub & Project Board (Week 5-6)
**Focus:** Self-building capability

### 3.1 Labs Data Management
| Task | Priority | Status |
|------|----------|--------|
| Test DB sync functionality | Medium | ⬜ |
| Verify Gantt/Kanban views work | Medium | 🟢 Working |
| Add project progress tracking | Medium | ⬜ |

### 3.2 Staff Meeting System
| Task | Priority | Status |
|------|----------|--------|
| Verify multi-agent debate | Medium | 🟢 Working |
| Add meeting transcript export | Low | ⬜ |
| Test persona switching | Low | ⬜ |

---

## 🌊 WAVE 4: Infrastructure Polish (Week 7-8)
**Focus:** Production readiness

### 4.1 Tauri Desktop
| Task | Priority | Status |
|------|----------|--------|
| Test fresh Windows install | High | ⬜ |
| Verify Bridge auto-spawn in production | High | ⬜ |
| Test system tray behavior | Medium | 🟢 Working |
| Add keyboard shortcuts (F5, Escape) | Low | ⬜ |

### 4.2 Build & Release
| Task | Priority | Status |
|------|----------|--------|
| Clean nested Nexus/Nexus folder | High | ⬜ |
| Align Prisma versions (webapp/bridge) | Low | ⬜ |
| Create v2.1.0 installer | Medium | ⬜ |

### 4.3 Documentation
| Task | Priority | Status |
|------|----------|--------|
| Update README with current state | Medium | ⬜ |
| Verify AI_PROTOCOL.md accuracy | Medium | ⬜ |
| Update HARDENING_STATUS.md | Medium | ⬜ |

---

## 🌊 WAVE 5: Operations Labs (Week 9-12)
**Focus:** Labs projects in Operations category

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Voice Command | 90% | ⬜ Complete remaining 10% |
| Automation Lab | 60% | ⬜ Polish workflow builder |
| Smart Home Control | 45% | ⬜ Design Home Assistant integration |
| AI Staff Meeting | 80% | ⬜ Polish and extend |
| Nexus Implementation Plan | 40% | ⬜ Continue roadmap execution |

---

## 🌊 WAVE 6: Intelligence Labs (Month 2)
**Focus:** Labs projects in Intelligence category

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Analytics Hub | 40% | ⬜ Build performance dashboards |
| Knowledge Base | 20% | ⬜ Implement doc search |
| Data Weave | 10% | ⬜ Design ETL pipeline |

---

## 🌊 WAVE 7: Capital & Revenue (Month 2-3)
**Focus:** Unfreeze profit features when ready

### Profit Side (Currently Deferred):
| Module | Dependencies | Action |
|--------|--------------|--------|
| Income Dashboard | Wave 1-4 complete | ⏸️ Unfreeze |
| Content Pipeline | Hardening complete | ⏸️ Unfreeze |
| Distribution Tracking | Music Studio stable | ⏸️ Unfreeze |
| Art Studio | Income Dashboard live | ⏸️ Plan scope |

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Passive Income | 60% | ⏸️ Resume after Wave 4 |
| Crypto Lab | 30% | ⏸️ Resume after Wave 4 |

---

## 🌊 WAVE 8: Creation Labs (Month 3)
**Focus:** Labs projects in Creation category

### From Labs Hub:
| Project | Current Progress | Action |
|---------|------------------|--------|
| Agent Forge | 50% | ⬜ Expand agent building UI |
| Code Generator | 75% | ⬜ Polish refactoring tools |
| Vision Lab | 5% | ⬜ Research scope |

---

## 🌊 WAVE 9+: Experimental & Future (Month 4+)
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

### Active Desktop Tools
```
/dashboard  - Widget home (Wave 1)
/chat       - LM Studio chat (Wave 1)
/agents     - Agent tiles (Wave 1)
/news       - RSS feeds (Wave 1)
/settings   - Configuration (Wave 1)
/terminal   - Command interface (Wave 1)
/music      - Songwriter pipeline (Wave 2)
```

### Labs Projects (by Category)
```
Operations:    5 projects (nexus-plan, meeting, voice, automation, smarthome)
Intelligence:  3 projects (analytics, knowledge, dataweave)
Creation:      4 projects (music-studio, forge, codegen, vision)
Capital:       2 projects (income, crypto)
Experimental:  3 projects (aura, pcoptimize, llmoptimize)
```

### Deferred (Profit Side)
```
/income/*      - Revenue tracking
/pipeline      - Content automation
/studios/art   - Art products
bridge/routes/distribution.js
```

---

## 🔄 Wave Completion Protocol

After each Wave:
1. [ ] Run full test on installed desktop app
2. [ ] Verify Bridge auto-spawn
3. [ ] Commit all changes with clear message
4. [ ] Update HARDENING_STATUS.md
5. [ ] Version bump if substantial (0.0.x patch, 0.x.0 feature)
6. [ ] Create release notes
7. [ ] Review next Wave priorities

---

## 🚫 Out of Scope (Until Explicit GO)

- New page routes not in Labs Hub
- Features requiring Planning Meeting approval
- Revenue features before Wave 7
- External API integrations not in current stack

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

---

*This is the execution plan. Wave 1 is GO.*
