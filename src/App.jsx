import React, { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Customer pages are code-split so initial bundle stays lightweight
const Dashboard = lazy(() => import('./customer/pages/Dashboard'));
const NewConnectionWizard = lazy(() => import('./customer/pages/NewConnectionWizard'));
const CheckStatusPage = lazy(() => import('./customer/pages/CheckStatusPage'));
const CompletionPage = lazy(() => import('./customer/pages/CompletionPage'));
const InstallationSchedulingPage = lazy(() => import('./customer/pages/InstallationSchedulingPage'));
const ThankYouPage = lazy(() => import('./customer/pages/ThankYouPage'));
const PaymentSuccessPage = lazy(() => import('./customer/pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./customer/pages/PaymentCancelPage'));
const ProductCatalogPage = lazy(() => import('./customer/pages/ProductCatalogPage'));
const ProductDetailPage = lazy(() => import('./customer/pages/ProductDetailPage'));
const CartPage = lazy(() => import('./customer/pages/CartPage'));
const HelpSupportPage = lazy(() => import('./customer/pages/HelpSupportPage'));
const MyProfilePage = lazy(() => import('./customer/pages/MyProfilePage'));
const SignUpPage = lazy(() => import('./customer/pages/SignUpPage'));
const LoginPage = lazy(() => import('./customer/pages/LoginPage'));
const LandingPage = lazy(() => import('./customer/pages/LandingPage'));

import Navbar from './customer/components/layout/Navbar';
import Footer from './customer/components/layout/Footer';
import FloatingCartButton from './customer/components/layout/FloatingCartButton';
import ErrorBoundary from './shared/components/ErrorBoundary';
import SessionGate from './customer/components/SessionGate';

import ProtectedRoute from './customer/components/ProtectedRoute';
import { isAuthenticated } from './shared/utils/authSession';
import SessionTimeoutHandler from './customer/components/SessionTimeoutHandler';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import SLTLoader from './shared/components/SLTLoader';

const RouteSuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
    <SLTLoader size={60} />
  </div>
);

// Admin portal is code-split so customers never download it.
const AdminDashboard = lazy(() => import('./admin'));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));

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
    const expiredMsg = sessionStorage.getItem('easyapply:session_expired_message');
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname + location.search,
          sessionExpired: !!expiredMsg,
          message: expiredMsg || undefined,
        }}
        replace
      />
    );
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

/** Every new page starts at the top, not wherever the previous one was scrolled. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return; // let in-page anchors do their own scrolling
    // 'instant' overrides the site-wide smooth scrolling so it doesn't visibly glide up
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
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
      {/* Site-wide notices (e.g. the unfinished-application banner) render here, above the sticky nav */}
      <div id="top-notice-root" />
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
            borderRadius: 'var(--radius-lg)',
            background: 'var(--paper)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            boxShadow: 'var(--shadow-md)',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: 'var(--slt-green)',
              secondary: 'var(--paper)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger, #dc3545)',
              secondary: 'var(--paper)',
            },
          },
        }}
      />

      <MotionConfig reducedMotion="user">
        <AdminAuthProvider>
          <SessionTimeoutHandler />
          <NavigationLayout>
            <SalesRefCapture />
            <Suspense fallback={<RouteSuspenseFallback />}>
              <ScrollToTop />
              <AnimatedRoutes />
            </Suspense>
          </NavigationLayout>
        </AdminAuthProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
