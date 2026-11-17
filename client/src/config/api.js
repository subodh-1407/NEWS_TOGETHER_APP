export function normalizeApiBase(value) {
  const root = value.trim().replace(/\/+$/, '').replace(/\/api(?:\/v1)?$/, '');
  return root + '/api/v1';
}
const configured = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL;
const fallback = process.env.NODE_ENV === 'production' ? 'https://news-together-app.onrender.com' : 'http://localhost:4000';
export const API_BASE_URL = normalizeApiBase(configured || fallback);
