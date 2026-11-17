import React, { createContext, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config/api';

export const AuthContext = createContext();
const MAX_TIMEOUT = 2147483647;

// This reads expiry for client-side navigation only. The server still verifies JWT signatures.
export function getTokenExpiration(token) {
  try {
    if (typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some(part => !part)) return null;
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    payload += '='.repeat((4 - payload.length % 4) % 4);
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' && Number.isFinite(exp * 1000) && exp > 0 ? exp * 1000 : null;
  } catch { return null; }
}
function storedToken() { try { return localStorage.getItem('token'); } catch { return null; } }
function isCurrent(token) { const expires = getTokenExpiration(token); return expires !== null && expires > Date.now(); }

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => { const value = storedToken(); return isCurrent(value) ? value : null; });
  const clearSession = useCallback(() => {
    try { localStorage.removeItem('token'); localStorage.removeItem('likedArticles'); } catch { /* Storage may be disabled. */ }
    setToken(null);
  }, []);
  const syncSession = useCallback(() => {
    const value = storedToken();
    if (isCurrent(value)) setToken(value);
    else clearSession();
  }, [clearSession]);
  const setIsAuthenticated = useCallback(value => {
    if (value) syncSession(); else clearSession();
  }, [syncSession, clearSession]);

  useEffect(() => {
    syncSession();
    const storageChanged = event => { if (event.key === 'token' || event.key === null) syncSession(); };
    const visible = () => { if (document.visibilityState === 'visible') syncSession(); };
    window.addEventListener('storage', storageChanged);
    window.addEventListener('focus', syncSession);
    document.addEventListener('visibilitychange', visible);
    return () => { window.removeEventListener('storage', storageChanged); window.removeEventListener('focus', syncSession); document.removeEventListener('visibilitychange', visible); };
  }, [syncSession]);

  useEffect(() => {
    if (!token) return;
    let timer;
    const check = () => {
      if (storedToken() !== token) { syncSession(); return; }
      const remaining = (getTokenExpiration(token) || 0) - Date.now();
      if (remaining <= 0) { clearSession(); return; }
      timer = setTimeout(check, Math.min(remaining, MAX_TIMEOUT));
    };
    check();
    return () => clearTimeout(timer);
  }, [token, clearSession, syncSession]);

  useEffect(() => {
    const id = axios.interceptors.response.use(response => response, error => {
      const current = storedToken();
      const headers = error.config?.headers;
      const authorization = headers?.get?.('Authorization') || headers?.Authorization || headers?.authorization;
      if (error.response?.status === 401 && current && authorization === 'Bearer ' + current) {
        try {
          const base = new URL(API_BASE_URL, window.location.origin);
          const request = new URL(error.config.url, window.location.origin);
          const authEndpoint = /\/(login|signup)\/?$/.test(request.pathname);
          if (request.origin === base.origin && request.pathname.startsWith(base.pathname + '/') && !authEndpoint) clearSession();
        } catch { /* Ignore unrelated or malformed request URLs. */ }
      }
      return Promise.reject(error);
    });
    return () => axios.interceptors.response.eject(id);
  }, [clearSession]);

  return <AuthContext.Provider value={{ isAuthenticated: Boolean(token), setIsAuthenticated }}>{children}</AuthContext.Provider>;
};
