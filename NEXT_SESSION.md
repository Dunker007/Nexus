# Nexus Restoration Checklist

## ✅ CRITICAL: Fix Bridge Connectivity
**Status:** FIXED via Cloudflare Tunnel reconfiguration (127.0.0.1) and bypassing Access.
The Bridge (`bridge.dlxstudios.online`) is now accessible and proxied correctly.

## ✅ Step 2: Vercel Configuration
1. **Verified:** `NEXT_PUBLIC_BRIDGE_API_KEY` matches in `webapp/.env.local` and `bridge/.env`.

## 🚀 Step 3: Run the Engine
1. **Bridge:** Running on `localhost:3456`.
2. **Tunnel:** Running (`nexus-bridge` -> `bridge.dlxstudios.online`).
3. **Web:** Running on `http://localhost:3000`.

**Status:**
- Next.js Version: Fixed (v15.1.12)
- Security: Fixed (API Key Implemented)
- Bridge: **Operational** (200 OK)
- Webapp: **Operational**
