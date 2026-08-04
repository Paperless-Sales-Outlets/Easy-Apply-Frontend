import React, { createContext, useContext, useState } from 'react';
import { DUMMY_USER } from '../data/dummyData';

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

  const login = (email, password) => {
    const ADMIN_EMAIL = 'admin@slt.lk';
    const ADMIN_PASSWORD = 'admin123';
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const session = { ...DUMMY_USER, email };
      setAdmin(session);
      saveSession(session);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    clearSession();
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
