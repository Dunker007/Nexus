# Pieces Integration Mapping Audit

This document outlines the mapping of legacy Nexus backend services (currently using local SQLite via Prisma or JSON structures) to Pieces OS native capabilities.

## 1. Memory and Conversations
- **Legacy Source:** `chat_history` table in SQLite.
- **Pieces Target:** `mcp_pieces_conversations` and `mcp_pieces_conversation_messages`.
- **Action:** Rewrite the `/api/chat` and `/api/memory` endpoints to save and retrieve back-and-forth dialogue as Pieces conversations instead of Prisma records.

## 2. Songs, Lyrics, and Assets
- **Legacy Source:** `songs` table in SQLite, plus local Markdown files (e.g., `N_SongName_v1.md`).
- **Pieces Target:** Pieces Context / Assets and Tags.
- **Action:** 
  - Save finalized lyrics and drafts as Pieces materials/assets.
  - Apply standard Pieces Tags (e.g., `#Newsician`, `#QPL`, `#Draft`, `#Final`).
  - Modify `/api/songs` to query Pieces using semantic search and tags rather than SQL queries.

## 3. Pipeline Tracking & Tasks
- **Legacy Source:** `pipeline_tracks` and `tasks` tables in SQLite.
- **Pieces Target:** `Pieces Workstream Summaries` and `Tags` or custom structured formats within Pieces.
- **Action:** Use local Workstream Events and Summaries to capture when a pipeline task (e.g., "handoff to Suno") occurs, replacing or augmenting explicit state transitions in SQLite. Use tags to group related tasks.

## 4. Agents
- **Legacy Source:** `agents` table in SQLite.
- **Pieces Target:** Pieces Models and Person records, or could remain partially in SQLite if it acts as Nexus config.
- **Action:** Map Nexus agents (Lux, Newsician, QPL) to local Pieces representations if applicable, or just associate their generated artifacts with specific Pieces Tags identifying the agent.

## 5. News Items
- **Legacy Source:** `news_items` table in SQLite.
- **Pieces Target:** `Pieces Websites` / Snippets.
- **Action:** When news is scraped or captured, store the URL and summary as a Pieces Website and Annotation/Asset respectively. Allow AI agents to semantically search (`mcp_pieces_materials_vector_search`) news items directly from Pieces LTM.

## 6. Portfolio / Finance (Labs)
- **Legacy Source:** `portfolio_accounts`, `portfolio_positions`, `portfolio_sync` tables in SQLite.
- **Pieces Target:** Likely stays in SQLite for purely numeric, transactional dashboard data, OR we store daily snapshots as Pieces Workstream Summaries / context snippets to inform agents over time without retaining structured relational tables if deemed unnecessary.

## Conclusion
Most unstructured or text-heavy memory (chat, lyrics, news, general tasks) is perfectly suited to move entirely into Pieces OS. Numeric and strict transactional data (finance portfolio) may remain minimally in SQLite depending on strict schema needs, but can be augmented with Pieces.
