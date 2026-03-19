const FALLBACK_PROD_API = 'https://leave-management-system-3x9b.onrender.com';

function inferDefaultApiBaseUrl() {
  // 1) Preferred: explicit env vars (Vercel / CRA)
  const fromEnv =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API;
  if (fromEnv) return String(fromEnv);

  // 2) If running locally, default to local backend
  if (typeof window !== 'undefined') {
    const host = window.location?.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000';
  }

  // 3) Otherwise use your deployed backend
  return FALLBACK_PROD_API;
}

export const API_BASE_URL = inferDefaultApiBaseUrl().replace(/\/+$/, '');

export function apiUrl(path) {
  const cleanPath = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

