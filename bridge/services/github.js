/**
 * GitHub OAuth Service
 * Handles GitHub authentication and API access
 */

import fetch from 'node-fetch';

export const githubService = {
    /**
     * Get Auth URL
     */
    getAuthUrl() {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';
        const scope = 'repo user read:org'; // Add more scopes as needed

        return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    },

    /**
     * Exchange code for token
     */
    async getTokens(code) {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error_description || data.error);
        }

        return data;
    },

    /**
     * Get user info
     */
    async getUserInfo(accessToken) {
        const token = accessToken || process.env.GITHUB_ACCESS_TOKEN;
        if (!token) throw new Error('No access token provided');

        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return await response.json();
    },

    /**
     * List user repositories
     */
    async listRepos(accessToken, limit = 10) {
        const token = accessToken || process.env.GITHUB_ACCESS_TOKEN;
        if (!token) throw new Error('No access token provided');

        // GitHub defaults to 30 per page
        const response = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=${limit}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return await response.json();
    }
};
