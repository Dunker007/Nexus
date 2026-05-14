# Next Session Context

**Last Updated:** May 14, 2026  
**Last Agent:** Antigravity  
**Session:** Post-reinstall hardening

---

## Current State

- **OS:** Windows 11 Pro (LuxRig) — fresh tech stack reinstall completed
- **Node:** v24.15.0
- **Git:** Clean, all changes on `main`

### What Works
- `app/` (Hermes Workspace) — boots on `npm run dev` → localhost:3000
- `bridge/` — needs `npm install` then `node server.js` → localhost:3456
- `webapp/` — needs `npm install` then `npm run dev` → localhost:3000

### Key Clarity
- **`app/`** = [hermes-workspace](https://github.com/outsourc-e/hermes-workspace) — 3rd-party Hermes Agent dashboard (NOT Nexus)
- **`webapp/`** = Canonical Nexus frontend (Next.js 15)
- **`bridge/`** = Canonical Nexus backend (Express, port 3456)

---

## Completed This Session

1. ✅ Full repo health audit
2. ✅ Purged 49 tracked build artifacts (3,083 lines of noise)
3. ✅ Updated `.gitignore` to prevent future artifact commits
4. ✅ Fixed stale repo paths in `AI_PROTOCOL.md`
5. ✅ Created dev `.env` for Hermes Workspace
6. ✅ Identified `app/` as Hermes Workspace (resolved "dual frontend" confusion)
7. ✅ Updated all governance docs (SCOPE, AI_PROTOCOL, MASTER_PLAN, README, NEXT_SESSION)

---

## Next Steps

1. **Modularize `bridge/server.js`** — 1,065-line monolith → extract route groups
2. **Audit `webapp/` routes** — 60 dirs, only 7 documented as working
3. **Standardize Prisma** — webapp (7.1) vs bridge (check version)
4. **Install webapp + bridge deps** — `npm install` in both after reinstall
5. **Pieces OS integration audit** — verify LTM hooks in `app/`

---

## For Any AI Agent

Read these docs in order:
1. `NEXUS_MASTER_PLAN.md`
2. `SCOPE.md`
3. `AI_PROTOCOL.md`
4. This file

Then check the live task checklist in Antigravity if resuming a session.
