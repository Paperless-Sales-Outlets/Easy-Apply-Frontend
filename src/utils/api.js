import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create an instance of Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── In-Memory Admin Access Token Accessor ─────────────────────────────────────
let adminAccessToken = null;
let onForceLogout = null;

export const setAdminAccessToken = (token) => {
  adminAccessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setAdminLogoutHandler = (handler) => {
  onForceLogout = handler;
};

// ── Session ID ─────────────────────────────────────────────────────────────
// Provides a stable, anonymous cart session without requiring login.
const getSessionId = () => {
  let sid = localStorage.getItem('slt_session_id');
  if (!sid) {
    // Generate a simple UUID-like identifier on first visit
    sid = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('slt_session_id', sid);
  }
  return sid;
};

/**
 * Clear the cart after a successful application submission or payment.
 *
 * There are two cart stores that must both be cleared:
 *   1. localStorage key "easy_apply_cart"  — productService local cart
 *   2. localStorage key "slt_session_id"   — backend session ID for MongoDB cart
 *
 * Both steps are attempted independently so a backend failure does not
 * block the localStorage clean-up.
 */
export const clearSessionCart = async () => {
  // 1. Tell the backend to empty the MongoDB cart for this session
  try {
    await api.delete('/cart/clear');
  } catch (err) {
    // Non-fatal — the 7-day TTL index will eventually clean up the DB document
    console.warn('Could not clear cart on server:', err?.response?.data?.message || err.message);
  }

  // 2. Wipe the local cart stored in localStorage by productService.js
  try {
    localStorage.removeItem('easy_apply_cart');   // ← the actual key used by productService
    localStorage.removeItem('slt_session_id');    // ← backend session ID (starts a fresh cart session)
    sessionStorage.removeItem('selectedProduct'); // ← product carried into the checkout form
  } catch (_) {
    // ignore storage errors in sandboxed environments
  }

  // 3. Tell all listeners (navbar badge, FloatingCartButton, etc.) the cart is now empty
  try {
    window.dispatchEvent(new Event('easyapply:cart-updated'));
  } catch (_) {}
};

// Request Interceptor: Attach in-memory admin accessToken & session ID
api.interceptors.request.use(
  (config) => {
    // 1. Attach in-memory admin accessToken if available
    if (adminAccessToken) {
      config.headers['Authorization'] = `Bearer ${adminAccessToken}`;
    } else {
      // Fallback for customer token if present in storage
      const customerToken = localStorage.getItem('accessToken');
      if (customerToken) {
        config.headers['Authorization'] = `Bearer ${customerToken}`;
      }
    }

    // Always send the session ID for cart operations
    config.headers['x-session-id'] = getSessionId();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized for admin API requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const is401 = error.response && error.response.status === 401;

    // 4. Check if request is an admin request
    const isAdminRequest =
      originalRequest?.url?.includes('/admin') ||
      window.location.pathname.includes('/admin');

    if (is401 && isAdminRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const storedRefreshToken = sessionStorage.getItem('refreshToken');

      // 3. Try calling token refresh (POST /api/auth/refresh) once before logging out
      if (storedRefreshToken) {
        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: storedRefreshToken,
          });

          const newAccessToken = refreshRes.data.accessToken;

          if (newAccessToken) {
            // Update in-memory token
            setAdminAccessToken(newAccessToken);

            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.error('Admin token auto-refresh failed:', refreshErr);
        }
      }

      // 2. If refresh fails or no refresh token exists -> Clear session and redirect to /admin/login
      setAdminAccessToken(null);
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('admin_session');

      if (onForceLogout) {
        onForceLogout();
      }

      const base = import.meta.env.BASE_URL || '/';
      const loginUrl = base.replace(/\/$/, '') + '/admin/login';
      if (window.location.pathname !== loginUrl) {
        window.location.href = loginUrl;
      }
    }

    // 4. Non-admin / customer-facing API calls remain unaffected
    return Promise.reject(error);
  }
);

export default api;
