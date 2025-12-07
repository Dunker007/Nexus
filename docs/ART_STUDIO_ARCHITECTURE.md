# DLX Art Studio Architecture

## Overview
The DLX Art Studio is a local-first, AI-powered image generation pipeline designed to integrate with the larger OS. It prioritizes **Project-based organization**, **Local Storage**, and **Iterative Refinement**.

## Core Philosophy
1.  **Projects, not Folders**: All assets belong to a centralized Project entity, allowing cross-studio access (e.g., using an Art asset in the Video Studio).
2.  **Local Mastery**: Images are stored locally on the filesystem (`storage/`), with metadata in the SQLite database.
3.  **Iterative Refinement**: The "Edit" loop is as important as the "Generate" loop.

## Data Model (Prisma Schema Proposal)

```prisma
model Project {
  id          String     @id @default(uuid())
  name        String
  description String?
  type        String     // 'unified', 'art', 'dev'
  status      String     // 'active', 'archived'
  assets      ArtAsset[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model ArtAsset {
  id          String   @id @default(uuid())
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
  
  // File Info
  filePath    String   // Relative to storage root (e.g., 'projects/neon-city/img_001.png')
  fileType    String   // 'png', 'jpg'
  
  // Generation Params
  prompt      String
  negative    String?
  model       String   // Checkpoint name
  seed        BigInt?
  steps       Int?
  cfgScale    Float?
  
  // Workflow
  parentId    String?  // For img2img/refinement lineage
  isFavorite  Boolean  @default(false)
  
  createdAt   DateTime @default(now())
}
```

## System Components

### 1. Image Generation Service (`services/image-gen.js`)
*   **Backend**: `luxrig-bridge`.
*   **Driver**: Wraps **Automatic1111 Stable Diffusion WebUI API** (standard port `7860`).
*   **Fallback**: HuggingFace Inference API (if local GPU is busy/unavailable).

### 2. Storage Strategy
*   **Root**: `C:/DeepLake/Storage` (Configurable).
*   **Structure**: `/Storage/Projects/{ProjectName}/Assets/{Type}/`.

### 3. Frontend Workflow
*   **Project Context**: Top-bar selector to lock the "Active Project".
*   **Generation**:
    1.  User inputs prompt.
    2.  Frontend sends req to `POST /api/art/generate`.
    3.  Backend calls SD API.
    4.  Backend saves image to Project Folder.
    5.  Backend creates DB record.
    6.  Backend returns URL (`/static/projects/...`).
*   **Refinement**:
    1.  User clicks "Edit/Refine" on an image.
    2.  Image loaded into **Canvas Mode** (Inpainting).
    3.  User masks area or changes prompt.
    4.  New generation linked to parent via `parentId`.

## Implementation roadmap
1.  **Phase 1 (UI)**: Build Project Selector and Mock Generation (Done).
2.  **Phase 2 (DB)**: Update Prisma Schema and run migrations.
3.  **Phase 3 (Service)**: Connect to local Stable Diffusion API.
4.  **Phase 4 (Refine)**: Build Canvas UI for inpainting.
