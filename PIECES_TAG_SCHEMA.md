# Pieces OS - DLX Standard Tag Schema

This document defines the standard taxonomy/schema for tagging assets, conversations, and workstream events inside **Pieces OS** for the DLX Studios ecosystem. By enforcing this schema, we ensure that AI agents (Lux, Newsician, QPL) can accurately filter and retrieve relevant context from the Long-Term Memory (LTM).

## 1. Entities & Agents
Used to associate materials with specific personas or branches of DLX Studios.
- `#Newsician` — For lyrics, research, beats, or conversations involving the edgy/political artist.
- `#QPL` (Quiet Part Loud) — For mellow/political artist tracks and conversations.
- `#Lux` — For management, planning, and system automation tasks handled by Lux.
- `#Mouse` — For Mouse's Idea Space context.

## 2. Projects & Domains
Used to identify which of the broader DLX initiatives the material belongs to.
- `#Music` — Any music production tasks, tracks, stems, or videos.
- `#Labs` — Tech development, Nexus OS, automation experiments.
- `#Finance` (or `#SmartFolio`) — Crypto/Alts/Stocks, dashboard data logic.
- `#MNFraud` — Project Crosscheck / MN Fraud Watch tasks.

## 3. Document / Asset Types
Used to quickly filter by the *kind* of material being stored.
- `#Lyrics` — Markdown files or text strings containing song lyrics.
- `#Draft` — A work-in-progress asset (e.g., `_v1`).
- `#Final` — A locked, completed asset.
- `#CoverArt` — Image assets generated for tracks.
- `#Stem` / `#Audio` — References to audio files from Suno or masters.
- `#Video` — Video artifacts or Google Vids storyboard files.
- `#SystemPrompt` — Core instructions or configuration for an agent.

## 4. Workstream & Status
Used to track where something currently sits in the pipeline.
- `#Backlog`
- `#InProgress`
- `#ReadyForSuno`
- `#ReadyForVideo`
- `#ReadyForRelease`
- `#Published`

## Best Practices
- **Combine Tags:** Combine multiple tags for granular semantic search. E.g., tagging a final Newsician lyric document with `#Newsician #Lyrics #Final #Music`.
- **Consistency:** Always use the exact casing specified above when tagging via the Pieces API.
- **Auto-tagging:** When Nexus processes a file (e.g., `N_SongName_v1.md`), it should automatically extract `N` to map to `#Newsician`, and map `v1` to `#Draft`.
