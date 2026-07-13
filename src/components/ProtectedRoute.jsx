import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: '1rem' 
        }}
      >
        <div 
          className="spinner"
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--border-color)',
            borderTop: '4px solid var(--slt-green)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading account...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
