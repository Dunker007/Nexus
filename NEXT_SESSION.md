# Next Session Context

**Last Updated:** May 14, 2026  
**Last Agent:** Hermes CLI (Lux)  
**Session:** Lux Orchestrator Phase O-1 — Core

---

## Current State

- **OS:** Windows 11 Pro (LuxRig) — fresh tech stack reinstall completed
- **Node:** v24.15.0
- **Git:** Phase O-1 changes uncommitted — see "Changes to Commit" below

### What Works
- `app/` (Hermes Workspace) — boots on `npm run dev` → localhost:3000
- `bridge/` — needs `npm install` then `node server.js` → localhost:3456
- `webapp/` — needs `npm install` then `npm run dev` → localhost:3000

### Key Clarity
- **`app/`** = [hermes-workspace](https://github.com/outsourc-e/hermes-workspace) — 3rd-party Hermes Agent dashboard (NOT Nexus)
- **`webapp/`** = Canonical Nexus frontend (Next.js 15)
- **`bridge/`** = Canonical Nexus backend (Express, port 3456)

---

## Completed This Session (Phase O-1: Orchestrator Core)

1. ✅ Added Lux Orchestrator phases (O-1 through O-6) to NEXUS_MASTER_PLAN.md
2. ✅ `bridge/services/tool-registry.js` — Real `get_weather` tool (Open-Meteo free API, no key), `get_system_time` tool, extensible registry
3. ✅ `bridge/services/agents-lux.js` — Refactored to use shared toolRegistry. Dynamic system prompt from registered tools. Multi-tool parsing + synthesis loop (up to 5 iterations)
4. ✅ `bridge/test-lux.js` — Test harness for direct tool calls + LM Studio compound query
5. ✅ Both tools verified: time (ISO + local) and weather (geocoding + Open-Meteo current + daily forecast)

---

## Next Steps (Phase O-2: Agent Delegation)

1. Add `delegate_to_agent` tool to shared tool-registry
2. Agent registry must expose list of callable agents + capabilities
3. Lux tool-calling loop handles delegation: call agent → receive result → synthesize
4. Test: Lux farms a sub-task to another agent, incorporates result

### Architecture Note
Some agents (Newsician, etc.) will be user-facing and chat directly — not everything goes through Lux. The agent registry needs to distinguish:
- **Internal agents** — only callable via Lux delegation
- **Direct agents** — user-facing, chat directly, have their own endpoints

This distinction doesn't need to block Phase O-2, but should be noted in the implementation.

---

## Changes to Commit

```
bridge/services/tool-registry.js  — Real weather + time tools
bridge/services/agents-lux.js     — Refactored to use shared registry
bridge/test-lux.js                — Updated test harness
NEXUS_MASTER_PLAN.md              — Added Lux Orchestrator phases (O-1 ✅)
```

---

## For Any AI Agent

Read these docs in order:
1. `NEXUS_MASTER_PLAN.md`
2. `SCOPE.md`
3. `AI_PROTOCOL.md`
4. This file

Then check the live task checklist in Antigravity if resuming a session.
