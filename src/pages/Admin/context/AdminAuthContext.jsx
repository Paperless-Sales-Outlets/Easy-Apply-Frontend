import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../../utils/api';

const AdminAuthContext = createContext(null);

const REFRESH_TOKEN_KEY = 'admin_refresh_token';

function loadRefreshToken() {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveRefreshToken(token) {
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch { /* ignore */ }
}

function clearRefreshToken() {
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch { /* ignore */ }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize: try to refresh token if refresh token exists
  useEffect(() => {
    const refreshToken = loadRefreshToken();
    if (refreshToken) {
      refreshAccessToken(refreshToken);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      setAccessToken(accessToken);
      setAdmin(user);
      saveRefreshToken(refreshToken);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setAdmin(null);
      clearRefreshToken();
    }
  };

  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, user } = response.data;
      
      setAccessToken(accessToken);
      setAdmin(user);
      setLoading(false);
    } catch (err) {
      console.error('Token refresh failed:', err);
      clearRefreshToken();
      setAccessToken(null);
      setAdmin(null);
      setLoading(false);
    }
  };

  // Auto-refresh token before expiry (optional enhancement)
  useEffect(() => {
    if (!accessToken) return;

    // Decode JWT to get expiry time (simplified - assumes standard JWT)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const timeUntilExpiry = expiryTime - Date.now();

      // Refresh 5 minutes before expiry
      if (timeUntilExpiry > 0) {
        const timeout = setTimeout(() => {
          const refreshToken = loadRefreshToken();
          if (refreshToken) {
            refreshAccessToken(refreshToken);
          }
        }, Math.max(timeUntilExpiry - 5 * 60 * 1000, 0));

        return () => clearTimeout(timeout);
      }
    } catch (err) {
      console.error('Failed to decode token:', err);
    }
  }, [accessToken]);

  const value = {
    admin,
    accessToken,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!admin && !!accessToken,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
