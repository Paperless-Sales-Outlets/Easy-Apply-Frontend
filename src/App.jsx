import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/new-connection" element={<PageWrapper><NewConnectionWizard /></PageWrapper>} />
        <Route path="/reconnection" element={<PageWrapper><ReconnectionWizard /></PageWrapper>} />
        <Route path="/ownership-change" element={<PageWrapper><OwnershipChangeWizard /></PageWrapper>} />
        <Route path="/location-change" element={<PageWrapper><LocationChangeWizard /></PageWrapper>} />
        <Route path="/termination" element={<PageWrapper><TerminationWizard /></PageWrapper>} />
        <Route path="/package-migration" element={<PageWrapper><PackageMigrationWizard /></PageWrapper>} />
        <Route path="/service-vacation" element={<PageWrapper><ServiceVacationWizard /></PageWrapper>} />
        <Route path="/refund-request" element={<PageWrapper><RefundRequestWizard /></PageWrapper>} />
        <Route path="/customer-request-acceptance" element={<PageWrapper><CustomerRequestAcceptanceWizard /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem 5%', width: '100%', display: 'flex', flexDirection: 'column' }}>
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
