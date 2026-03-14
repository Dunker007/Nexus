/**
 * Structured logger — emits JSON in production (Cloud Logging compatible),
 * human-readable in development.
 *
 * In production, error entries include a `stack` field which GCP Error Reporting
 * automatically picks up from Cloud Logging without needing the separate SDK.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = process.env.NODE_ENV === 'production';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (isProd) {
    // Cloud Logging severity mapping
    const severity = level === 'debug' ? 'DEBUG'
      : level === 'info'  ? 'INFO'
      : level === 'warn'  ? 'WARNING'
      : 'ERROR';
    process.stdout.write(JSON.stringify({ severity, message, ...meta, timestamp: new Date().toISOString() }) + '\n');
  } else {
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'debug' ? '🔍' : '✅';
    const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
    console.log(`${prefix} [${level.toUpperCase()}] ${message}${metaStr}`);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
