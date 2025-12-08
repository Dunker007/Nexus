# Nexus Agent System Documentation

**Last Updated:** 2025-12-07

This document provides a comprehensive overview of all agent types available in the Nexus platform.

---

## Agent Status Overview

| Agent | Category | Status | LLM Required | Notes |
|-------|----------|--------|--------------|-------|
| lyricist | Music | ✅ Operational | Yes | Full LLM integration |
| composer | Music | ✅ Operational | Yes | Full LLM integration |
| critic | Music | ✅ Operational | Yes | Full LLM integration |
| producer | Music | ✅ Operational | Yes | Full LLM integration |
| revenue | Business | ✅ Operational | Yes | Revenue stream analysis |
| intent | NLU | ✅ Operational | Yes | Natural language understanding |
| staff-meeting | Orchestration | ✅ Operational | Mocked | Multi-agent debate orchestrator |
| research | Development | ⚠️ Stub | No | Returns template patterns |
| code | Development | ⚠️ Stub | No | Returns template patterns |
| workflow | Orchestration | ⚠️ Stub | No | Returns template patterns |
| architect | Design | ⚠️ Stub | No | Returns template patterns |
| qa | Quality | ⚠️ Stub | No | Returns template patterns |
| security | Security | ⚠️ Stub | No | Returns template patterns |
| devops | Infrastructure | ⚠️ Stub | No | Returns template patterns |

**Legend:**
- ✅ **Operational** - Agent makes real LLM calls and provides dynamic responses
- ⚠️ **Stub** - Agent returns predefined template/mock data (useful for testing)

---

## Agent Categories

### 🎵 Music Production Agents

These agents work together in the **SongwriterRoom** to create complete songs.

#### LyricistAgent
- **ID:** `lyricist-agent`
- **File:** `bridge/services/agents-songwriter.js`
- **Capabilities:** `lyric-generation`, `hook-creation`, `emotional-theming`
- **Methods:**
  - `writeLyrics(theme, genre, mood)` - Generates song lyrics
  - `createHook(theme)` - Creates catchy hooks
  - `refineLyrics(lyrics, feedback)` - Iterates based on critic feedback
- **Personas:** Newsician (political rap), Midwest Sentinel (faith/boom bap)

#### ComposerAgent
- **ID:** `composer-agent`
- **File:** `bridge/services/agents-songwriter.js`
- **Capabilities:** `style-suggestion`, `arrangement-planning`, `suno-prompt-building`
- **Methods:**
  - `suggestStyle(theme, genre, mood)` - Recommends musical style
  - `buildSunoPrompt(lyrics, style)` - Creates Suno-ready prompts
  - `createArrangement(theme)` - Plans song structure

#### CriticAgent
- **ID:** `critic-agent`
- **File:** `bridge/services/agents-songwriter.js`
- **Capabilities:** `lyric-review`, `style-critique`, `improvement-suggestion`
- **Methods:**
  - `reviewLyrics(lyrics)` - Provides constructive feedback
  - `reviewStyle(style)` - Critiques musical direction
  - `suggestImprovements(content)` - Specific enhancement ideas

#### ProducerAgent
- **ID:** `producer-agent`
- **File:** `bridge/services/agents-songwriter.js`
- **Capabilities:** `prompt-finalization`, `title-generation`, `tag-generation`, `market-analysis`
- **Methods:**
  - `finalizePrompt(lyrics, style)` - Creates final Suno prompt
  - `generateTitle(theme)` - Suggests song titles
  - `generateTags(content)` - Creates metadata tags

---

### 💼 Business Intelligence Agents

#### RevenueAgent
- **ID:** `revenue-agent`
- **File:** `bridge/services/agents-revenue.js`
- **Capabilities:** `revenue-analysis`, `trend-detection`, `opportunity-identification`
- **Methods:**
  - `analyzeStream(stream)` - Analyzes revenue stream performance
  - `detectTrends(data)` - Finds patterns in revenue data
  - `identifyOpportunities(portfolio)` - Suggests new revenue streams

#### IntentAgent
- **ID:** `intent-agent`
- **File:** `bridge/services/agents-intent.js`
- **Capabilities:** `intent-classification`, `entity-extraction`, `command-mapping`
- **Methods:**
  - `parseIntent(text)` - Classifies user intent
  - `extractEntities(text)` - Finds named entities
  - `mapToCommand(intent)` - Converts to system command

---

### 🤖 Orchestration Agents

#### StaffMeetingAgent
- **ID:** `staff-meeting`
- **File:** `bridge/services/agents-staff-meeting.js`
- **Capabilities:** `orchestration`, `debate-moderation`, `synthesis`
- **Status:** ✅ Operational (with mock responses for speed)
- **Personas:**
  - **The Architect** (Purple) - System design focus
  - **SecOps Lead** (Red) - Security paranoia
  - **QA Director** (Yellow) - Quality pedantry

**Meeting Flow:**
1. Round 1: Initial thoughts from each persona
2. Round 2: Security critique and architect defense
3. Round 3: Consensus synthesis

**API Endpoints:**
- `POST /agents/meeting/start` - Start a meeting with topic
- `GET /agents/meeting/status` - Get current meeting state
- `POST /agents/meeting/stop` - End meeting early

#### WorkflowAgent (Stub)
- **ID:** `workflow-agent`
- **File:** `bridge/services/agents.js`
- **Capabilities:** `orchestration`, `error-recovery`, `parallel-execution`
- **Status:** ⚠️ Stub - Returns template workflow patterns

---

### 🏗️ Development Agents (Stubs)

These agents are implemented with full interfaces but return template/mock data.

#### ResearchAgent
- **ID:** `research-agent`
- **File:** `bridge/services/agents.js`
- **Capabilities:** `web-search`, `document-analysis`, `synthesis`
- **TODO:** Connect to real search APIs (Google, Drive, Calendar)

#### CodeAgent
- **ID:** `code-agent`
- **File:** `bridge/services/agents.js`
- **Capabilities:** `code-review`, `generation`, `testing`, `security-scan`
- **Methods:**
  - `reviewCode(code, language)` - Returns static review template
  - `scanSecurity(code, language)` - Returns mock security issues
  - `generateTests(code, language)` - Returns test template
  - `generateCode(prompt, language)` - Returns placeholder code

#### ArchitectAgent
- **ID:** `architect-agent`
- **File:** `bridge/services/agents.js` & `agents-advanced.js`
- **Capabilities:** `system-design`, `database-design`, `tech-stack-selection`, `scalability-planning`
- **Methods:**
  - `designSystem(requirements)` - Returns architecture template
  - `designDatabase(requirements)` - Returns ERD template
  - `selectTechStack(requirements)` - Returns tech stack template
  - `planScalability(requirements)` - Returns scaling template

#### QAAgent
- **ID:** `qa-agent`
- **File:** `bridge/services/agents.js` & `agents-advanced.js`
- **Capabilities:** `test-generation`, `bug-detection`, `coverage-analysis`, `regression-testing`
- **Methods:**
  - `generateTests(code, testType)` - Returns test template
  - `detectBugs(code)` - Returns mock bug list
  - `analyzeCoverage(code)` - Returns coverage report template
  - `runRegressionTests(code)` - Returns test results template

#### SecurityAgent
- **ID:** `security-agent`
- **File:** `bridge/services/agents-advanced.js`
- **Capabilities:** `vulnerability-scan`, `dependency-audit`, `secret-detection`, `fix-suggestion`
- **Methods:**
  - `scanVulnerabilities(code)` - Returns OWASP-style findings template
  - `auditDependencies(deps)` - Returns audit report template
  - `detectSecrets(code)` - Returns secrets detection template
  - `suggestFixes(code)` - Returns fix recommendations

#### DevOpsAgent
- **ID:** `devops-agent`
- **File:** `bridge/services/agents-advanced.js`
- **Capabilities:** `deployment`, `docker`, `ci-cd`, `monitoring`, `infrastructure`
- **Methods:**
  - `createDockerfile(config)` - Returns Dockerfile template
  - `setupCICD(config)` - Returns GitHub Actions template
  - `deploy(config)` - Returns deployment checklist
  - `setupMonitoring(config)` - Returns monitoring config template

---

## Agent Registry

The agent registry is defined in `bridge/services/agents.js`:

```javascript
export const agentRegistry = {
    research: ResearchAgent,
    code: CodeAgent,
    workflow: WorkflowAgent,
    architect: ArchitectAgent,
    qa: QAAgent,
    security: SecurityAgent,
    devops: DevOpsAgent,
    lyricist: LyricistAgent,
    composer: ComposerAgent,
    critic: CriticAgent,
    producer: ProducerAgent,
    revenue: RevenueAgent,
    intent: IntentAgent
};
```

---

## API Usage

### Execute Agent Task
```bash
POST /agents/execute
Content-Type: application/json

{
  "agentType": "lyricist",
  "task": {
    "action": "brainstorm",
    "theme": "Digital Dreams",
    "genre": "synthwave",
    "mood": "nostalgic"
  }
}
```

### Start Staff Meeting
```bash
POST /agents/meeting/start
Content-Type: application/json

{
  "topic": "Should we migrate to microservices?"
}
```

### Get Meeting Status
```bash
GET /agents/meeting/status
```

---

## Making Agents Operational

To convert a stub agent to operational:

1. **Add LLM call** in the agent's method:
   ```javascript
   async reviewCode(code, language) {
       const prompt = `Review this ${language} code:\n\n${code}`;
       const response = await lmstudioService.complete(prompt);
       return { review: response, timestamp: new Date() };
   }
   ```

2. **Import lmstudioService**:
   ```javascript
   import { lmstudioService } from './lmstudio.js';
   ```

3. **Handle errors gracefully**:
   ```javascript
   try {
       return await lmstudioService.complete(prompt);
   } catch (error) {
       return this.getFallbackResponse(task);
   }
   ```

---

## Architecture Notes

- All agents extend the base `Agent` class from `agent-core.js`
- Agents have persistent memory via `addToMemory()` and `getMemory()`
- The `createAgent(type)` factory function instantiates agents by type
- SongwriterRoom orchestrates the 4 music agents in a collaborative workflow
- StaffMeetingAgent orchestrates 3 personas in a debate format
