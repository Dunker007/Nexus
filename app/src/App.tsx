import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MemoryProvider } from './contexts/MemoryContext';
import { ToastProvider } from './contexts/ToastContext';
import { PortfolioProvider } from './contexts/labs/smartfolio/PortfolioContext';
import { ToastStack } from './components/ToastStack';
import { Layout } from './components/Layout';
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

export default function App() {
  return (
    <ToastProvider>
      <MemoryProvider>
        <PortfolioProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
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
    </ToastProvider>
  );
}

