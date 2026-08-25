import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import api, {
  setAdminAccessToken,
  setAdminLogoutHandler,
} from '../../../utils/api';

const AdminAuthContext = createContext(null);

const SESSION_KEY = 'admin_session';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('refreshToken');
  } catch {
    // Ignore storage errors
  }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => loadSession());
  const [accessToken, setAccessToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  /*
   * Keep React token state and the shared Axios/API client
   * Authorization header synchronized.
   */
  const updateAccessToken = useCallback((token) => {
    setAccessToken(token || null);
    setAdminAccessToken(token || null);
  }, []);

  /*
   * Completely clear the local admin authentication state.
   */
  const clearAuthState = useCallback(() => {
    setAdmin(null);
    updateAccessToken(null);
    clearSession();
  }, [updateAccessToken]);

  /*
   * Refresh the short-lived access token using the refresh token.
   */
  const refreshAuthToken = useCallback(async () => {
    const storedRefreshToken = sessionStorage.getItem('refreshToken');

    if (!storedRefreshToken) {
      clearAuthState();
      return null;
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: storedRefreshToken,
      });

      const newAccessToken = response.data?.accessToken;

      if (!newAccessToken) {
        throw new Error('No access token returned from refresh endpoint.');
      }

      updateAccessToken(newAccessToken);

      return newAccessToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      clearAuthState();

      return null;
    }
  }, [clearAuthState, updateAccessToken]);

  /*
   * Allows the API response interceptor to force logout when
   * authentication can no longer be refreshed.
   */
  useEffect(() => {
    setAdminLogoutHandler(() => {
      clearAuthState();
    });
  }, [clearAuthState]);

  /*
   * Restore and validate an existing admin session when the page reloads.
   *
   * The access token intentionally isn't persisted. Instead we use the
   * refresh token to obtain a new one, then verify the current user via
   * /auth/me.
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedSession = loadSession();
      const storedRefreshToken = sessionStorage.getItem('refreshToken');

      if (!storedSession || !storedRefreshToken) {
        clearAuthState();

        if (isMounted) {
          setInitializing(false);
        }

        return;
      }

      try {
        const token = await refreshAuthToken();

        if (!token || !isMounted) {
          return;
        }

        /*
         * Validate that the refreshed token still belongs to
         * an Admin or Staff account.
         */
        const response = await api.get('/auth/me');
        const user = response.data?.user;

        if (!user || !['Admin', 'Staff'].includes(user.role)) {
          throw new Error('Admin or Staff access required.');
        }

        const validSession = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        if (isMounted) {
          setAdmin(validSession);
          saveSession(validSession);
        }
      } catch (err) {
        console.error('Admin session validation failed:', err);

        if (isMounted) {
          clearAuthState();
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [clearAuthState, refreshAuthToken]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response.data;

      if (!user || !['Admin', 'Staff'].includes(user.role)) {
        const message =
          'Admin or Staff access required for this portal.';

        setError(message);

        return {
          ok: false,
          message,
        };
      }

      if (!newAccessToken) {
        throw new Error('Access token was not returned by the server.');
      }

      /*
       * Access token remains in memory.
       */
      updateAccessToken(newAccessToken);

      /*
       * Refresh token persists only for the current browser tab/session.
       */
      if (newRefreshToken) {
        sessionStorage.setItem(
          'refreshToken',
          newRefreshToken
        );
      }

      const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      setAdmin(session);
      saveSession(session);

      return {
        ok: true,
        user: session,
      };
    } catch (err) {
      clearAuthState();

      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed';

      setError(message);

      return {
        ok: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const storedRefreshToken =
      sessionStorage.getItem('refreshToken');

    try {
      /*
       * Always call logout so the backend can also invalidate
       * an HttpOnly refresh cookie if one is being used.
       */
      await api.post(
        '/auth/logout',
        storedRefreshToken
          ? { refreshToken: storedRefreshToken }
          : {}
      );
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthState();
    }
  };

  const value = {
    admin,
    accessToken,

    loading,
    initializing,

    error,

    login,
    logout,
    refreshAuthToken,

    isAuthenticated: Boolean(admin && accessToken),
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () =>
  useContext(AdminAuthContext);