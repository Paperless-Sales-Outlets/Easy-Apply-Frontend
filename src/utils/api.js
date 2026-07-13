import axios from 'axios';

// Create an instance of Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
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
          // We use direct axios here to avoid triggering the request interceptor loop
          const response = await axios.post('http://localhost:5000/api/auth/refresh', {
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
          
          // Optionally redirect to login page (we can trigger window refresh to clear auth context state)
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
