import React, { createContext, useContext, useState } from 'react';
import { DUMMY_USER } from '../data/dummyData';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  // In production: replace with real JWT login flow
  const [admin, setAdmin] = useState(null);

  const login = (email, password) => {
    // Dummy login — accept any credentials in demo mode
    // Production: POST /api/auth/login → verify JWT role claim
    if (email && password) {
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
