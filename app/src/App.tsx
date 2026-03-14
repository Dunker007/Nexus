import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MemoryProvider } from './contexts/MemoryContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/labs/smartfolio/PortfolioContext';
import { ToastStack } from './components/ToastStack';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Agents } from './pages/Agents';
import { Drive } from './pages/Drive';
import { Pipeline } from './pages/Pipeline';
import { MusicStudio } from './pages/MusicStudio';
import { News } from './pages/News';
import { Studios } from './pages/Studios';
import { Labs } from './pages/Labs';
import { Meeting } from './pages/Meeting';
import { Settings } from './pages/Settings';
import { SmartFolioLayout } from './pages/smartfolio/SmartFolioLayout';
import { SmartFolioHub } from './pages/smartfolio/SmartFolioHub';
import { SmartFolioReport } from './pages/smartfolio/SmartFolioReport';
import { SmartFolioMarket } from './pages/smartfolio/SmartFolioMarket';
import { SmartFolioOrders } from './pages/smartfolio/SmartFolioOrders';
import { SmartFolioRisk } from './pages/smartfolio/SmartFolioRisk';
import { SmartFolioSettings } from './pages/smartfolio/SmartFolioSettings';
import { SmartFolioAUM } from './pages/smartfolio/SmartFolioAUM';
import { AgentFlow } from './pages/AgentFlow';
import { DevStudio } from './pages/studios/DevStudio';
import { VideoStudio } from './pages/studios/VideoStudio';
import { ArtStudio } from './pages/studios/ArtStudio';
import { BlogStudio } from './pages/studios/BlogStudio';
import { LabStub } from './pages/labs/LabStub';

import { ThemeProvider } from './contexts/ThemeContext';
export default function App() {
  return (
    <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryProvider>
              <PortfolioProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="studios" element={<Studios />} />
                    <Route path="studios/dev" element={<DevStudio />} />
                    <Route path="studios/video" element={<VideoStudio />} />
                    <Route path="studios/art" element={<ArtStudio />} />
                    <Route path="studios/blog" element={<BlogStudio />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="news" element={<News />} />
                    <Route path="labs" element={<Labs />} />
                    <Route path="labs/smartfolio" element={<SmartFolioLayout />}>
                      <Route index element={<SmartFolioHub />} />
                      <Route path="report" element={<SmartFolioReport />} />
                      <Route path="market" element={<SmartFolioMarket />} />
                      <Route path="orders" element={<SmartFolioOrders />} />
                      <Route path="risk" element={<SmartFolioRisk />} />
                      <Route path="settings" element={<SmartFolioSettings />} />
                      <Route path="aum" element={<SmartFolioAUM />} />
                    </Route>
                    <Route path="labs/voice-command" element={<LabStub name="Voice Command" icon="🎙️" category="Operations" description="Natural language voice control for the entire Nexus OS." />} />
                    <Route path="labs/automation" element={<LabStub name="Automation Lab" icon="⚡" category="Operations" description="Workflow automation, triggers, and scheduled agent tasks." />} />
                    <Route path="labs/smart-home" element={<LabStub name="Smart Home" icon="🏠" category="Operations" description="IoT integration and intelligent home automation hub." />} />
                    <Route path="labs/analytics" element={<LabStub name="Analytics" icon="📊" category="Intelligence" description="Deep data analytics, dashboards, and business intelligence." />} />
                    <Route path="labs/knowledge-base" element={<LabStub name="Knowledge Base" icon="🧠" category="Intelligence" description="AI-powered knowledge management and retrieval system." />} />
                    <Route path="labs/data-weave" element={<LabStub name="Data Weave" icon="🕸️" category="Intelligence" description="Unified data pipeline weaving sources into structured insights." />} />
                    <Route path="labs/code-generator" element={<LabStub name="Code Generator" icon="💻" category="Creation" description="AI-assisted code generation, scaffolding, and refactoring." />} />
                    <Route path="labs/vision" element={<LabStub name="Vision Lab" icon="👁️" category="Creation" description="Computer vision models, image analysis, and visual AI tools." />} />
                    <Route path="labs/passive-income" element={<LabStub name="Passive Income Engine" icon="💰" category="Capital" description="Automated income streams, monetization strategies, and revenue tracking." />} />
                    <Route path="labs/crypto" element={<LabStub name="Crypto Lab" icon="₿" category="Capital" description="Crypto portfolio tracking, DeFi strategies, and market signals." />} />
                    <Route path="labs/aura" element={<LabStub name="Aura" icon="✨" category="Experimental" description="Ambient intelligence layer — mood, context, and environmental awareness." />} />
                    <Route path="labs/pc-optimizer" element={<LabStub name="PC Optimizer" icon="🖥️" category="Experimental" description="System performance monitoring, optimization, and automation." />} />
                    <Route path="labs/llm" element={<LabStub name="LLM Lab" icon="🤖" category="Experimental" description="Fine-tuning, prompt engineering, and model evaluation playground." />} />
                    <Route path="meeting" element={<Meeting />} />
                    <Route path="pipeline" element={<Pipeline />} />
                    <Route path="music" element={<MusicStudio />} />
                    <Route path="agents" element={<Agents />} />
                    <Route path="agentflow" element={<AgentFlow />} />
                    <Route path="drive" element={<Drive />} />
                    <Route path="settings" element={<Settings />} />
                    </Route>
                  </Routes>
                  <ToastStack />
                </BrowserRouter>
              </PortfolioProvider>
            </MemoryProvider>
          </AuthProvider>
        </ToastProvider>
    </ThemeProvider>
  );
}

