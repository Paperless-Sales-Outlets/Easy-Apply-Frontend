import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

function getPageFromPath(pathname) {
  const segment = pathname.replace(/\/$/, '').split('/').pop();
  const known = ['dashboard', 'forms', 'applications', 'kyc', 'appointments', 'technician', 'analytics', 'privileges'];
  if (known.includes(segment)) {
    return segment === 'applications' ? 'forms' : segment;
  }
  return 'dashboard';
}

function AdminDashboardContent() {
  const { admin, login } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState(() => getPageFromPath(location.pathname));
  const [selectedFormId, setSelectedFormId] = useState(null);

  useEffect(() => {
    const page = getPageFromPath(location.pathname);
    setActivePage(page);
  }, [location.pathname]);

  const handleSetActivePage = (pageKey) => {
    setActivePage(pageKey);
    const targetPath = pageKey === 'dashboard' ? '/admin' : `/admin/${pageKey}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  // If not logged in, render the login page
  if (!admin) {
    return <AdminLoginPage onLogin={login} />;
  }

  const handleSelectForm = (formId) => {
    setSelectedFormId(formId);
    handleSetActivePage('forms');
  };

  // Render correct page view
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboardPage />;
      case 'forms':
        return <FormsPage initialFormId={selectedFormId} />;
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
      setActivePage={handleSetActivePage}
      onSelectForm={handleSelectForm}
      activeFormId={selectedFormId}
    >
      {renderActivePage()}
    </AdminLayout>
  );
}

export default function AdminDashboardIndex() {
  return <AdminDashboardContent />;
}
