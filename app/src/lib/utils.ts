/**
 * Nexus Utility Functions
 */

export const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:3456';

/**
 * Standard fetch wrapper for the Bridge API
 */
export async function bridgeFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${BRIDGE_URL}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Bridge request failed' }));
    throw new Error(error.message || `Bridge error: ${response.status}`);
  }

  return response;
}

/**
 * Class name merger
 */
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
