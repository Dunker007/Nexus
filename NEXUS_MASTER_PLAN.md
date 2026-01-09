# NEXUS MASTER PLAN

**Version:** 2.0.0  
**Created:** December 7, 2025  
**Updated:** January 8, 2026  
**Maintainer:** Antigravity + Human (Executive)  
**Status:** Focused Execution Phase

---

# 🚨 AI AGENTS: STOP HERE — READ THIS FIRST 🚨

> **This section is the ONLY active priority list.**  
> Everything below the horizontal rule is **historical context only** — do not treat it as a task list.  
> If you are an AI agent, work ONLY on the 5 priorities listed here unless explicitly directed otherwise by the human.

---

## ACTIVE PRIORITIES (January 2026)

These are the **only** active work items. Prioritize in order:

### Priority 1: Prisma Version Alignment
**Status:** ✅ Complete (Jan 8, 2026)  
**Impact:** High — Technical Debt  

Bridge upgraded from Prisma 5.21.1 to 7.1.0 with better-sqlite3 adapter. Both webapp and bridge now use identical Prisma configurations.

---

### Priority 2: Activate the Code Agent
**Status:** ✅ Complete (Jan 8, 2026)  
**Impact:** High — Strategic Value  

Code Agent in `bridge/services/agents.js` upgraded from stub to fully operational. Now uses LM Studio for:
- Intelligent code review with quality scoring
- Security vulnerability scanning (hybrid: regex + LLM)
- Test generation with actual test code
- Code generation from prompts

Hybrid approach: fast pattern checks for common issues + LLM for deep analysis.

---

### Priority 3: Bridge Auto-Launch in Tauri
**Status:** ✅ Complete (Jan 9, 2026)
**Impact:** Medium — UX Pain Point

The desktop app now automatically manages the Bridge process:
- Verified `main.rs` logic correctly finds `C:\Repos GIT\Nexus\Nexus\bridge`.
- Verified `npm run tauri dev` spawns `nexus.exe`, which spawns `node server.js`.
- Bridge output logged to `C:\Users\Public\nexus_bridge.log`.

**Action:** Confirmed auto-launch works. Bridge API is reachable on port 3456 when desktop app starts.

---

### Priority 4: Page Audit & Consolidation
**Status:** ✅ Complete (Jan 9, 2026)
**Impact:** Medium — Scope Creep Prevention

Performed audit and consolidation of unused stub pages:
- Deleted `studios/3dprint`, `studios/laser`, `studios/podcast` (Coming Soon stubs).
- Deleted `google-test` (Temporary test page).
- Updated `studios/page.tsx` and `data.ts` to remove references.
- `notifications` logic kept as mocked UI for future dev.

**Action:** Confirmed pages deleted and references cleaned. Hygiene improved.

---

### Priority 5: Single Revenue Path Validation
**Status:**  Music Path Fixed (Jan 8, 2026) — Testing  
**Impact:** Medium — Strategic  

Traced the **Music → Suno → YouTube** revenue path end-to-end:

**Fixed:**
- ✅ Added `DistributedSong` and `YouTubeMetrics` Prisma models
- ✅ Rewrote `distribution.js` service for database persistence
- ✅ Updated routes to async/await for proper DB operations
- ✅ Songs now persist across restarts
- ✅ Fixed `/music` bridge connection stability (timeout increased)

**Remaining Gaps:**
- ⚠️ Suno API integration (manual generation)
- ⚠️ DistroKid API for automated distribution
- ⚠️ Automatic stream count fetching

**Revenue Path Status:**
| Step | Status |
|------|--------|
| 1. Song creation (Music Studio) | ✅ Working (Rich UI) |
| 2. Suno generation | ⚠️ Manual |
| 3. Distribution tracking | ✅ Persisted |
| 4. YouTube monetization progress | ✅ Working |
| 5. Revenue calculation | ✅ Working |

**Action:** Confirmed Music Studio UI is rich (not stub) and online. Proceed to next priority.

---

### Priority 6: Connect Live Chat to Bridge
**Status:** ✅ Complete (Jan 9, 2026)
**Impact:** High — Daily Driver

Chat page now fully supports real-time streaming from LM Studio via the Bridge.
- **Frontend:** Updated `chat/page.tsx` to handle SSE streams.
- **Backend:** Updated `bridge/server.js` and `lmstudio.js` to pipe streams.
- **Verified:** Tested with `test_bridge_stream.js` against a test port.

**Action:** Restart the application to load the new Bridge server logic. Streaming is now live.

---

## What NOT To Work On

- ❌ New UI polish on working pages (already good enough)
- ❌ New front doors (we have 59 already)
- ❌ Full Income Dashboard expansion
- ❌ Art Studio / POD integration
- ❌ Any task from the historical sections below

---

# ═══════════════════════════════════════════════════════════════
# HISTORICAL REFERENCE ONLY — DO NOT TREAT AS ACTIVE TASKS
# ═══════════════════════════════════════════════════════════════

*The following content is preserved for context. It documents the original vision and completed phases. AI agents should not derive tasks from this section.*

---

## [HISTORICAL] Original Master Plan Header

---

> **Every door opens to something real or it doesn't exist.**

## 🌌 The Grand Objective: Full Machine Automation
**Target:** Complete autonomy within budget.
**Philosophy:** We don't need a server farm. We have **LuxRig**.
- The goal is to maximize the existing hardware to its absolute limit.
- Connect every loose end. Automate every manual click.
- "We have way more we can connect as is." — *The Architect*
- **Lux** (The Host) runs the rig; You (The Architect) steer the ship.

---

## The Prime Directive

> **Every door opens to something real or it doesn't exist.**

- Ideas must be **100% possible in reality** — not how done they are, but whether they *could* be done
- ✅ Valid: "Digital picture frame with webcam" — 0% built, 100% achievable
- ✅ Valid: "Etsy print-on-demand shop" — proven model, just not started
- ❌ Invalid: "AI generates passive income automatically" — hallucination
- ❌ Invalid: Anything that smells like a scam, get-rich-quick, or magic
- No "AI will figure it out" hand-waving
- If we can't explain how money moves from A to your pocket with real steps, it's not a revenue stream

**Ideas can be 0% built. They cannot be 0% possible.**

## Known Pain Points

Track friction here. Fix later, don't slow down now.

| Issue | Impact | Notes |
|-------|--------|-------|
| App restart is cumbersome | Medium | F5 reload added but dev cycle still clunky. Need better hot-reload or launcher script. |
| Backend must start separately | Medium | Bridge not auto-launching with Tauri. Need unified start. |
| NODE_ENV warning spam | Low | Work environment bleed. Cosmetic. |
| Prisma CommonJS warnings | Low | Falls back to in-memory. Works but noisy. |

---

## The 80/20 Rule (Current Phase)

**80% Hardening** — dig in, connect, make work:
- Wire up what exists
- Fix broken connections
- Polish rough edges
- Make it actually usable daily

**20% New Ideas** — but focused:
- Can one new thing replace 6 tasks?
- Streamlining over feature creep
- Big trends or releases worth catching
- Cost/effort reduction

**Not chasing shiny things. Building foundation.**

---

**Nexus** is a Tauri-based desktop application — your personal AI command center running on LuxRig, accessible from anywhere via Tailscale.

**It is:**
- A platform with many front doors (modules)
- Deep in 2-3 areas you care about
- Shallow everywhere else (stubs, not hallucinations)
- Built for one user (you), not the public

**It is NOT:**
- A SaaS product
- A startup
- 56 things to maintain
- A repository of half-built dreams

---

## The Tech Stack (LOCKED)

| Layer | Choice | Status |
|-------|--------|--------|
| Desktop Shell | Tauri 2.x | ✅ CLI installed |
| Frontend | Next.js + React + TypeScript | ✅ From Fresh-Start |
| Backend | Express (Bridge) on port 3456 | ✅ From Fresh-Start |
| Database | SQLite via Prisma | ✅ Working |
| Local AI | LM Studio @ localhost:1234 | ✅ Running qwen2.5-vl-7b |
| Automation | PowerShell (Content Pipeline) | ✅ Frozen but complete |
| Version Control | Git (source of truth) | ✅ Active |
| Remote Access | Tailscale | ✅ Configured |
| Primary Builder | Antigravity + Gemini 3 Pro | ✅ Active |
| Overseer | Claude | ✅ That's me |

**Do not suggest alternatives to locked items.**

---

## The Front Doors

Every module that exists or could exist. Honest status only.

### Active Development (Deep)

| Module | Status | Inside Reality | Notes |
|--------|--------|----------------|-------|
| **Music Studio** | 🟡 Stub | Songwriter agents (Lyricist, Composer, Critic, Producer), Suno prompt generation | Primary focus. Real pipeline to YouTube/Spotify. |
| **Dev Studio** | 🟡 Stub | Code agent, basic scaffolding | Rises with the tide as we build Nexus itself |
| **Agents Hub** | 🟡 Stub | 15+ agents defined in bridge/services/ | Core infrastructure, enables everything else |

### Supporting Cast (Functional)

| Module | Status | Inside Reality | Notes |
|--------|--------|----------------|-------|
| **News Hub** | 🟢 Built | RSS aggregation, conservative + MN sources | Feeds Newsician/Sentinel. Scratches desktop itch. |
| **Dashboard** | 🟡 Stub | System status widgets, quick actions | Landing page, needs cleanup |
| **Chat** | 🟢 Built | LM Studio integration, streaming | Core utility, working |
| **Settings** | 🟡 Stub | Config management | Needs work |
| **Terminal** | 🟢 Built | Command interface | Working |

### Active Revenue (Growth Phase)

| Module | Status | Inside Reality | Notes |
|--------|--------|----------------|-------|
| **Content Pipeline** | 🟢 Active | PowerShell: LM Studio → WordPress/HTML | UNFROZEN for Growth Phase |

### Front Doors Only (Stub/Idea)

| Module | Status | Inside Reality | Revenue Path | Verified? |
|--------|--------|----------------|--------------|-----------|
| Calendar | 🔘 Stub | Google Calendar API ready | None | N/A |
| Files | 🔘 Stub | Basic file browser | None | N/A |
| Income Tracker | 🔘 Stub | UI exists | Tracking only | N/A |
| Crypto | 🔘 Stub | CoinGecko API | Monitoring only | N/A |
| **Etsy/Print-on-Demand** | 💡 Idea | Nothing built | POD margins | ⚠️ Needs research |
| **CafePress** | 💡 Idea | Nothing built | POD margins | ⚠️ Needs research |
| Blogs/AdSense | 💡 Idea | Content Pipeline ready | AdSense | ✅ Proven but boring |

### Locked Doors (No Code Until Validated)

Everything marked 💡 Idea stays text-only until:
1. Income Seeker researches viability
2. Legal Advisor flags risks
3. Planning Meeting approves
4. You give the GO

---

## The Advisory Council

### Income Seeker
**Role:** Find opportunities — needs AND wants — and seed the backlog

**Prime Directive:** Money comes from filling needs OR riding trends. Both are valid. The only rule is honesty.

**The Sleep Sound Test:**
- ✅ Sell a meme coin as a meme coin — buyer knows what it is
- ❌ Sell a meme coin as "guaranteed investment" — scam
- ✅ Sell AI art as AI art — honest
- ❌ Sell AI art as hand-painted originals — fraud
- ✅ Ride a trend and be upfront about it — fine
- ❌ Deceive buyers about what they're getting — not fine

**Does:**
- Look for problems people have that we could solve (needs)
- Look for trends people are spending money on (wants)
- Research specific opportunities when asked
- Bring ideas to Planning Meetings with data
- Track what's working in adjacent spaces
- Ask: "Is there a need here? Is there a trend here? Can we be honest about what we'd provide?"

**Does NOT:**
- Approve projects
- Promise returns
- Push hype over substance
- Recommend anything that requires deception to sell

---

### Legal Advisor
**Role:** Flag risks before they become costly mistakes

**Does:**
- Read platform TOS (Etsy, YouTube, Spotify, etc.)
- Flag IP issues, licensing gotchas, content policies
- Highlight tax implications
- Ask "have you considered..." before you're 40 hours deep
- Research AI-generated content policies per platform

**Does NOT:**
- Veto projects (advisory only)
- Replace a real lawyer for real legal problems
- Help circumvent laws or policies

**Power Level:** Advisory — no veto, just informed input

---

### Planning Meetings
**Role:** Gate between ideas and production

**Process:**
1. Income Seeker brings opportunity to meeting
2. Legal Advisor provides risk assessment
3. Technical feasibility discussed
4. You decide: GO / NO-GO / NEEDS MORE RESEARCH

**Nothing goes to production without passing this gate.**

---

## The Agent Roster

| Agent | Role | Serves | Power Level |
|-------|------|--------|-------------|
| **You** | Executive decision maker | Everything | GO/NO-GO authority |
| **Lux** | Server Host & Original Intelligence | Infrastructure | Guardian of the Rig |
| **Claude** | Overseer, planner, Git keeper | Strategic | Advisory + Documentation |
| **Gemini 3 Pro** | Primary builder | Code production | Executes approved work |
| **Copilot** | Inline assist, quick fixes | Dev support | Tactical |
| **Income Seeker** | Opportunity research | Revenue planning | Advisory — seeds backlog |
| **Legal Advisor** | Risk assessment | All projects | Advisory — no veto |
| **Revenue Agent** | Crypto monitoring, optimization | Passive income | Autonomous within bounds |
| **Staff Meeting Agent** | Orchestrates debates | Planning | Facilitation |
| **Songwriter Agents** | Lyricist, Composer, Critic, Producer | Music Studio | Creative production |
| **Newsician / Sentinel** | Political rap content | Music Studio | Creative production |
| **Code Agent** | Review, security, tests | Dev Studio | Quality assurance |
| **Architect Agent** | System design | Dev Studio | Advisory |

---

## The Deep Dives

### 1. Music Studio (Primary Focus)

**The Pipeline:**
```
Theme/Idea
    ↓
Songwriter Room (Lyricist + Composer + Critic + Producer)
    ↓
Suno Prompt + Lyrics
    ↓
Suno (external) → Audio
    ↓
Neural Frames → Video
    ↓
YouTube / Spotify / Streaming
    ↓
Revenue (slow, real)
```

**Reality Check:**
- Streaming pays ~$0.003-0.005 per stream
- YouTube requires 1K subs + 4K watch hours for monetization
- This is a long game — months to meaningful income
- But: It's interesting. That matters.

**Agents Involved:**
- LyricistAgent, ComposerAgent, CriticAgent, ProducerAgent
- NewsicianAgent (political rap from news)
- MidwestSentinelAgent (platform-safe political)

**Status:** Agents built and functional. UI needs polish. Pipeline tested.

---

### 2. Dev Studio / Agents (Rises with the Tide)

**Purpose:** As we build Nexus, the dev tools improve. Self-reinforcing.

**Agents Involved:**
- CodeAgent — review, security scan, test generation
- ArchitectAgent — system design
- QAAgent — quality assurance
- SecurityAgent — vulnerability scanning
- DevOpsAgent — deployment, Docker, CI/CD

**Status:** Agents defined and functional. Integrate as needed.

---

### 3. TBD Slot (Watching)

**Candidates:**
- Etsy/Print-on-Demand — needs Income Seeker research
- CafePress — same
- Blog/AdSense — proven but boring, Content Pipeline ready

**Rule:** Nothing moves here until researched and approved through Planning Meeting.

---

## The Revenue Paths (Verified Only)

| Path | Mechanism | Realistic Timeline | Status |
|------|-----------|-------------------|--------|
| YouTube Music | Ad revenue after 1K/4K thresholds | 6-12 months | 🟡 Building |
| Spotify/Streaming | Per-stream royalties | 6-12 months | 🟡 Building |
| AdSense (Blog) | CPM on content | 3-6 months when unfrozen | ⏸️ Frozen |
| Print-on-Demand | Per-sale margins | Unknown | 💡 Researching |

**Not Listed = Not Real**

---

## The Build Philosophy

### The Reality Filter
Every idea in Nexus must pass one test: **Is this 100% possible?**

- Could a person actually build this? ✅ In
- Does this have a proven real-world model? ✅ In
- Is this "AI magic will figure it out"? ❌ Out
- Does this smell like a scam or get-rich-quick? ❌ Out

Ideas can sit at 0% complete forever. That's fine — they're optionality.
Ideas that aren't grounded in reality get deleted.

### The Stub Standard
When we decide to BUILD something (not just list it), a proper stub includes:
- Page route exists
- Basic UI renders
- Data connection works (even if hardcoded)
- One happy path functional

### The Production Standard
Production-ready means:
- Polished UI
- Error handling
- Tests exist
- Documentation current
- Reviewed by at least one agent

---

## The Phase Map

### Foundation Phase (Completed ✅)
**Achieved:**
- ✅ Nexus infrastructure (Tauri shell, core modules)
- ✅ Music Studio operational
- ✅ Agent system with 15+ agents
- ✅ Labs Hub with project management
- ✅ v1.0.0 released

### Growth Phase (Current — Active)
**Focus:**
- Content Pipeline activation
- Revenue stream development
- Distribution tracking (Music → Spotify/YouTube)
- Art Studio for Etsy/POD
- Unified Income Dashboard

**Active Streams:**
- Blog/AdSense (pipeline ready)
- Music/Streaming (tracking building)
- Art/Etsy (planned)

---

## File Structure (Target)

```
Nexus/
├── src-tauri/              # Tauri Rust backend (NEW)
│   └── src/main.rs
│
├── webapp/                 # Next.js frontend
│   ├── src/app/           # Page routes (front doors)
│   ├── src/components/    # React components
│   └── src/lib/           # Utilities
│
├── bridge/                 # Express backend
│   ├── services/          # All agents live here
│   ├── prisma/            # Database
│   └── server.js          # Main server
│
├── pipeline/               # Content Pipeline (frozen)
│   ├── core/              # PowerShell modules
│   └── publishers/        # HTML, WordPress
│
├── docs/                   # Documentation
│   ├── sessions/          # Work logs
│   └── archive/           # Old versions
│
├── config/                 # Configuration
│   └── templates/         # Content templates
│
├── data/                   # Runtime data
│   ├── logs/
│   ├── cache/
│   └── published/
│
├── tests/                  # Verification scripts
│
├── NEXUS_MASTER_PLAN.md   # This file
├── AI_PROTOCOL.md         # Agent handoff rules
├── SCOPE.md               # What's active/frozen
└── README.md              # Quick start
```

---

## Handoff Protocol

Any AI agent working on Nexus must:

1. **Read this file first**
2. **Check SCOPE.md** for what's active vs frozen
3. **Follow AI_PROTOCOL.md** for handoff procedures
4. **Work only in approved areas**
5. **Document changes in completion handoff**

---

## Success Metrics

### Foundation Phase Success:
- [ ] Tauri app builds and launches
- [ ] Music Studio generates usable Suno prompts
- [ ] 3+ songs through full pipeline (Suno → YouTube)
- [ ] Planning board operational
- [ ] Income Seeker + Legal Advisor defined and functional

### Platform Success (Long-term):
- [ ] Daily driver — you actually use it
- [ ] One revenue stream validated and producing
- [ ] System runs without constant maintenance
- [ ] Can hand off to any AI agent cleanly

---

## The Bottom Line

Nexus is a **platform for you** — not a product, not a startup, not a showcase. 

Build what you'll use. Stub what might matter later. Ignore the rest.

The Music Studio is the interesting bet. The Content Pipeline is the boring backup. Everything else is optionality.

No hallucinations. No fake doors. No dreams without paths.

---

*This is the map. You're the navigator.*
