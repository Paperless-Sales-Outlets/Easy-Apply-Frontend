import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api';

const AdminAuthContext = createContext(null);

const SESSION_KEY = 'admin_session';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('refreshToken');
  } catch { /* ignore */ }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => loadSession());
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Token auto-refresh logic using stored refreshToken from sessionStorage
  const refreshAuthToken = useCallback(async () => {
    const storedRefreshToken = sessionStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      return null;
    }
    try {
      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
      const newAccessToken = response.data.accessToken;
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        return newAccessToken;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      setAccessToken(null);
      setAdmin(null);
      clearSession();
    }
    return null;
  }, []);

  // Auto-refresh token on mount or when session exists without memory token
  useEffect(() => {
    if (admin && !accessToken) {
      refreshAuthToken();
    }
  }, [admin, accessToken, refreshAuthToken]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      if (!['Admin', 'Staff'].includes(user.role)) {
        const msg = 'Admin or Staff access required for this portal.';
        setError(msg);
        return { ok: false, message: msg };
      }

      // 3. Store accessToken in memory (React state) - NOT localStorage
      setAccessToken(newAccessToken);

      // 4. Store refreshToken safely in sessionStorage (fallback for HttpOnly cookie)
      if (newRefreshToken) {
        sessionStorage.setItem('refreshToken', newRefreshToken);
      }

      const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      setAdmin(session);
      saveSession(session);
      return { ok: true, user: session };
    } catch (err) {
      // 5. Surface actual error message returned from backend API
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 6. Call POST /api/auth/logout
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear in-memory accessToken and stored refreshToken/session
      setAdmin(null);
      setAccessToken(null);
      clearSession();
    }
  };

  const value = {
    admin,
    accessToken,
    loading,
    error,
    login,
    logout,
    refreshAuthToken,
    isAuthenticated: !!admin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
