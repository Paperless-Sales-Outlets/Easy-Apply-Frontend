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
import AdminDashboard from './pages/Admin';
import AddToCartPage from './pages/AddToCartPage';
import ServicesPage from './pages/ServicesPage';

import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import HelpSupportPage from './pages/HelpSupportPage';
import MyProfilePage from './pages/MyProfilePage';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingCartButton from './components/layout/FloatingCartButton';
import ErrorBoundary from './components/ErrorBoundary';
import OtpProtectedForm from './components/OtpProtectedForm';

import { CartProvider } from './context/CartContext';

const PageWrapper = ({ children, fullBleed = false, form = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className={fullBleed ? undefined : form ? 'page-shell--form' : 'page-shell'}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

const VerifyPhonePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const targetRoute = location.state?.redirectTo || '/profile';

  return (
    <OtpProtectedForm
      onVerified={() =>
        navigate(targetRoute, {
          state: location.state,
        })
      }
    >
      <div />
    </OtpProtectedForm>
  );
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
            <PageWrapper fullBleed>
              <Dashboard />
            </PageWrapper>
          }
        />

        {/* Product Catalog */}
        <Route
          path="/new-connection/products"
          element={
            <PageWrapper fullBleed>
              <ProductCatalogPage />
            </PageWrapper>
          }
        />

        {/* Services Page */}
        <Route
          path="/services"
          element={
            <PageWrapper fullBleed>
              <ServicesPage />
            </PageWrapper>
          }
        />

        <Route
          path="/new-connection/product/:id"
          element={
            <PageWrapper>
              <ProductDetailPage />
            </PageWrapper>
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <PageWrapper fullBleed>
              <CartPage />
            </PageWrapper>
          }
        />

        {/* Customer Selection */}
        <Route
          path="/customer-selection"
          element={<Navigate to="/new-connection" replace />}
        />

        {/* Phone Verification */}
        <Route
          path="/verify-phone"
          element={
            <PageWrapper fullBleed>
              <VerifyPhonePage />
            </PageWrapper>
          }
        />

        {/* Customer Request Wizards */}
        <Route
          path="/new-connection"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <NewConnectionWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/reconnection"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <ReconnectionWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/ownership-change"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <OwnershipChangeWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/location-change"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <LocationChangeWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/termination"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <TerminationWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/package-migration"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <PackageMigrationWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/service-vacation"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <ServiceVacationWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/refund-request"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <RefundRequestWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/customer-request-acceptance"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <CustomerRequestAcceptanceWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/internet-services"
          element={
            <PageWrapper form>
              <OtpProtectedForm>
                <InternetServicesWizard />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

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
            <PageWrapper>
              <OtpProtectedForm>
                <MyProfilePage />
              </OtpProtectedForm>
            </PageWrapper>
          }
        />

        <Route
          path="/check-status"
          element={
            <PageWrapper>
              <CheckStatusPage />
            </PageWrapper>
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

        {/* Payment Gateway Cart */}
        <Route
          path="/add-to-cart"
          element={
            <PageWrapper fullBleed>
              <AddToCartPage />
            </PageWrapper>
          }
        />

        {/* Admin Portal */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Routes>
    </AnimatePresence>
  );
};

const NavigationLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
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
        <CartProvider>
          <NavigationLayout>
            <AnimatedRoutes />
          </NavigationLayout>
        </CartProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;