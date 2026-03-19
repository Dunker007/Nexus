import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Phase 10: Tauri Native App Networking Bridge + Netlify Bridge
// In Tauri, backend runs natively on port 3001. In Netlify, it routes through VITE_API_URL.
const isTauri = '__TAURI_INTERNALS__' in window || 
                window.location.hostname === 'tauri.localhost' || 
                window.location.protocol === 'tauri:';

const viteApiUrl = import.meta.env.VITE_API_URL;

if (isTauri || viteApiUrl) {
  const API_BASE = isTauri ? 'http://127.0.0.1:3001' : viteApiUrl;
  (window as any).NEXUS_API_BASE = API_BASE;

  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    if (typeof urlStr === 'string' && urlStr.startsWith('/api')) {
      urlStr = API_BASE + urlStr;
      
      if (typeof input === 'string') {
        input = urlStr;
      } else if (input instanceof URL) {
        input = new URL(urlStr);
      } else {
        input = new Request(urlStr, init);
      }
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
