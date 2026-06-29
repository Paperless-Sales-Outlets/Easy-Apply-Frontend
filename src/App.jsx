import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewConnectionWizard from './pages/NewConnectionWizard';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-connection" element={<NewConnectionWizard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
