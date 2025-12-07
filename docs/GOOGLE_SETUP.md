# Google Integration Setup Guide 🔐

To enable Google Calendar and Drive integration in DLX Studio, you need to create a Google Cloud Project and add your credentials to the LuxRig Bridge.

## Step 1: Get Google Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "DLX Studio").
3. Enable the following APIs:
   - **Google Calendar API**
   - **Google Drive API**
   - **Gmail API** (Optional, for email widget)
4. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - Application type: **Web application**
   - Name: `LuxRig Bridge`
   - Authorized redirect URIs: `http://localhost:3456/auth/google/callback`
5. Copy your **Client ID** and **Client Secret**.

## Step 2: Configure LuxRig Bridge

1. Navigate to your bridge directory:
   ```bash
   cd c:\Repos GIT\Fresh-Start\Fresh-Start\luxrig-bridge
   ```
2. Open (or create) the `.env` file.
3. Add your keys:
   ```env
   PORT=3456
   GOOGLE_CLIENT_ID=your_pasted_client_id_here
   GOOGLE_CLIENT_SECRET=your_pasted_client_secret_here
   ```
4. Restart the bridge:
   - Stop the current terminal running user `node server.js`
   - Run `npm run dev` again.

## Step 3: Connect in App

1. Go to **Settings** (`/settings`) -> **Google**.
2. Click "Test Google Integration" or "Connect".
3. Once authenticated, your Dashboard will automatically start showing your real calendar events!
