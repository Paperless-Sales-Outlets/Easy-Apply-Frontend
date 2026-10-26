import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import Dashboard from './pages/Dashboard';
import NewConnectionWizard from './pages/NewConnectionWizard';

import CheckStatusPage from './pages/CheckStatusPage';
import CompletionPage from './pages/CompletionPage';
import InstallationSchedulingPage from './pages/InstallationSchedulingPage';
import ThankYouPage from './pages/ThankYouPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import AdminDashboard from './pages/Admin';

import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import HelpSupportPage from './pages/HelpSupportPage';
import MyProfilePage from './pages/MyProfilePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingCartButton from './components/layout/FloatingCartButton';
import ErrorBoundary from './components/ErrorBoundary';
import SessionGate from './components/SessionGate';

import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/authSession';
import AdminLoginPage from './pages/Admin/pages/AdminLoginPage';
import { AdminAuthProvider } from './pages/Admin/context/AdminAuthContext';

const PageWrapper = ({ children, fullBleed = false, form = false }) => {
  return (
    <motion.div
      // A plain cross-fade. The previous version also slid the page 12px
      // vertically, which read as a jump on every navigation.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={fullBleed ? undefined : form ? 'page-shell--form' : 'page-shell'}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Everything a signed-in customer can reach. Anyone who isn't signed in is
 * bounced to the auth screen, which is where phone/OTP or email/password
 * verification now happens — once, instead of on every form.
 */
const RequireAuth = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return children;
};

/**
 * Captures a Sales Officer QR token (?salesRef=) on whichever page the
 * customer lands, so auth redirects or refreshes can't drop the attribution.
 */
const SalesRefCapture = () => {
  const { search } = useLocation();
  useEffect(() => {
    const ref = new URLSearchParams(search).get('salesRef');
    if (ref) {
      try { sessionStorage.setItem('so_sales_ref', ref); } catch { /* storage unavailable */ }
    }
  }, [search]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* Admin pages share one key so switching between them keeps the portal mounted */}
      <Routes location={location} key={/^\/admin(?!\/login)/.test(location.pathname) ? '/admin' : location.pathname}>
        {/* Main Dashboard / Landing Entry */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <PageWrapper fullBleed>
                <Dashboard />
              </PageWrapper>
            ) : (
              <LandingPage />
            )
          }
        />

        <Route
          path="/welcome"
          element={<LandingPage />}
        />

        <Route
          path="/landing"
          element={<LandingPage />}
        />

        {/* Product Catalog */}
        <Route
          path="/new-connection/products"
          element={
            <RequireAuth>
              <PageWrapper fullBleed>
                <ProductCatalogPage />
              </PageWrapper>
            </RequireAuth>
          }
        />

        <Route
          path="/new-connection/product/:id"
          element={
            <RequireAuth>
              <PageWrapper>
                <ProductDetailPage />
              </PageWrapper>
            </RequireAuth>
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <PageWrapper fullBleed>
                <CartPage />
              </PageWrapper>
            </RequireAuth>
          }
        />

        {/* Customer Selection */}
        <Route
          path="/customer-selection"
          element={<Navigate to="/new-connection" replace />}
        />

        {/* Legacy phone-verification entry point — sign-in lives on /login now */}
        <Route path="/verify-phone" element={<Navigate to="/login" replace />} />

        {/* New Connection Wizard */}
        <Route
          path="/new-connection"
          element={
            <PageWrapper form>
              <SessionGate>
                <NewConnectionWizard />
              </SessionGate>
            </PageWrapper>
          }
        />










        {/* Auth — rendered without the site header/footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* General Pages */}
        <Route
          path="/help"
          element={
            <PageWrapper>
              <HelpSupportPage />
            </PageWrapper>
          }
        />
        <Route
          path="/profile"
          element={
            <SessionGate>
              <PageWrapper>
                <MyProfilePage />
              </PageWrapper>
            </SessionGate>
          }
        />

        <Route
          path="/check-status"
          element={
            <RequireAuth>
              <PageWrapper>
                <CheckStatusPage />
              </PageWrapper>
            </RequireAuth>
          }
        />

        <Route
          path="/completion"
          element={
            <PageWrapper>
              <CompletionPage />
            </PageWrapper>
          }
        />

        <Route
          path="/schedule-installation"
          element={
            <PageWrapper fullBleed>
              <InstallationSchedulingPage />
            </PageWrapper>
          }
        />

        <Route
          path="/schedule-installation/:ref"
          element={
            <PageWrapper fullBleed>
              <InstallationSchedulingPage />
            </PageWrapper>
          }
        />

        <Route
          path="/thank-you"
          element={
            <PageWrapper>
              <ThankYouPage />
            </PageWrapper>
          }
        />

        {/* PayHere Return URLs */}
        <Route
          path="/payment/success"
          element={
            <PageWrapper>
              <PaymentSuccessPage />
            </PageWrapper>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <PageWrapper>
              <PaymentCancelPage />
            </PageWrapper>
          }
        />

        {/* Admin Portal — Public Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Portal — one catch-all route so navigating between admin pages does not remount the portal (and lose its state) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const NavigationLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  // Landing, sign-in and registration are shown on their own — no site header, footer or
  // cart button competing with the hero or form.
  const isAuthOrLanding =
    ['/login', '/signup', '/welcome', '/landing'].includes(location.pathname) ||
    (location.pathname === '/' && !isAuthenticated());

  if (isAdmin || isAuthOrLanding) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <main
          className="main-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />

      <main
        className="main-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <Footer />
      <FloatingCartButton />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: 'var(--text-primary)',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: 'var(--slt-green)',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger, #dc3545)',
              secondary: '#fff',
            },
          },
        }}
      />

      <MotionConfig reducedMotion="user">
        <AdminAuthProvider>
          <NavigationLayout>
            <SalesRefCapture />
            <AnimatedRoutes />
          </NavigationLayout>
        </AdminAuthProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
