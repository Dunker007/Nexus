# IDE & Workspace Setup - Fresh-Start Foundation

**Date:** November 21, 2025  
**Status:** Ready to Install  
**Time Required:** 2-3 hours

---

## The Complete Stack

**What We're Installing Tonight:**

1. **Google Antigravity** - Primary IDE (agent-first development)
2. **AFFiNE** - The Studio (visual planning & architecture)
3. **AppFlowy** - The Vault (knowledge base & prompt library)
4. **Mission Control** - Dashboard (already built, just needs integration)

---

## Part 1: Install Google Antigravity

**Why Antigravity:**
- Released Nov 18, 2025 (3 days old)
- Built by Google specifically for Gemini 3 Pro
- FREE preview with access to ALL top models:
  - Gemini 3 Pro (High/Low thinking modes)
  - Claude Sonnet 4.5 (Standard/Thinking modes)
  - GPT-OSS 120B (open-source)
- Multi-agent orchestration (perfect for Fresh-Start automation)
- Browser automation (test publishing workflows)
- Built on VS Code (familiar, extensions work)

**The Install:**

1. **Download:**
   - Visit: https://antigravity.google/download
   - Download Windows version

2. **Install:**
   - Run installer
   - Choose installation location: `C:\Program Files\Google Antigravity\`
   - Launch app

3. **Setup Flow:**
   - Choose setup: "Fresh start" (or import VS Code settings if you want)
   - Choose theme: Dark (or your preference)
   - Choose agent mode: "Agent-assisted development" (recommended)
   - Sign in with Gmail (personal account for free preview)
   - Accept terms (read about data usage)

4. **First Launch:**
   - Opens to Agent Manager interface (Mission Control for agents)
   - Editor View is available via tabs
   - All three models available in dropdown

**Configuration:**

```
Settings to configure:
- Default model: Start with Gemini 3 Pro (High)
- Auto-save: Enable
- Format on save: Enable
- Git integration: Connect to GitHub
- Extensions: Import from VS Code or start fresh
```

**Test It:**

Create a simple PowerShell test:
```powershell
# test.ps1
Write-Host "Fresh-Start is ready to build!"
Get-Date
```

Ask agent: "Run this script and tell me if it works"

---

## Part 2: Install AFFiNE (The Studio)

**Why AFFiNE:**
- Visual planning with whiteboards + docs in one tool
- Perfect for architecture diagrams and project mapping
- Local-first (data stays on LuxRig)
- Free for local use

**The Install:**

1. **Download:**
   - Visit: https://affine.pro/download
   - Download Windows version

2. **Install:**
   - Run installer
   - Choose: `C:\Program Files\AFFiNE\`
   - Launch app

3. **Setup:**
   - Choose "Local Mode" (offline/local-first)
   - Skip cloud signup (testing local-first)
   - Create workspace: "Fresh-Start Studio"

**Initial Workspace Structure:**

Create these pages:

1. **Projects Galaxy** (Canvas mode)
   - Mind map of project ideas
   - Fresh-Start at center
   - Branch categories: Content, Tools, Revenue, Infrastructure

2. **Fresh-Start Architecture** (Canvas mode)
   - System diagram:
     - LuxRig → LM Studio → Content Engine
     - Orchestrator workflow
     - Publishing pipeline
     - Revenue tracking

3. **Phase 1 Planning** (Doc mode)
   - Current phase breakdown
   - Task list
   - Dependencies
   - Success criteria

4. **Weekly Sprints** (Board mode)
   - This week's focus
   - Next week's prep
   - Blocked items
   - Completed wins

**Settings:**
- Storage: Local directory (check where it saves)
- Auto-save: Enable
- Backup: Note location for manual backups

---

## Part 3: Install AppFlowy (The Vault)

**Why AppFlowy:**
- Markdown/text based (easy to backup, Git-friendly)
- Structured databases for prompts, code, docs
- Open-source, privacy-focused
- Local-first

**The Install:**

1. **Download:**
   - Visit: https://appflowy.io/download
   - Download Windows version

2. **Install:**
   - Run installer
   - Choose: `C:\Program Files\AppFlowy\`
   - Launch app

3. **Setup:**
   - Choose "Anonymous Mode" (local-only)
   - Skip account creation
   - Create workspace: "Fresh-Start Vault"

**Initial Workspace Structure:**

Create these databases/pages:

1. **Prompt Library** (Database)
   - Columns:
     - Name (Title)
     - Category (Select: Content, Code, Analysis, Creative)
     - Model (Select: Gemini 3 Pro, Claude Sonnet 4.5, GPT-OSS)
     - Prompt (Text)
     - Success Rating (1-5 stars)
     - Tags (Multi-select)
     - Last Used (Date)

2. **Code Snippets** (Database)
   - Columns:
     - Title (Title)
     - Language (Select: PowerShell, Python, JavaScript)
     - Code (Text)
     - Description (Text)
     - Model That Generated It (Select)
     - Tags (Multi-select)

3. **Model Comparison Notes** (Page)
   - Track which model is best for what
   - Phase 1 Orchestrator:
     - Gemini 3 Pro: [observations]
     - Claude Sonnet 4.5: [observations]
     - GPT-OSS: [observations]
   - Best for: [summary]

4. **AI Instructions Archive** (Page)
   - Store important instruction docs
   - Link to WELCOME-TO-FRESH-START.md
   - Link to this setup doc

5. **Learning Log** (Page)
   - Daily notes on what worked/didn't
   - Patterns discovered
   - Problems solved

**Settings:**
- Data location: `C:\LuxRig\AppFlowy\data\` (or default)
- Enable Git integration (optional, for versioning)
- Backup strategy: Note location

---

## Part 4: Update Mission Control

**Add New Launcher Buttons:**

Open: `C:\LuxRig\MissionControl\index.html`

In the "Quick Access" section, add:

```html
<!-- Workspaces Section -->
<div style="margin: 15px 0;">
    <h3 style="color: #888; margin-bottom: 10px;">Development</h3>
    <a href="#" onclick="launchAntigravity()" class="quick-link">
        ⚡ Antigravity (IDE)
    </a>
</div>

<div style="margin: 15px 0;">
    <h3 style="color: #888; margin-bottom: 10px;">Workspaces</h3>
    <a href="#" onclick="launchAFFiNE()" class="quick-link">
        🎨 The Studio (AFFiNE)
    </a>
    <a href="#" onclick="launchAppFlowy()" class="quick-link">
        🔒 The Vault (AppFlowy)
    </a>
</div>
```

**Add JavaScript Functions (before closing `</script>` tag):**

```javascript
function launchAntigravity() {
    // Launch Antigravity
    // Update path if installed elsewhere
    window.open('antigravity://open', '_blank');
    alert('Launching Antigravity IDE...');
}

function launchAFFiNE() {
    // Launch AFFiNE
    window.open('affine://open', '_blank');
    alert('Launching AFFiNE Studio...');
}

function launchAppFlowy() {
    // Launch AppFlowy
    window.open('appflowy://open', '_blank');
    alert('Launching AppFlowy Vault...');
}
```

**Test All Launchers:**
- Open Mission Control
- Click each button
- Verify apps launch

---

## Part 5: Multi-Model Strategy

**How We'll Use The Models:**

**Gemini 3 Pro (High Thinking):**
- Full implementations
- Complex architecture decisions
- Complete feature builds
- First-pass code generation

**Claude Sonnet 4.5 (Thinking Mode):**
- Code review and refinement
- Careful refactoring
- Documentation generation
- Bug fixing and debugging

**GPT-OSS 120B:**
- Alternative approaches
- Quick prototypes
- Learning/comparison

**The Workflow:**

1. **Plan in AFFiNE** (whiteboard the architecture)
2. **Build with Gemini 3** (get full implementation)
3. **Review with Claude** (refine and improve)
4. **Compare with GPT-OSS** (alternative perspective)
5. **Document in AppFlowy** (what worked, what didn't)
6. **Commit to GitHub** (version control)

**Track Model Performance:**

In AppFlowy "Model Comparison Notes":
- Which completed tasks fastest?
- Which had best code quality?
- Which required least iteration?
- Which handled PowerShell best?
- Which understood Fresh-Start context best?

---

## Rate Limits & Preview Notes

**What to Expect:**

- Free preview = generous but limited
- Heavy usage sessions: ~30-45 mins before hitting limits
- Workload-based (not strictly time-based)
- "Model provider overload" errors during high demand
- Google scaling capacity over time

**When You Hit Limits:**

1. Switch to different model (Gemini → Claude → GPT-OSS)
2. Take a break (limits refresh)
3. Switch to planning work (AFFiNE/AppFlowy)
4. Document what you learned

**The Preview is Temporary:**

- Currently FREE for individuals
- Will eventually have paid tiers
- Team/Enterprise pricing coming
- Use it while it's free, document everything
- If it goes paid, we have options (VS Code, Cursor, etc.)

---

## Success Criteria

**After setup, you should have:**

✅ Antigravity installed with all 3 models accessible  
✅ AFFiNE installed with Fresh-Start workspace created  
✅ AppFlowy installed with Prompt Library and databases  
✅ Mission Control updated with launcher buttons  
✅ All apps launch from Mission Control  
✅ Test artifacts created in each tool  
✅ Initial content documented  
✅ Backup locations identified  

---

## Next Steps After Setup

**Tomorrow (First Work Session):**

1. **Open Mission Control** (daily ritual begins)
2. **Launch Antigravity** (onboard the new Claude)
3. **Paste WELCOME-TO-FRESH-START.md** (introduce the project)
4. **Walk through Fresh-Start repo** (show Claude the codebase)
5. **Plan Phase 1 in AFFiNE** (visual architecture)
6. **Start building** (Gemini 3 agents write orchestrator)
7. **Document learnings** (AppFlowy vault)

**This Week:**

- Build Phase 1 orchestrator
- Test all 3 models on same tasks
- Document which model is best for what
- Connect to LM Studio API
- Generate first test content
- Commit everything to GitHub

---

**Let's build.** 🚀
