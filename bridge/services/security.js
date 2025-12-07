/**
 * Security Service
 * PKCE flow, CSRF protection, token encryption, session management
 */

import crypto from 'crypto';

// ============ PKCE (Proof Key for Code Exchange) ============

/**
 * Generate a cryptographically random code verifier
 * @returns {string} Base64URL encoded code verifier
 */
export function generateCodeVerifier() {
    const buffer = crypto.randomBytes(32);
    return base64URLEncode(buffer);
}

/**
 * Generate code challenge from code verifier using S256 method
 * @param {string} codeVerifier - The code verifier
 * @returns {string} Base64URL encoded SHA256 hash
 */
export function generateCodeChallenge(codeVerifier) {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    return base64URLEncode(hash);
}

/**
 * Verify that a code verifier matches a code challenge
 * @param {string} codeVerifier - The original code verifier
 * @param {string} codeChallenge - The code challenge to verify against
 * @returns {boolean} True if valid
 */
export function verifyCodeChallenge(codeVerifier, codeChallenge) {
    const expectedChallenge = generateCodeChallenge(codeVerifier);
    return timingSafeEqual(expectedChallenge, codeChallenge);
}

// ============ State Parameter (CSRF Protection) ============

/**
 * Generate a random state parameter for OAuth
 * @returns {string} Random state string
 */
export function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a signed state that includes expiry time
 * @param {number} expiresInMs - Expiration time in milliseconds (default 10 minutes)
 * @returns {{ state: string, signature: string }}
 */
export function createSignedState(expiresInMs = 600000) {
    const state = generateState();
    const expiresAt = Date.now() + expiresInMs;
    const payload = `${state}:${expiresAt}`;
    const signature = sign(payload);

    return {
        state,
        expiresAt,
        signature,
        encoded: Buffer.from(JSON.stringify({ state, expiresAt, signature })).toString('base64url')
    };
}

/**
 * Verify a signed state parameter
 * @param {string} encodedState - Base64URL encoded state object
 * @returns {{ valid: boolean, state?: string, error?: string }}
 */
export function verifySignedState(encodedState) {
    try {
        const decoded = JSON.parse(Buffer.from(encodedState, 'base64url').toString());
        const { state, expiresAt, signature } = decoded;

        // Check expiry
        if (Date.now() > expiresAt) {
            return { valid: false, error: 'State expired' };
        }

        // Verify signature
        const payload = `${state}:${expiresAt}`;
        if (!verifySignature(payload, signature)) {
            return { valid: false, error: 'Invalid signature' };
        }

        return { valid: true, state };
    } catch (error) {
        return { valid: false, error: 'Invalid state format' };
    }
}

// ============ Token Encryption ============

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const TAG_LENGTH = 16; // GCM auth tag length

/**
 * Get or generate encryption key from environment
 * @returns {Buffer} 32-byte encryption key
 */
function getEncryptionKey() {
    const keyString = process.env.TOKEN_ENCRYPTION_KEY;
    if (keyString) {
        return crypto.scryptSync(keyString, 'salt', 32);
    }
    // Fallback to a derived key (not recommended for production)
    console.warn('[Security] TOKEN_ENCRYPTION_KEY not set, using derived key');
    return crypto.scryptSync('default-key-change-in-production', 'salt', 32);
}

/**
 * Encrypt sensitive data (tokens, secrets)
 * @param {string} plaintext - Data to encrypt
 * @returns {string} Encrypted data as base64
 */
export function encryptToken(plaintext) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const tag = cipher.getAuthTag();

    // Combine IV + tag + ciphertext
    const combined = Buffer.concat([
        iv,
        tag,
        Buffer.from(encrypted, 'base64')
    ]);

    return combined.toString('base64');
}

/**
 * Decrypt encrypted token
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {string} Decrypted plaintext
 */
export function decryptToken(encryptedData) {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract IV, tag, and ciphertext
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

// ============ Session Management ============

/**
 * In-memory session store (use Redis/database in production)
 */
const sessions = new Map();

/**
 * Create a new session
 * @param {object} data - Session data
 * @param {number} expiresInMs - Session expiry time
 * @returns {string} Session ID
 */
export function createSession(data, expiresInMs = 3600000) { // Default 1 hour
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session = {
        id: sessionId,
        data,
        createdAt: Date.now(),
        expiresAt: Date.now() + expiresInMs,
        lastAccessedAt: Date.now()
    };

    sessions.set(sessionId, session);
    return sessionId;
}

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {object|null} Session data or null if expired/not found
 */
export function getSession(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
        sessions.delete(sessionId);
        return null;
    }

    // Update last accessed time
    session.lastAccessedAt = Date.now();
    return session.data;
}

/**
 * Update session data
 * @param {string} sessionId - Session ID
 * @param {object} data - New session data
 * @returns {boolean} True if updated
 */
export function updateSession(sessionId, data) {
    const session = sessions.get(sessionId);
    if (!session || Date.now() > session.expiresAt) {
        return false;
    }

    session.data = { ...session.data, ...data };
    session.lastAccessedAt = Date.now();
    return true;
}

/**
 * Destroy a session
 * @param {string} sessionId - Session ID
 */
export function destroySession(sessionId) {
    sessions.delete(sessionId);
}

/**
 * Clean up expired sessions
 */
export function cleanupSessions() {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now > session.expiresAt) {
            sessions.delete(id);
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupSessions, 300000);

// ============ CSRF Token Management ============

const csrfTokens = new Map();

/**
 * Generate a CSRF token for a session
 * @param {string} sessionId - Associated session ID
 * @returns {string} CSRF token
 */
export function generateCsrfToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(token, {
        sessionId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000 // 1 hour
    });
    return token;
}

/**
 * Verify a CSRF token
 * @param {string} token - CSRF token
 * @param {string} sessionId - Expected session ID
 * @returns {boolean} True if valid
 */
export function verifyCsrfToken(token, sessionId) {
    const stored = csrfTokens.get(token);
    if (!stored) return false;

    if (Date.now() > stored.expiresAt || stored.sessionId !== sessionId) {
        csrfTokens.delete(token);
        return false;
    }

    return true;
}

// ============ Helper Functions ============

/**
 * Base64URL encode a buffer
 */
function base64URLEncode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Sign a payload using HMAC-SHA256
 */
function sign(payload) {
    const secret = process.env.SESSION_SECRET || 'change-this-in-production';
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify a signature
 */
function verifySignature(payload, signature) {
    const expected = sign(payload);
    return timingSafeEqual(expected, signature);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
        return false;
    }
}

// ============ Express Middleware ============

/**
 * CSRF protection middleware
 */
export function csrfProtection() {
    return (req, res, next) => {
        // Skip for GET, HEAD, OPTIONS
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }

        const sessionId = req.headers['x-session-id'];
        const csrfToken = req.headers['x-csrf-token'];

        if (!sessionId || !csrfToken) {
            return res.status(403).json({ error: 'CSRF token required' });
        }

        if (!verifyCsrfToken(csrfToken, sessionId)) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }

        next();
    };
}

/**
 * Session middleware
 */
export function sessionMiddleware() {
    return (req, res, next) => {
        const sessionId = req.headers['x-session-id'];

        if (sessionId) {
            const sessionData = getSession(sessionId);
            if (sessionData) {
                req.session = sessionData;
                req.sessionId = sessionId;
            }
        }

        next();
    };
}

// ============ Security Headers ============

/**
 * Add security headers to response
 */
export function securityHeaders() {
    return (req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy (adjust as needed)
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");

        next();
    };
}

// ============ Export All ============

export const security = {
    // PKCE
    generateCodeVerifier,
    generateCodeChallenge,
    verifyCodeChallenge,

    // State/CSRF
    generateState,
    createSignedState,
    verifySignedState,
    generateCsrfToken,
    verifyCsrfToken,

    // Token encryption
    encryptToken,
    decryptToken,

    // Session management
    createSession,
    getSession,
    updateSession,
    destroySession,
    cleanupSessions,

    // Middleware
    csrfProtection,
    sessionMiddleware,
    securityHeaders
};

export default security;
