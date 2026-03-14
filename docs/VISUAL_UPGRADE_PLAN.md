# NEXUS FRONTEND VISUAL UPGRADE — MASTER PLAN

**Created:** 2026-03-13  
**Author:** Claude (Overseer)  
**Status:** Phase 1 Complete ✅

## Context

The Nexus project has two frontends:

- **`webapp/`** (Next.js) — The OLD frontend with production-grade cyberpunk visuals (1500+ lines of CSS, 5 themes, light mode, vibe modes, premium glassmorphism, 10+ animations, command palette, keyboard shortcuts). This is the visual benchmark.
- **`app/`** (Vite/Express) — The NEW frontend with a better backend but only ~105 lines of basic CSS, no theme system, no page wrappers, no premium effects. This is what we're upgrading.

**Goal:** Bring `app/`'s frontend visuals up to `webapp/`'s standard. 10 phases, each independently deployable, each completable in a single session.

---

## PHASE 1: Design System Foundation ✅ COMPLETE
**Objective:** Replace the app's 105-line CSS with the full design token system and premium effects library.

### Created
| File | Purpose |
|------|---------|
| `app/src/styles/design-tokens.css` | CSS custom properties: `--bg-void`, `--cyan`, `--glass-bg`, `--glow-cyan`, etc. + light mode + vibe mode overrides |
| `app/src/styles/premium-ui.css` | Port of webapp's premium-ui.css (521 lines): `.glass-premium`, `.btn-premium`, `.card-premium`, `.badge-*`, `.input-premium`, `.progress-bar`, `.tooltip`, `.particle`, `.divider-gradient`, `.shadow-*`, 6 keyframes |

### Modified
| File | Changes |
|------|---------|
| `app/src/index.css` | Import new CSS files, migrate `.glass-card`/`.glass-panel` to use CSS variables, add remaining animations (grid-move, shimmer, infinite-scroll), add utility classes (`.text-glow-cyan`, `.btn-primary`, `.btn-outline`, `.status-dot`, `.skeleton`, `.bg-grid`, `.container-main`), port React Grid Layout CSS |
| `app/src/App.css` | Deleted (unused Vite boilerplate) |

### Source files ported from
- `webapp/src/app/globals.css` (lines 8–457)
- `webapp/src/app/premium-ui.css` (all 521 lines)

### Verification ✅
No visual regressions. DevTools shows all CSS variables on `:root`. Adding `.glass-premium` to any element produces the premium effect.

---

## PHASE 2: Theme System & Context Providers
**Objective:** Create ThemeProvider, VibeProvider, and 5-theme system (Cyberpunk, Midnight, Hacker, Sunset, Minimal).

### Create
| File | Purpose |
|------|---------|
| `app/src/lib/themes.ts` | Port from `webapp/src/lib/themes.ts`: 5 theme definitions, `applyTheme()`, `saveTheme()`, `loadSavedTheme()` |
| `app/src/contexts/ThemeContext.tsx` | ThemeProvider: dark/light/system toggle, fontSize state, `useTheme()` hook, localStorage persistence |
| `app/src/contexts/VibeContext.tsx` | VibeProvider: vibe modes (normal/high-load/crisis/focus), theme integration, `useVibe()` hook, `data-vibe` attribute on `<body>` |

### Modify
| File | Changes |
|------|---------|
| `app/src/App.tsx` | Wrap provider stack with `<ThemeProvider>` and `<VibeProvider>` |

### Source files to port from
- `webapp/src/lib/themes.ts`
- `webapp/src/components/ThemeProvider.tsx` (adapt from Next.js to react-router)
- `webapp/src/components/VibeContext.tsx`

### Verify
App boots with Cyberpunk theme. Theme persists in localStorage. CSS variables update when theme changes.

---

## PHASE 3: Page Wrapper & Atmospheric Backgrounds
**Objective:** Create PageLayout, PageBackground, and HeroBackground components — every page gets the atmospheric feel.

### Create
| File | Purpose |
|------|---------|
| `app/src/components/PageBackground.tsx` | Port from webapp: 3-layer floodlight effect (conic-gradient beam + radial ambient + source glow), animated grid overlay, 10 color options |
| `app/src/components/PageLayout.tsx` | Port from webapp: page wrapper with floating orbs, PageHeader (glowing icon + gradient accent), StatPill (8 color variants), ConnectionStatus, LiveCounter |
| `app/src/components/HeroBackground.tsx` | Port from webapp: 3 rotating conic-gradient spotlights, ambient glow orbs, floating particles, vignette effects. Use `motion/react` instead of `framer-motion` |

### Modify
| File | Changes |
|------|---------|
| `app/src/components/Layout.tsx` | Change `bg-[#07070a]` to `bg-[var(--bg-void)]`, add `.bg-grid` class |

### Source files to port from
- `webapp/src/components/PageBackground.tsx`
- `webapp/src/components/PageLayout.tsx`
- `webapp/src/components/HeroBackground.tsx`

### Verify
`<PageLayout color="purple">` produces floodlight + floating orbs. `<PageHeader>` renders consistently with glowing icon.

---

## PHASE 4: Layout & Navigation Polish
**Objective:** Upgrade the nav bar — add keyboard shortcuts, command palette, theme toggle, palette switcher.

### Create
| File | Purpose |
|------|---------|
| `app/src/components/ThemeToggle.tsx` | Animated Moon/Sun swap using `motion/react` + `useTheme()` |
| `app/src/components/NavItem.tsx` | Polished nav item with layoutId animation, shortcut tooltip. Adapt from Next.js Link to react-router NavLink |
| `app/src/components/KeyboardShortcuts.tsx` | G+key navigation map, `?` key opens shortcuts modal. Adapt `useRouter()` to `useNavigate()` |
| `app/src/components/CommandPalette.tsx` | Ctrl+K command palette with search, arrow key nav, recent commands, AI mode detection. Adapt to react-router |
| `app/src/components/ui/Backdrop.tsx` | Modal backdrop overlay with blur |
| `app/src/components/ui/ShortcutModal.tsx` | Grouped shortcuts display modal |
| `app/src/components/ui/FocusTrap.tsx` | Keyboard focus trap for modals |

### Modify
| File | Changes |
|------|---------|
| `app/src/components/Layout.tsx` | Replace inline NavLinks with NavItem, add shortcut to nav items, replace Moon button with ThemeToggle, wire Palette button to `useVibe().setTheme()`, wire Quick Access to CommandPalette, add KeyboardShortcuts + CommandPalette as global overlays |

### Source files to port from
- `webapp/src/components/Navigation.tsx`
- `webapp/src/components/KeyboardShortcuts.tsx`
- `webapp/src/components/CommandPalette.tsx`

### Verify
`?` opens shortcuts modal. `Ctrl+K` opens command palette. `G+D` navigates to Dashboard. Moon button toggles dark/light. Palette button cycles themes.

---

## PHASE 5: Loading States & Page Transitions
**Objective:** Add skeleton loading components and animated page transitions.

### Create
| File | Purpose |
|------|---------|
| `app/src/components/Skeletons.tsx` | Skeleton (text/circular/rectangular), WidgetSkeleton, CardSkeleton, ListItemSkeleton, StatsSkeleton, LoadingSpinner, PageLoading |
| `app/src/components/PageTransition.tsx` | AnimatePresence `mode="wait"` wrapper with fade + y-translate. Uses `useLocation()` from react-router |

### Modify
| File | Changes |
|------|---------|
| `app/src/components/Layout.tsx` | Wrap `<Outlet />` with `<PageTransition>` |
| `app/src/components/ErrorBoundary.tsx` | Use `.glass-premium`, `.btn-premium` for error display |

### Verify
Page navigation shows subtle fade transition. Skeleton components available for subsequent phases.

---

## PHASE 6: Dashboard & Labs Upgrades
**Objective:** Polish the most-viewed page (Dashboard) and most-basic page (Labs).

### Modify
| File | Changes |
|------|---------|
| `app/src/pages/Dashboard.tsx` | Wrap with `<PageLayout color="cyan">`, replace greeting with `<PageHeader>`, add `.glass-premium` to widgets, staggered entrance animations, WidgetSkeleton loading states, replace hardcoded colors with CSS vars |
| `app/src/pages/Labs.tsx` | Full overhaul: wrap with `<PageLayout color="cyan">`, `<PageHeader>`, `.card-premium` cards, `.progress-bar`/`.progress-fill`, `.badge-premium` for status, staggered entrance animations, mesh gradient background |

### Verify
Dashboard has atmospheric floodlight behind widgets. Labs goes from 3 plain cards to a polished animated page.

---

## PHASE 7: News, Agents & Chat Upgrades
**Objective:** Apply design system to the three most interactive pages.

### Modify
| File | Changes |
|------|---------|
| `app/src/pages/News.tsx` | `<PageLayout color="red">`, `<PageHeader>` with stats pills, `.glass-premium` article cards, `.badge-premium` for bias, `.input-premium` for search, `.animate-infinite-scroll` ticker, `.divider-gradient` between sections, skeleton loading |
| `app/src/pages/Agents.tsx` | `<PageLayout color="purple">`, `<PageHeader>`, `.card-premium` agent cards, `.badge-premium` for status, `.input-premium` for editor, `.btn-premium` for actions |
| `app/src/pages/Chat.tsx` | `<PageLayout color="cyan" noPadding>`, `.glass-premium` input area, `.card-premium` agent selector, `.input-premium` chat input, `.skeleton` for AI responses, `.badge-premium` for model indicators |

### Verify
All three pages have atmospheric backgrounds, premium glassmorphism, consistent design language.

---

## PHASE 8: Meeting, Drive, Settings & Pipeline Upgrades
**Objective:** Apply design system to remaining core pages.

### Modify
| File | Changes |
|------|---------|
| `app/src/pages/Meeting.tsx` | `<PageLayout color="indigo">`, `.glass-premium` cards, `.input-premium` inputs, `.btn-premium` buttons, `.badge-premium` agent pills |
| `app/src/pages/Drive.tsx` | `<PageLayout color="cyan">`, `<PageHeader>`, `.card-premium` file cards, skeleton loading states, `.badge-premium` file types |
| `app/src/pages/Settings.tsx` | `<PageLayout color="purple">`, `.glass-premium` panels, `.input-premium` inputs, `.btn-premium` buttons, ADD theme selector showing all 5 themes with live preview, ADD vibe mode selector, ADD light/dark toggle |
| `app/src/pages/Pipeline.tsx` | `<PageLayout color="purple">`, `.card-premium` track cards, `.progress-bar`/`.progress-fill`, `.badge-premium` status badges, `.btn-premium` actions |

### Verify
All four pages integrate with design system. Settings has working theme/vibe controls. No hardcoded background colors remain.

---

## PHASE 9: Studios & SmartFolio Page Upgrades
**Objective:** Polish all studio sub-pages and SmartFolio sub-pages.

### Modify
| File | Changes |
|------|---------|
| `app/src/pages/Studios.tsx` | `<PageLayout color="purple">`, `.card-premium`, `.badge-premium`, staggered animations |
| `app/src/pages/studios/DevStudio.tsx` | `<PageLayout color="cyan">`, `.glass-premium` repo cards, `.badge-premium` language badges |
| `app/src/pages/studios/VideoStudio.tsx` | `<PageLayout color="amber">`, `.card-premium`, `.progress-bar` |
| `app/src/pages/studios/ArtStudio.tsx` | `<PageLayout color="pink">`, `.glass-premium`, `.input-premium`, `.btn-premium` |
| `app/src/pages/studios/BlogStudio.tsx` | `<PageLayout color="green">`, `.glass-premium`, `.card-premium`, `.input-premium` |
| `app/src/pages/MusicStudio.tsx` | `<PageLayout color="pink">`, `.glass-premium`, `.input-premium`, `.btn-premium`, `.badge-premium` |
| `app/src/pages/smartfolio/SmartFolioHub.tsx` | Replace inline atmospheric bg with `<PageBackground>` |
| `app/src/pages/smartfolio/SmartFolioLayout.tsx` | `bg-[#0b0e11]` → `bg-[var(--bg-void)]` |
| `app/src/pages/smartfolio/SmartFolioReport.tsx` | `.glass-premium`, design system colors |
| `app/src/pages/smartfolio/SmartFolioMarket.tsx` | `.glass-premium`, design system colors |
| `app/src/pages/smartfolio/SmartFolioOrders.tsx` | `.glass-premium`, `.badge-premium` for order status |
| `app/src/pages/smartfolio/SmartFolioRisk.tsx` | `.glass-premium`, design system progress bars |
| `app/src/pages/smartfolio/SmartFolioSettings.tsx` | `.glass-premium`, `.input-premium` |
| `app/src/pages/smartfolio/SmartFolioAUM.tsx` | `.glass-premium`, design system colors |

### Verify
Every studio and SmartFolio page uses PageLayout. All respond to theme changes.

---

## PHASE 10: Advanced Effects, Vibe Controller & Final Polish
**Objective:** Finishing touches — VibeController widget, particle effects, hardcoded color audit, performance validation.

### Create
| File | Purpose |
|------|---------|
| `app/src/components/VibeController.tsx` | Fixed bottom-right widget: current vibe mode, GPU/CPU metrics, 4 mode buttons. Port from `webapp/src/components/VibeController.tsx` |

### Modify
| File | Changes |
|------|---------|
| `app/src/components/Layout.tsx` | Add VibeController overlay, subtle particle effects, ensure nav uses `var(--glass-bg)` |
| `app/src/pages/AgentFlow.tsx` | Design system colors for ReactFlow nodes, `.glass-premium` control panel, `.btn-premium` actions |

### Global Hardcoded Color Audit
Search and replace across all files:

| Find | Replace |
|------|---------|
| `bg-[#07070a]` | `bg-[var(--bg-void)]` |
| `bg-[#0a0a0f]` | `bg-[var(--bg-void)]` |
| `bg-[#0d0d14]` | `bg-[var(--bg-panel)]` |
| `bg-[#08080c]` | `bg-[var(--bg-deep)]` |
| `bg-[#0b0e11]` | `bg-[var(--bg-void)]` |
| Hardcoded `rgba(6, 182, 212, ...)` | CSS variable equivalents |

### Performance Validation
- `data-vibe="high-load"` → blur reduces, glows disable
- `data-vibe="focus"` → secondary content dims
- `data-vibe="crisis"` → entire UI turns red-alert
- All 5 themes + light mode work on every page

### Verify
VibeController appears bottom-right. All vibe modes work. Animated grid visible. Every page responds to all themes.

---

## Dependency Map

```
Phase 1 (CSS Foundation)
   ↓
Phase 2 (Theme/Vibe Contexts)
   ↓
Phase 3 (PageLayout/Background)  ──→  Phase 5 (Skeletons/Transitions)
   ↓                                        ↓
Phase 4 (Nav Polish)               Phases 6-9 (Page Upgrades)
                                            ↓
                                   Phase 10 (Effects + Audit)
```

Phases 6-9 can be done in any order after 1-5. Phase 10 must be last.

---

## Totals
- **18 new files** to create
- **~30 files** to modify
- **10 phases**, each a single session
- **Source benchmark:** `webapp/src/app/globals.css`, `webapp/src/app/premium-ui.css`, `webapp/src/lib/themes.ts`, `webapp/src/components/` (PageLayout, PageBackground, Navigation, KeyboardShortcuts, CommandPalette, VibeContext, ThemeProvider, HeroBackground, VibeController)

---

## Progress Tracker

| Phase | Name | Status |
|-------|------|--------|
| 1 | Design System Foundation | ✅ Complete |
| 2 | Theme System & Context Providers | ⬜ Pending |
| 3 | Page Wrapper & Atmospheric Backgrounds | ⬜ Pending |
| 4 | Layout & Navigation Polish | ⬜ Pending |
| 5 | Loading States & Page Transitions | ⬜ Pending |
| 6 | Dashboard & Labs Upgrades | ⬜ Pending |
| 7 | News, Agents & Chat Upgrades | ⬜ Pending |
| 8 | Meeting, Drive, Settings & Pipeline Upgrades | ⬜ Pending |
| 9 | Studios & SmartFolio Page Upgrades | ⬜ Pending |
| 10 | Advanced Effects, Vibe Controller & Final Polish | ⬜ Pending |
