export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { loadSecrets } = await import('./lib/gcp/secrets');
    // This runs exactly once when the Next.js server starts up.
    // It is the safest place to fetch Google Cloud Secrets before the app needs them.
    await loadSecrets();
  }
}
