import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create an instance of Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Session ID ─────────────────────────────────────────────────────────────
// Provides a stable, anonymous cart session without requiring login.
const getSessionId = () => {
  let sid = localStorage.getItem('cartSessionId');
  if (!sid) {
    // Generate a simple UUID-like identifier on first visit
    sid = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('cartSessionId', sid);
  }
  return sid;
};

// Request Interceptor: Attach access token (if logged in) and session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Always send the session ID for cart operations
    config.headers['x-session-id'] = getSessionId();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration (401 errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't retried this request yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Attempt to get a new access token using the refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;

          // Save new access token
          localStorage.setItem('accessToken', accessToken);

          // Update header and retry the original request
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, clear storage and log out
          console.error('Refresh token expired or invalid:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Redirect to login respecting the Vite BASE_URL (e.g. /Paperlessbackup/)
          const base = import.meta.env.BASE_URL || '/';
          window.location.href = base.replace(/\/$/, '') + '/login';
          return Promise.reject(refreshError);
        }
      }
      // No refresh token — 401 on session-based endpoints (e.g. /cart) should
      // fall through and be handled by the caller as a graceful fallback.
    }

    return Promise.reject(error);
  }
);

export default api;
