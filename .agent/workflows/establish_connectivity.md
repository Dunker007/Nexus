---
description: Establish secure connectivity between Vercel and Local Bridge
---

# Stability Protocol: Vercel <-> LuxRig Bridge

**Objective**: Allow the deployed Vercel application (HTTPS) to securely communicate with the local LuxRig Bridge API (HTTP) running on `localhost:3456`.

**Method**: Tailscale Funnel. 
*Why?* It aligns with the Master Plan ("Tailscale Configured"), requires no extra software, and provides a persistent public URL.

## Step 1: Verify Tailscale State
- [x] Check if Tailscale is running (`tailscale status`) -> **Confirmed (luxrig-3700x)**

## Step 2: Configure Serve & Funnel
We need to tell Tailscale to route public traffic from a specific URL to our local port 3456.

1. **Serve Localhost**:
   ```powershell
   tailscale serve --bg 3456
   ```

2. **Enable Funnel (Public Access)**:
   ```powershell
   tailscale funnel 3456 on
   ```
   *Note: This might require an interactive Auth check the first time.*

## Step 3: Get the Public URL
The command will output a URL like `https://luxrig-3700x.tail-scale.ts.net`. This is our stable, SSL-secured entry point.

## Step 4: Update Vercel Configuration
1. Go to Vercel Project Settings > Environment Variables.
2. Add/Update `NEXT_PUBLIC_BRIDGE_URL`.
3. Value: The Tailscale Funnel URL from Step 3.

## Step 5: Update Local Config (Optional)
To ensure dev/prod parity, we can update `.env.production` in the webapp to use this URL as well, though `localhost` is faster for dev.

## Step 6: Validation
1. Open Vercel app.
2. Verify "System" widget is **Online**.
3. Chat with "Quick AI" to test end-to-end data flow.
