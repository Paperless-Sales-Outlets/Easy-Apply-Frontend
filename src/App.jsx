import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import NewConnectionWizard from './pages/NewConnectionWizard';
import ReconnectionWizard from './pages/ReconnectionWizard';
import OwnershipChangeWizard from './pages/OwnershipChangeWizard';
import LocationChangeWizard from './pages/LocationChangeWizard';
import TerminationWizard from './pages/TerminationWizard';
import PackageMigrationWizard from './pages/PackageMigrationWizard';
import ServiceVacationWizard from './pages/ServiceVacationWizard';
import RefundRequestWizard from './pages/RefundRequestWizard';
import CustomerRequestAcceptanceWizard from './pages/CustomerRequestAcceptanceWizard';
import CheckStatusPage from './pages/CheckStatusPage';
import CompletionPage from './pages/CompletionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import OtpProtectedForm from './components/OtpProtectedForm';

const PageWrapper = ({ children, fullBleed = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      style={{ width: '100%' }}
    >
      {fullBleed ? children : <div className="page-container">{children}</div>}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Auth Routes */}
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

        {/* Protected Customer Routes */}
        <Route path="/" element={<ProtectedRoute><PageWrapper fullBleed><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/new-connection" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><NewConnectionWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/reconnection" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><ReconnectionWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/ownership-change" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><OwnershipChangeWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/location-change" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><LocationChangeWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/termination" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><TerminationWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/package-migration" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><PackageMigrationWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/service-vacation" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><ServiceVacationWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/refund-request" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><RefundRequestWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/customer-request-acceptance" element={<ProtectedRoute><PageWrapper><OtpProtectedForm><CustomerRequestAcceptanceWizard /></OtpProtectedForm></PageWrapper></ProtectedRoute>} />
        <Route path="/check-status" element={<ProtectedRoute><PageWrapper><CheckStatusPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/completion" element={<ProtectedRoute><PageWrapper><CompletionPage /></PageWrapper></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <MotionConfig reducedMotion="user">
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="brand-topbar" />
            <Navbar />
            <main className="main-content">
              <ErrorBoundary>
                <AnimatedRoutes />
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </MotionConfig>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
// 
