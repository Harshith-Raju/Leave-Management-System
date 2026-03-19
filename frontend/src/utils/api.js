export const API_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export function apiUrl(path) {
  const cleanPath = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

