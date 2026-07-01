import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem 5%', width: '100%' }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-connection" element={<NewConnectionWizard />} />
              <Route path="/reconnection" element={<ReconnectionWizard />} />
              <Route path="/ownership-change" element={<OwnershipChangeWizard />} />
              <Route path="/location-change" element={<LocationChangeWizard />} />
              <Route path="/termination" element={<TerminationWizard />} />
              <Route path="/package-migration" element={<PackageMigrationWizard />} />
              <Route path="/service-vacation" element={<ServiceVacationWizard />} />
              <Route path="/refund-request" element={<RefundRequestWizard />} />
              <Route path="/customer-request-acceptance" element={<CustomerRequestAcceptanceWizard />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
