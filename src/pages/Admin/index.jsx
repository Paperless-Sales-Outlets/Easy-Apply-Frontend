import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ApplicationsListPage from './pages/ApplicationsListPage';
import KycReviewPage from './pages/KycReviewPage';
import AppointmentsCalendarPage from './pages/AppointmentsCalendarPage';
import FieldTechnicianPage from './pages/FieldTechnicianPage';
import AdoptionMonitoringPage from './pages/AdoptionMonitoringPage';
import './admin.css';

function AdminDashboardContent() {
  const { admin, login } = useAdminAuth();
  const [activePage, setActivePage] = useState('dashboard');

  // If not logged in, render the login page
  if (!admin) {
    return <AdminLoginPage onLogin={login} />;
  }

  // Render correct page view
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboardPage setActivePage={setActivePage} />;
      case 'applications':
        return <ApplicationsListPage />;
      case 'kyc':
        return <KycReviewPage />;
      case 'appointments':
        return <AppointmentsCalendarPage />;
      case 'technician':
        return <FieldTechnicianPage />;
      case 'analytics':
        return <AdoptionMonitoringPage />;
      default:
        return <AdminDashboardPage setActivePage={setActivePage} />;
    }
  };

  return (
    <AdminLayout activePage={activePage} setActivePage={setActivePage}>
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
