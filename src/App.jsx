import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewConnectionWizard from './pages/NewConnectionWizard';
import InternetServicesWizard from './pages/InternetServicesWizard';
import OwnershipChangeWizard from './pages/OwnershipChangeWizard';
import LocationChangeWizard from './pages/LocationChangeWizard';
import TerminationWizard from './pages/TerminationWizard';
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
              <Route path="/internet-services" element={<InternetServicesWizard />} />
              <Route path="/ownership-change" element={<OwnershipChangeWizard />} />
              <Route path="/location-change" element={<LocationChangeWizard />} />
              <Route path="/termination" element={<TerminationWizard />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
