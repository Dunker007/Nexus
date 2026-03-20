import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MemoryProvider } from './contexts/MemoryContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/labs/smartfolio/PortfolioContext';
import { ToastStack } from './components/ToastStack';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Agents = lazy(() => import('./pages/Agents').then(m => ({ default: m.Agents })));
const Drive = lazy(() => import('./pages/Drive').then(m => ({ default: m.Drive })));
const Pipeline = lazy(() => import('./pages/Pipeline').then(m => ({ default: m.Pipeline })));
const MusicStudio = lazy(() => import('./pages/MusicStudio').then(m => ({ default: m.MusicStudio })));
const News = lazy(() => import('./pages/News').then(m => ({ default: m.News })));
const Studios = lazy(() => import('./pages/Studios').then(m => ({ default: m.Studios })));
const Labs = lazy(() => import('./pages/Labs').then(m => ({ default: m.Labs })));
const Meeting = lazy(() => import('./pages/Meeting').then(m => ({ default: m.Meeting })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const SmartFolioLayout = lazy(() => import('./pages/smartfolio/SmartFolioLayout').then(m => ({ default: m.SmartFolioLayout })));
const SmartFolioHub = lazy(() => import('./pages/smartfolio/SmartFolioHub').then(m => ({ default: m.SmartFolioHub })));
const SmartFolioReport = lazy(() => import('./pages/smartfolio/SmartFolioReport').then(m => ({ default: m.SmartFolioReport })));
const SmartFolioMarket = lazy(() => import('./pages/smartfolio/SmartFolioMarket').then(m => ({ default: m.SmartFolioMarket })));
const SmartFolioOrders = lazy(() => import('./pages/smartfolio/SmartFolioOrders').then(m => ({ default: m.SmartFolioOrders })));
const SmartFolioRisk = lazy(() => import('./pages/smartfolio/SmartFolioRisk').then(m => ({ default: m.SmartFolioRisk })));
const SmartFolioSettings = lazy(() => import('./pages/smartfolio/SmartFolioSettings').then(m => ({ default: m.SmartFolioSettings })));
const SmartFolioAUM = lazy(() => import('./pages/smartfolio/SmartFolioAUM').then(m => ({ default: m.SmartFolioAUM })));
const AgentFlow = lazy(() => import('./pages/AgentFlow').then(m => ({ default: m.AgentFlow })));
const DevStudio = lazy(() => import('./pages/studios/DevStudio').then(m => ({ default: m.DevStudio })));
const VideoStudio = lazy(() => import('./pages/studios/VideoStudio').then(m => ({ default: m.VideoStudio })));
const ArtStudio = lazy(() => import('./pages/studios/ArtStudio').then(m => ({ default: m.ArtStudio })));
const BlogStudio = lazy(() => import('./pages/studios/BlogStudio').then(m => ({ default: m.BlogStudio })));
const LabStub = lazy(() => import('./pages/labs/LabStub').then(m => ({ default: m.LabStub })));

import { ThemeProvider } from './contexts/ThemeContext';
export default function App() {
  return (
    <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryProvider>
              <PortfolioProvider>
                <BrowserRouter>
                  <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0a0a]"><div className="w-8 h-8 border-2 border-white/10 border-t-white/80 rounded-full animate-spin flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div></div>}>
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
                  </Suspense>
                  <ToastStack />
                </BrowserRouter>
              </PortfolioProvider>
            </MemoryProvider>
          </AuthProvider>
        </ToastProvider>
    </ThemeProvider>
  );
}

