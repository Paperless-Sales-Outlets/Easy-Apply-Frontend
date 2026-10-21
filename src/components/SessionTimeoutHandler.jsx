import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  isAuthenticated,
  isSessionExpired,
  recordSessionActivity,
  expireSessionDueToInactivity,
  getVerifiedPhone,
  LAST_ACTIVITY_KEY,
  SESSION_EXPIRED_KEY,
} from '../utils/authSession';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const THROTTLE_MS = 2000; // Throttle activity updates to once every 2 seconds
const CHECK_INTERVAL_MS = 3000; // Check inactivity status every 3 seconds

export default function SessionTimeoutHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastRecordedRef = useRef(Date.now());
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    // Record activity on mount if authenticated
    if (getVerifiedPhone()) {
      recordSessionActivity();
    }

    // Throttled activity listener
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecordedRef.current > THROTTLE_MS) {
        lastRecordedRef.current = now;
        if (getVerifiedPhone()) {
          recordSessionActivity();
        }
      }
    };

    // Attach activity listeners to the window
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Cross-tab synchronization via storage events
    const handleStorageEvent = (e) => {
      if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
        lastRecordedRef.current = Number(e.newValue);
      }
      // If another tab cleared the session (e.g. timed out)
      if (e.key === 'verifiedPhone' && !e.newValue) {
        const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
        const isAdminPage = location.pathname.startsWith('/admin');
        if (!isAuthPage && !isAdminPage && !isNavigatingRef.current) {
          isNavigatingRef.current = true;
          const msg = 'Your session has expired due to inactivity. Please log in again.';
          toast.error(msg, { id: 'session-timeout-toast', duration: 6000 });
          navigate('/login', {
            replace: true,
            state: { sessionExpired: true, message: msg },
          });
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 1000);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // Inactivity check interval
    const intervalId = setInterval(() => {
      // Do not run timeout logic if already on /login or /signup or admin pages
      const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
      const isAdminPage = location.pathname.startsWith('/admin');
      if (isAuthPage || isAdminPage) return;

      if (getVerifiedPhone() && isSessionExpired()) {
        if (!isNavigatingRef.current) {
          isNavigatingRef.current = true;
          const msg = 'Your session has expired due to inactivity. Please log in again.';
          expireSessionDueToInactivity();
          toast.error(msg, { id: 'session-timeout-toast', duration: 6000 });
          navigate('/login', {
            replace: true,
            state: { sessionExpired: true, message: msg },
          });
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 1000);
        }
      }
    }, CHECK_INTERVAL_MS);

    // Listen to programmatic session-expired custom events
    const handleExpiredEvent = (e) => {
      const isAuthPage = location.pathname === '/login';
      const isAdminPage = location.pathname.startsWith('/admin');
      if (!isAuthPage && !isAdminPage && !isNavigatingRef.current) {
        isNavigatingRef.current = true;
        const msg = e.detail?.message || 'Your session has expired due to inactivity. Please log in again.';
        toast.error(msg, { id: 'session-timeout-toast', duration: 6000 });
        navigate('/login', {
          replace: true,
          state: { sessionExpired: true, message: msg },
        });
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 1000);
      }
    };

    window.addEventListener('easyapply:session-expired', handleExpiredEvent);

    // Cleanup: remove all event listeners and interval to prevent memory leaks
    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(intervalId);
      window.removeEventListener('easyapply:session-expired', handleExpiredEvent);
    };
  }, [location.pathname, navigate]);

  return null;
}
