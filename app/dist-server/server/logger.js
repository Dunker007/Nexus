/**
 * Structured logger — emits JSON in production (Cloud Logging compatible),
 * human-readable in development.
 *
 * In production, error entries include a `stack` field which GCP Error Reporting
 * automatically picks up from Cloud Logging without needing the separate SDK.
 */
const isProd = process.env.NODE_ENV === 'production';
function log(level, message, meta) {
    if (isProd) {
        // Cloud Logging severity mapping
        const severity = level === 'debug' ? 'DEBUG'
            : level === 'info' ? 'INFO'
                : level === 'warn' ? 'WARNING'
                    : 'ERROR';
        process.stdout.write(JSON.stringify({ severity, message, ...meta, timestamp: new Date().toISOString() }) + '\n');
    }
    else {
        const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'debug' ? '🔍' : '✅';
        const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
        console.log(`${prefix} [${level.toUpperCase()}] ${message}${metaStr}`);
    }
}
export const logger = {
    debug: (msg, meta) => log('debug', msg, meta),
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
};
