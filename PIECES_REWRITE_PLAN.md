# PIECES REWRITE PLAN

**Version:** 1.0.0
**Status:** Active Discovery & Integration
**Project:** Nexus-PiecesOS-Rewrite
**Lead AI:** Lux

---

## 🎯 The Prime Directive
Fully integrate **Pieces OS** as the core memory, context, and knowledge engine for the **Nexus OS architecture**. 
Rewrite or augment existing Nexus components to rely on the Pieces Long-Term Memory (LTM), workstream events, and semantic search rather than isolated local databases or scattered files.

---

## 🌊 PHASE 1: Wiring & Verification (Current)
- [x] Connect Lux (Antigravity IDE) directly to Pieces OS via MCP over SSE.
- [x] Verify LTM capabilities (Vision, Audio, Workstream logging) are properly connected and querying correctly.
- [ ] Audit existing Nexus backend services (`localhost:3001` bridge) to map where Pieces can replace legacy local SQLite or JSON storage.
- [ ] Establish standard tag schema for DLX assets (e.g., `#Newsician`, `#QPL`, `#Labs`).

## 🌊 PHASE 2: Nexus Architecture Rewrite
- [ ] **Contextual Agent Memory:** Update the AI Staff Meeting and Agent Hub modules to inject Pieces LTM directly into contextual prompts.
- [ ] **Asset Management:** Rewrite local snippet and file handling to save directly as Pieces assets with robust metadata.
- [ ] **The "Lux" Brain Upgrade:** Enable Lux to automatically pull associated templates, project scopes, and research via Pieces semantic search instead of manual Drive searching.

## 🌊 PHASE 3: Music Pipeline Integration
- [ ] **Lyric Dumps:** Auto-save QPL and Newsician drafted lyrics (`N_Song_v1.md`) into Pieces OS natively.
- [ ] **Automation Handoffs:** Use Pieces Workstream events to catch when manuals handoffs to Suno or Google Vids occur, making the pipeline easier to track.
- [ ] **Metadata Tagging:** Keep track of Suno WAVs, cover arts, and VidIQ SEO metadata as related Pieces artifacts.

## 🌊 PHASE 4: Local-First Hardening
- [ ] Ensure the entire Pieces connection works reliably over the `100.x.x.x` Tailscale IP mesh without breaking existing Nexus integrations.
- [ ] Clean up redundant code and legacy "cloud-first" logic from the old Vercel setup.

---

## 📝 Change Log
| Date | Version | Changes |
|------|---------|---------|
| 2026-04-01 | 1.0.0 | Initial rewrite roadmap established by Lux following successful Pieces MCP integration. |
