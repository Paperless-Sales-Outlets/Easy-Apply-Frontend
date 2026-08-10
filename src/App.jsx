import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
import AdminDashboard from './pages/Admin';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import OtpProtectedForm from './components/OtpProtectedForm';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';

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

const VerifyPhonePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const targetRoute = location.state?.redirectTo || '/reconnection';

  return (
    <OtpProtectedForm onVerified={() => navigate(targetRoute, { state: location.state })}>
      <div />
    </OtpProtectedForm>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Dashboard & Catalog Routes */}
        <Route path="/" element={<PageWrapper fullBleed><Dashboard /></PageWrapper>} />
        <Route path="/new-connection/products" element={<PageWrapper fullBleed><ProductCatalogPage /></PageWrapper>} />
        <Route path="/new-connection/product/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper fullBleed><CartPage /></PageWrapper>} />
        <Route path="/customer-selection" element={<Navigate to="/new-connection" replace />} />
        <Route path="/verify-phone" element={<PageWrapper fullBleed><VerifyPhonePage /></PageWrapper>} />

        {/* Wizard Routes (Protected by OTP) */}
        <Route path="/new-connection" element={<PageWrapper><OtpProtectedForm><NewConnectionWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/reconnection" element={<PageWrapper><OtpProtectedForm><ReconnectionWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/ownership-change" element={<PageWrapper><OtpProtectedForm><OwnershipChangeWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/location-change" element={<PageWrapper><OtpProtectedForm><LocationChangeWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/termination" element={<PageWrapper><OtpProtectedForm><TerminationWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/package-migration" element={<PageWrapper><OtpProtectedForm><PackageMigrationWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/service-vacation" element={<PageWrapper><OtpProtectedForm><ServiceVacationWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/refund-request" element={<PageWrapper><OtpProtectedForm><RefundRequestWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/customer-request-acceptance" element={<PageWrapper><OtpProtectedForm><CustomerRequestAcceptanceWizard /></OtpProtectedForm></PageWrapper>} />
        <Route path="/check-status" element={<PageWrapper><CheckStatusPage /></PageWrapper>} />
        <Route path="/completion" element={<PageWrapper><CompletionPage /></PageWrapper>} />

        {/* Operations Admin Portal */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};


const NavigationLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="brand-topbar" />
      <Navbar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <MotionConfig reducedMotion="user">
        <NavigationLayout>
          <AnimatedRoutes />
        </NavigationLayout>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
