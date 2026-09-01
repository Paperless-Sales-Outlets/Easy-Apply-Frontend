import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

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
import InternetServicesWizard from './pages/InternetServicesWizard';

import CheckStatusPage from './pages/CheckStatusPage';
import CompletionPage from './pages/CompletionPage';
import ThankYouPage from './pages/ThankYouPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import AdminDashboard from './pages/Admin';
import AddToCartPage from './pages/AddToCartPage';
import ServicesPage from './pages/ServicesPage';

import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import HelpSupportPage from './pages/HelpSupportPage';
import MyProfilePage from './pages/MyProfilePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingCartButton from './components/layout/FloatingCartButton';
import ErrorBoundary from './components/ErrorBoundary';
import SessionGate from './components/SessionGate';

import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/authSession';
import AdminLoginPage from './pages/Admin/pages/AdminLoginPage';
import { AdminAuthProvider } from './pages/Admin/context/AdminAuthContext';
import { CartProvider } from './context/CartContext';

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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Dashboard */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <PageWrapper fullBleed>
                <Dashboard />
              </PageWrapper>
            </RequireAuth>
          }
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

        {/* Services Page */}
        <Route
          path="/services"
          element={
            <RequireAuth>
              <PageWrapper fullBleed>
                <ServicesPage />
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

        {/* Customer Request Wizards */}
        <Route
          path="/new-connection"
          element={
            <PageWrapper form>
              <SessionGate requireExistingCustomer={false}>
                <NewConnectionWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/reconnection"
          element={
            <PageWrapper form>
              <SessionGate>
                <ReconnectionWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/ownership-change"
          element={
            <PageWrapper form>
              <SessionGate>
                <OwnershipChangeWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/location-change"
          element={
            <PageWrapper form>
              <SessionGate>
                <LocationChangeWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/termination"
          element={
            <PageWrapper form>
              <SessionGate>
                <TerminationWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/package-migration"
          element={
            <PageWrapper form>
              <SessionGate>
                <PackageMigrationWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/service-vacation"
          element={
            <PageWrapper form>
              <SessionGate>
                <ServiceVacationWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/refund-request"
          element={
            <PageWrapper form>
              <SessionGate>
                <RefundRequestWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/customer-request-acceptance"
          element={
            <PageWrapper form>
              <SessionGate>
                <CustomerRequestAcceptanceWizard />
              </SessionGate>
            </PageWrapper>
          }
        />

        <Route
          path="/internet-services"
          element={
            <PageWrapper form>
              <SessionGate>
                <InternetServicesWizard />
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
            <SessionGate requireExistingCustomer={false}>
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

        {/* Payment Gateway Cart */}
        <Route
          path="/add-to-cart"
          element={
            <RequireAuth>
              <PageWrapper fullBleed>
                <AddToCartPage />
              </PageWrapper>
            </RequireAuth>
          }
        />

        {/* Admin Portal — Public Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Portal — Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/technician"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/privileges"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
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
  // Sign-in and registration are shown on their own — no site header, footer or
  // cart button competing with the form.
  const isAuthScreen = ['/login', '/signup'].includes(location.pathname);

  if (isAdmin || isAuthScreen) {
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
          <CartProvider>
            <NavigationLayout>
              <AnimatedRoutes />
            </NavigationLayout>
          </CartProvider>
        </AdminAuthProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
