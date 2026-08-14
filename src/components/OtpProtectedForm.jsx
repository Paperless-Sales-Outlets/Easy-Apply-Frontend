// Perform REAL backend customer lookup AFTER OTP verification succeeds
const performCustomerLookup = async (phone) => {
  setPhase('lookup');
  setIsLoading(true);
  setError('');

  try {
    const res = await api.post('/customers/lookup', {
      phoneNumber: phone,
    });

    const { customerExists: exists, customers } = res.data || {};

    if (exists && Array.isArray(customers) && customers.length > 0) {
      setCustomerExists(true);
      setAccountsList(customers);

      if (customers.length === 1) {
        const account = customers[0];

        setSelectedAccount(account);

        sessionStorage.setItem('verifiedPhone', phone);
        sessionStorage.setItem('customerExists', 'true');
        sessionStorage.setItem(
          'selectedAccount',
          JSON.stringify(account)
        );
        sessionStorage.setItem(
          'customerData',
          JSON.stringify(account)
        );

        setPhase('verified');
      } else {
        setPhase('account-select');
      }
    } else {
      setCustomerExists(false);
      setAccountsList([]);
      setSelectedAccount(null);

      sessionStorage.setItem('verifiedPhone', phone);
      sessionStorage.setItem('customerExists', 'false');
      sessionStorage.removeItem('selectedAccount');
      sessionStorage.removeItem('customerData');

      const currentPath = location.pathname;

      const requiresExistingAccount = [
        '/location-change',
        '/package-migration',
        '/reconnection',
        '/ownership-change',
        '/termination',
        '/service-vacation',
      ].some((path) => currentPath.includes(path));

      if (requiresExistingAccount) {
        setPhase('new-customer-redirect');
      } else {
        setPhase('verified');
      }
    }
  } catch (err) {
    console.warn('Customer lookup fallback:', err);

    setCustomerExists(false);
    setAccountsList([]);
    setSelectedAccount(null);

    const currentPath = location.pathname;

    const requiresExistingAccount = [
      '/location-change',
      '/package-migration',
      '/reconnection',
      '/ownership-change',
      '/termination',
      '/service-vacation',
    ].some((path) => currentPath.includes(path));

    if (requiresExistingAccount) {
      setPhase('new-customer-redirect');
    } else {
      setPhase('verified');
    }
  } finally {
    setIsLoading(false);
  }
};