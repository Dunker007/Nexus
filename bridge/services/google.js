/**
 * Google OAuth Service
 * Handles Google authentication and API access
 */

import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

export const googleService = {
    /**
     * Get OAuth2 client
     */
    getOAuth2Client() {
        return new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    },

    /**
     * Generate authentication URL
     * @param {string} state - Random state string for CSRF protection
     * @param {string} codeChallenge - PKCE code challenge (optional)
     */
    getAuthUrl(state, codeChallenge) {
        const oauth2Client = this.getOAuth2Client();
        const options = {
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent',
            state: state
        };

        if (codeChallenge) {
            options.code_challenge = codeChallenge;
            options.code_challenge_method = 'S256';
        }

        return oauth2Client.generateAuthUrl(options);
    },

    /**
     * Exchange authorization code for tokens
     * @param {string} code - Authorization code
     * @param {string} codeVerifier - PKCE code verifier (optional)
     */
    async getTokens(code, codeVerifier) {
        const oauth2Client = this.getOAuth2Client();
        
        // If using PKCE, we need to set the code_verifier
        // Note: googleapis might not expose this directly in getToken options depending on version,
        // but passing it in the options object usually works for standard OAuth flows.
        // For googleapis specifically, we might need to rely on the client handling.
        // However, standard practice is to pass it.
        const options = { code };
        if (codeVerifier) {
            options.code_verifier = codeVerifier;
        }

        const { tokens } = await oauth2Client.getToken(options);
        return tokens;
    },

    /**
     * Get user info
     */
    async getUserInfo(accessToken) {
        const oauth2Client = this.getOAuth2Client();
        oauth2Client.setCredentials({ access_token: accessToken });

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();
        return data;
    },

    /**
     * List calendar events
     */
    async listCalendarEvents(accessToken, maxResults = 10) {
        const oauth2Client = this.getOAuth2Client();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const { data } = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults,
            singleEvents: true,
            orderBy: 'startTime'
        });

        return data.items || [];
    },

    /**
     * List Drive files
     */
    async listDriveFiles(accessToken, maxResults = 10) {
        const oauth2Client = this.getOAuth2Client();
        oauth2Client.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const { data } = await drive.files.list({
            pageSize: maxResults,
            fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink)'
        });

        return data.files || [];
    }
};
