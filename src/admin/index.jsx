import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import FormsPage from './pages/FormsPage';
import KycReviewPage from './pages/KycReviewPage';
import AppointmentsCalendarPage from './pages/AppointmentsCalendarPage';
import FieldTechnicianPage from './pages/FieldTechnicianPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import UserManagementPage from './pages/UserManagementPage';
import BranchesPage from './pages/BranchesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SalesOfficerManagementPage from './pages/SalesOfficerManagementPage';
import SalesOfficerDashboardPage from './pages/SalesOfficerDashboardPage';
import LeadManagementPage from './pages/LeadManagementPage';
import { canOpenPage, landingPage } from './utils/pageAccess';
import { FORM_TYPES } from './utils/applicationUtils';
import './admin.css';

function getPageFromPath(pathname) {
  const segment = pathname.replace(/\/$/, '').split('/').pop();
  const known = ['dashboard', 'forms', 'applications', 'kyc', 'appointments', 'technician', 'analytics', 'privileges', 'users', 'branches', 'audit-logs', 'sales-officers', 'so-dashboard', 'leads'];
  if (known.includes(segment)) {
    // Old links: /applications is Forms, /privileges is the Privileges tab of User Management.
    if (segment === 'applications') return 'forms';
    if (segment === 'privileges') return 'users';
    return segment;
  }
  return 'dashboard';
}

function AdminDashboardContent() {
  const { admin, login } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState(() => getPageFromPath(location.pathname));
  // With a single form type there is nothing to choose, so a refresh or a direct link opens it.
  const [selectedFormId, setSelectedFormId] = useState(FORM_TYPES.length === 1 ? FORM_TYPES[0].id : null);

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

  // A page this account has no privilege for falls back to its first allowed one.
  const effectivePage = canOpenPage(admin, activePage) ? activePage : landingPage(admin);
  const usersTab = location.pathname.replace(/\/$/, '').endsWith('/privileges') ? 'privileges' : 'team';

  const renderActivePage = () => {
    switch (effectivePage) {
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
        return <ReportsAnalyticsPage />;
      case 'users':
        return <UserManagementPage key={usersTab} initialTab={usersTab} />;
      case 'branches':
        return <BranchesPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'sales-officers':
        return <SalesOfficerManagementPage />;
      case 'so-dashboard':
        return <SalesOfficerDashboardPage />;
      case 'leads':
        return <LeadManagementPage />;
      case null:
        return (
          <div className="admin-notice admin-notice-info" role="status">
            <span className="admin-notice-text">
              Your account has no modules assigned yet. Ask an administrator to update your role in User Management.
            </span>
          </div>
        );
      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <AdminLayout
      activePage={effectivePage}
      setActivePage={handleSetActivePage}
      onSelectForm={handleSelectForm}
      activeFormId={effectivePage === 'forms' ? selectedFormId : null}
    >
      {renderActivePage()}
    </AdminLayout>
  );
}

/** Admin portal entry: picks the page for the current /admin/* route inside the shared layout. */
export default function AdminDashboardIndex() {
  return <AdminDashboardContent />;
}
