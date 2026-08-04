import React, { createContext, useContext, useState } from 'react';
import { DUMMY_USER } from '../data/dummyData';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  // In production: replace with real JWT login flow
  const [admin, setAdmin] = useState(null);

  const login = (email, password) => {
    // Fixed credentials — only accept the specified admin account
    const ADMIN_EMAIL = 'admin@slt.lk';
    const ADMIN_PASSWORD = 'admin123';
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAdmin({ ...DUMMY_USER, email });
      return true;
    }
    return false;
  };

  const logout = () => setAdmin(null);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
