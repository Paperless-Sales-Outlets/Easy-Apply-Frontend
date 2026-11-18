// PayHere uses a single SDK URL for both sandbox and production.
// Sandbox mode is controlled by setting sandbox: true in the payment payload.
const PAYHERE_SDK_URL = 'https://www.payhere.lk/lib/payhere.js';


let payHereLoadPromise = null;

/**
 * Dynamically loads the PayHere JavaScript SDK if not already loaded.
 * Returns a Promise that resolves when window.payhere is ready.
 */
export const loadPayHereSdk = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PayHere SDK can only be loaded in a browser environment.'));
  }

  // Already loaded
  if (window.payhere) {
    return Promise.resolve(window.payhere);
  }

  // Loading in progress
  if (payHereLoadPromise) {
    return payHereLoadPromise;
  }

  payHereLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${PAYHERE_SDK_URL}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.payhere));
      existingScript.addEventListener('error', () => {
        payHereLoadPromise = null;
        reject(new Error('Failed to load PayHere JavaScript SDK script.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = PAYHERE_SDK_URL;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => {
      if (window.payhere) {
        resolve(window.payhere);
      } else {
        payHereLoadPromise = null;
        reject(new Error('PayHere object not found on window after script load.'));
      }
    };

    script.onerror = () => {
      payHereLoadPromise = null;
      reject(new Error('Failed to load PayHere JavaScript SDK from ' + PAYHERE_SDK_URL));
    };

    document.head.appendChild(script);
  });

  return payHereLoadPromise;
};

export default loadPayHereSdk;
