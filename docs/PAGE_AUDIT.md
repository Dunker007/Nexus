# Nexus Page Audit (Generated Jan 8, 2026)

## Summary
- **Total Pages:** 73
- **Large (400+ lines):** 9 - Core functionality, keep
- **Medium (200-400 lines):** 41 - Review for consolidation
- **Small (< 200 lines):** 23 - Likely stubs, candidates for removal

## Recommended Actions

### KEEP (Core Functionality)
These are essential, actively used pages:

| Page | Lines | Status |
|------|-------|--------|
| `/dashboard` | 735 | ✅ Keep - Main hub |
| `/news` | 849 | ✅ Keep - Intel feed |
| `/music` | 707 | ✅ Keep - Music pipeline |
| `/chat` | 659 | ✅ Keep - AI conversations |
| `/settings` | 553 | ✅ Keep - Configuration |
| `/pipeline` | 539 | ✅ Keep - Growth pipeline |
| `/agents` | 479 | ✅ Keep - Agent registry |
| `/income/art` | 514 | ✅ Keep - Art income tracking |
| `/studios/dev` | 402 | ✅ Keep - Dev Studio |

### REVIEW (Medium Priority)
Potentially useful but may overlap or be underutilized:

| Page | Lines | Notes |
|------|-------|-------|
| `/labs` | 501 | Experimental features |
| `/voice` | 506 | Voice interface |
| `/deals` | 455 | Deal tracking |
| `/meeting` | 435 | AI meetings |
| `/learn` | 429 | Learning resources |
| `/prompts` | 419 | Prompt library |
| `/income/music` | 406 | Music income |
| `/docs` | 393 | Documentation |
| `/studios/video` | 386 | Video studio |
| `/github` | 375 | GitHub integration |
| `/models` | 371 | LLM models |
| `/playground` | 361 | Testing area |
| `/trading` | 342 | Trading tools |

### CANDIDATE FOR REMOVAL (Stubs/Unused)
Small pages that may be placeholders:

| Page | Lines | Recommendation |
|------|-------|----------------|
| `/studios/podcast` | 60 | Stub - consolidate into `/studios` |
| `/income` | 62 | Landing page only - OK |
| `/admin/governance` | 73 | May be unnecessary |
| `/studios/laser` | 81 | Stub - consolidate into `/studios` |
| `/studios/3dprint` | 81 | Stub - consolidate into `/studios` |
| `/notifications` | 145 | Low usage |
| `/shortcuts` | 163 | Could be modal instead |
| `/finance` | 190 | Overlaps with `/budget`? |
| `/scratchpad` | 190 | Low utility |
| `/apps` | 193 | May be redundant |
| `/income/tracker` | 200 | Consolidate with `/income` |
| `/download` | 206 | One-time use page |
| `/media` | 217 | Unclear purpose |
| `/community` | 224 | Low priority |

### AUTH PAGES (Keep - Required)
| Page | Lines | Status |
|------|-------|--------|
| `/auth/github/callback` | 80 | ✅ Keep - OAuth |
| `/auth/google/callback` | 83 | ✅ Keep - OAuth |

## Consolidation Recommendations

1. **Studios Consolidation**
   - `/studios/laser`, `/studios/3dprint`, `/studios/podcast` are stubs
   - Consider: Single `/studios` page with tabs for all sub-studios

2. **Income Consolidation**  
   - `/income`, `/income/tracker`, `/income/ideas`, `/income/opportunities`
   - Consider: Single `/income` page with tab navigation

3. **Finance Overlap**
   - `/finance`, `/budget`, `/crypto`, `/trading`
   - Consider: Single `/finance` hub with sub-sections

4. **Utility Pages**
   - `/shortcuts`, `/changelog`, `/notifications` 
   - Consider: Modals instead of full pages

## Next Steps
1. [ ] Verify each "stub" page is actually unused
2. [ ] Get stakeholder approval before removal
3. [ ] Create redirects for any removed pages
4. [ ] Update navigation to reflect consolidation
