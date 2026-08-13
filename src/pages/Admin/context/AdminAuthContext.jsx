import React, { createContext, useContext, useState } from 'react';
import api from '../../../utils/api';

const AdminAuthContext = createContext(null);

const SESSION_KEY = 'admin_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => loadSession());

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;

      if (!['Admin', 'Staff'].includes(user.role)) {
        return { ok: false, message: 'Admin or Staff access required for this portal.' };
      }

      // Store JWTs so the shared api client can authenticate admin routes.
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      setAdmin(session);
      saveSession(session);
      return { ok: true, user: session };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { ok: false, message };
    }
  };

  const logout = () => {
    setAdmin(null);
    clearSession();
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch { /* ignore */ }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
