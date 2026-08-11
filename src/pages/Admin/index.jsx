import React, { useEffect, useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import FormsPage from './pages/FormsPage';
import KycReviewPage from './pages/KycReviewPage';
import AppointmentsCalendarPage from './pages/AppointmentsCalendarPage';
import FieldTechnicianPage from './pages/FieldTechnicianPage';
import AdoptionMonitoringPage from './pages/AdoptionMonitoringPage';
import UserPrivilegesPage from './pages/UserPrivilegesPage';
import './admin.css';

const COMMENTS_STORAGE_KEY = 'adminApplicationComments';

function AdminDashboardContent() {
  const { admin, login } = useAdminAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [applicationComments, setApplicationComments] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (raw) {
      try {
        setApplicationComments(JSON.parse(raw));
      } catch (error) {
        console.warn('Failed to load saved application comments:', error);
      }
    }
  }, []);

  const persistComments = (nextComments) => {
    setApplicationComments((prev) => {
      const nextValue = typeof nextComments === 'function'
        ? nextComments(prev)
        : nextComments;

      try {
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(nextValue));
      } catch (error) {
        console.warn('Failed to save application comments:', error);
      }

      return nextValue;
    });
  };

  const handleSaveComment = (appId, comment) => {
    persistComments(prev => ({
      ...prev,
      [appId]: comment,
    }));
  };

  // If not logged in, render the login page
  if (!admin) {
    return <AdminLoginPage onLogin={login} />;
  }

  const handleSelectForm = (formId) => {
    setSelectedFormId(formId);
    setActivePage('forms');
  };

  // Render correct page view
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboardPage commentMap={applicationComments} onSaveComment={handleSaveComment} />;
      case 'forms':
        return <FormsPage
          initialFormId={selectedFormId}
          commentMap={applicationComments}
          onSaveComment={handleSaveComment}
        />;
      case 'kyc':
        return <KycReviewPage />;
      case 'appointments':
        return <AppointmentsCalendarPage />;
      case 'technician':
        return <FieldTechnicianPage />;
      case 'analytics':
        return <AdoptionMonitoringPage />;
      case 'privileges':
        return <UserPrivilegesPage />;
      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <AdminLayout
      activePage={activePage}
      setActivePage={setActivePage}
      onSelectForm={handleSelectForm}
      activeFormId={selectedFormId}
    >
      {renderActivePage()}
    </AdminLayout>
  );
}

export default function AdminDashboardIndex() {
  return (
    <AdminAuthProvider>
      <AdminDashboardContent />
    </AdminAuthProvider>
  );
}
