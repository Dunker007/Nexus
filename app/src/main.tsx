import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Phase 10: Tauri Native App Networking Bridge
// App builds serve from 'tauri.localhost', but the backend runs natively on port 3001.
// We globally route all implicit API fetches and sockets back to the localhost socket.
const isTauri = '__TAURI_INTERNALS__' in window || 
                window.location.hostname === 'tauri.localhost' || 
                window.location.protocol === 'tauri:';

if (isTauri) {
  const LOCAL_BACKEND = 'http://127.0.0.1:3001';
  (window as any).NEXUS_API_BASE = LOCAL_BACKEND;

  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    if (typeof urlStr === 'string' && urlStr.startsWith('/')) {
      urlStr = LOCAL_BACKEND + urlStr;
      
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
