import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiTrendingUp,
  FiSearch,
  FiCheckCircle,
  FiZap,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiLayers,
  FiShield,
  FiPackage,
} from 'react-icons/fi';
import api from '../../utils/api';
import { useVerifiedContext } from '../../components/verification';
import PackageDetailsStep from './PackageDetailsStep';
import PackageMigrationDeclarationStep from './PackageMigrationDeclarationStep';
import LoopCheckStep from './LoopCheckStep';
import PaymentStep from '../PaymentStep';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';
import WizardStepper from '../../components/WizardStepper';
import { isPackageUpgrade, needsLoopCheck } from '../../utils/technology';

export default function PackageMigrationWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mobileNumber, customerExists, selectedAccount } = useVerifiedContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Customer package state populated strictly from real database lookup
  const [phone, setPhone] = useState(mobileNumber || '');
  const [customerPackage, setCustomerPackage] = useState(selectedAccount || null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Step 2: Upgradation Parameters State
  const [requiredPackage, setRequiredPackage] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Available packages the customer can upgrade to
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    async function fetchProducts() {
      try {
        setLoadingProducts(true);
        const res = await api.get('/products');
        if (isSubscribed) {
          const list = res.data?.data?.products || res.data?.data || res.data?.products || [];
          setProducts(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isSubscribed) {
          setProducts([
            { _id: '1', name: '300 Mbps Fibre Broadband', category: 'Broadband', speed: '300 Mbps', monthlyPrice: 6990 },
            { _id: '2', name: '500 Mbps Fibre Broadband', category: 'Broadband', speed: '500 Mbps', monthlyPrice: 8990 },
            { _id: '3', name: '1 Gbps Fibre Broadband', category: 'Broadband', speed: '1 Gbps', monthlyPrice: 12990 },
            { _id: '4', name: 'LTE Home 150 GB', category: 'Broadband', speed: 'Up to 100 Mbps', monthlyPrice: 4490 },
            { _id: '5', name: 'LTE Home 300 GB', category: 'Broadband', speed: 'Up to 100 Mbps', monthlyPrice: 6490 },
          ]);
        }
      } finally {
        if (isSubscribed) setLoadingProducts(false);
      }
    }
    fetchProducts();
    return () => { isSubscribed = false; };
  }, []);

  // Declaration & Signature State
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);

  // Fibre loop feasibility check
  const [loopAvailable, setLoopAvailable] = useState(null);

  useEffect(() => {
    if (selectedAccount) {
      setCustomerPackage(selectedAccount);
      setPhone(selectedAccount.telephone || selectedAccount.phoneNumber || mobileNumber || '');
    } else if (customerExists === false) {
      setCustomerPackage(null);
      setLookupError('');
    }
  }, [selectedAccount, customerExists, mobileNumber]);

  const handleLookup = async (lookupPhone) => {
    const targetPhone = lookupPhone || phone;
    if (!targetPhone || targetPhone.replace(/\D/g, '').length < 8) {
      setLookupError('Please enter a valid telephone or account number.');
      return;
    }

    setLookupLoading(true);
    setLookupError('');

    try {
      const res = await api.post('/customers/lookup', { phoneNumber: targetPhone });
      const { customerExists: exists, customers } = res.data || {};
      if (exists && Array.isArray(customers) && customers.length > 0) {
        setCustomerPackage(customers[0]);
        setLookupError('');
      } else {
        setCustomerPackage(null);
        setLookupError('No existing connection found. Please check the number or apply for a new connection.');
        setTimeout(() => {
          navigate('/new-connection/products');
        }, 2500);
      }
    } catch (err) {
      setCustomerPackage(null);
      setLookupError('No connection found. First you need to buy or activate a new product.');
      setTimeout(() => {
        navigate('/new-connection/products');
      }, 2500);
    } finally {
      setLookupLoading(false);
    }
  };

  // Same Package Rejection Validation
  const currentPkgName = (customerPackage?.packageName || customerPackage?.package || '').trim().toLowerCase();
  const reqPkgName = (requiredPackage || '').trim().toLowerCase();
  const isSamePackageError = Boolean(currentPkgName && reqPkgName && currentPkgName === reqPkgName);

  // Package upgradation comparison
  const currentPackageInfo = {
    name: customerPackage?.packageName || customerPackage?.package || '',
    speed: customerPackage?.speed || '',
    monthlyPrice: customerPackage?.monthlyPrice || 0,
  };

  const ELIGIBLE_CATEGORIES = ['broadband', 'fibre broadband', 'lte home', 'voice'];
  const upgradeCandidates = products.filter((p) => {
    const category = (p.category || p.serviceType || '').toLowerCase();
    if (category && !ELIGIBLE_CATEGORIES.includes(category)) return false;

    const label = `${p.category || ''} ${p.serviceType || ''} ${p.productName || p.name || ''}`;
    return isPackageUpgrade(currentPackageInfo, {
      name: label,
      speed: p.speed,
      monthlyPrice: p.price ?? p.monthlyPrice,
    });
  });

  const requiredProduct = upgradeCandidates.find((p) => (p.productName || p.name) === requiredPackage) || null;
  const candidatePackageInfo = requiredProduct
    ? {
        name: `${requiredProduct.category || ''} ${requiredProduct.serviceType || ''} ${requiredProduct.productName || requiredProduct.name || ''}`,
        speed: requiredProduct.speed || '',
        monthlyPrice: requiredProduct.price ?? requiredProduct.monthlyPrice ?? 0,
      }
    : null;

  const needsLoop = Boolean(customerPackage && candidatePackageInfo && needsLoopCheck(currentPackageInfo, candidatePackageInfo));

  const registeredAddress =
    customerPackage?.address || [customerPackage?.addressLine1, customerPackage?.addressLine2].filter(Boolean).join(', ');

  const stepKeys = needsLoop
    ? ['account', 'loop', 'schedule', 'declaration', 'payment']
    : ['account', 'schedule', 'declaration', 'payment'];
  const totalSteps = stepKeys.length;
  const currentKey = stepKeys[currentStep - 1];

  useEffect(() => {
    setLoopAvailable(null);
    setCurrentStep((prev) => (prev > 1 ? 1 : prev));
  }, [requiredPackage]);

  // Step Validations
  const isStep1Valid = Boolean(customerPackage) && Boolean(requiredPackage) && !isSamePackageError;
  const isStep2Valid = Boolean(effectiveDate);
  const isStep3Valid = declarationAccepted && (Boolean(signature) || Boolean(signatureFile));

  const handleLoopContinue = (available) => {
    setLoopAvailable(available);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (currentKey === 'account') {
      if (!customerPackage) {
        setLookupError('Please verify a valid customer account from the database before proceeding.');
        return;
      }
      if (!isStep1Valid) {
        setShowValidationErrors(true);
        return;
      }
    } else if (currentKey === 'schedule') {
      if (!isStep2Valid) {
        setShowValidationErrors(true);
        return;
      }
    } else if (currentKey === 'declaration') {
      if (!isStep3Valid) {
        setShowValidationErrors(true);
        return;
      }
    }
    setShowValidationErrors(false);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) handleNext();
  };

  const submitApplication = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        telephone: customerPackage?.telephone || phone,
        accountNumber: customerPackage?.accountNumber,
        customerName: customerPackage?.fullName || customerPackage?.customerName,
        nic: customerPackage?.nic || customerPackage?.NIC || 'N/A',
        currentPackage: customerPackage?.packageName || customerPackage?.package,
        requiredPackage,
        effectiveDate,
        remarks,
        declarationAccepted,
        signature: signature || null,
        ...(needsLoop
          ? {
              loopCheckPerformed: true,
              loopAvailable: Boolean(loopAvailable),
              requiresSiteSurvey: loopAvailable === false,
            }
          : {}),
      };

      const fd = new FormData();
      fd.append('serviceType', 'package-migration');
      fd.append('phone', mobileNumber || phone);
      fd.append('formData', JSON.stringify(payload));

      if (signatureFile instanceof File) fd.append('signatureFile', signatureFile);

      const res = await api.post('/applications', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.packageMigration',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `SLT-UPG-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.packageMigration',
          },
        });
      } else {
        setSubmitError(err.response?.data?.message || 'Failed to submit Service Upgradation request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = needsLoop
    ? [
        t('wizards.packageMigration.steps.step1', 'Existing Account Verification'),
        'Fibre Feasibility Check',
        t('wizards.packageMigration.steps.step2', 'Upgradation Schedule'),
        t('wizards.packageMigration.steps.step3', 'Declaration & Signature'),
        'Payment',
      ]
    : [
        t('wizards.packageMigration.steps.step1', 'Existing Account Verification'),
        t('wizards.packageMigration.steps.step2', 'Upgradation Schedule'),
        t('wizards.packageMigration.steps.step3', 'Declaration & Signature'),
        'Payment',
      ];

  return (
    <div
      className="card"
      style={{
        width: '100%',
        margin: '0 auto',
        padding: '2.5rem 3rem',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(15, 87, 168, 0.06), 0 2px 10px rgba(0, 0, 0, 0.03)',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Page Title & Service Upgradation Badge */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#eff6ff',
            color: '#0056b3',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '0.75rem',
          }}
        >
          <FiTrendingUp size={15} />
          <span>SLTMOBITEL SERVICE UPGRADATION</span>
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          {t('wizards.packageMigration.title', 'Service Upgradation')}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.96rem', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
          {t('wizards.packageMigration.subtitle', 'Upgrade your existing package or connection to ultra-high speed and premium features.')}
        </p>
      </div>

      {/* Progress Bar */}
      <WizardStepper currentStep={currentStep} steps={stepTitles} />

      {/* VERIFIED CUSTOMER SUMMARY BOX AT TOP */}
      <ExistingCustomerSummaryBox customerData={customerPackage} customerExists={customerExists} />

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '320px', marginBottom: '2rem' }}>
          {currentKey === 'account' && (
            <div>
              {/* If no customer verified yet, show connection lookup box */}
              {!customerPackage && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                    <div
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#0056b3',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FiSearch size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
                        Verify Your Connected Account
                      </h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                        Enter your existing SLTMobitel telephone or account number to fetch active packages.
                      </p>
                    </div>
                  </div>

                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.5rem', color: '#1e293b' }}>
                    Telephone / Account Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0112345678"
                      style={{
                        flex: '1',
                        minWidth: '220px',
                        height: '50px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        padding: '0.6rem 1rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleLookup()}
                      className="btn btn-primary"
                      disabled={lookupLoading}
                      style={{
                        height: '50px',
                        padding: '0 1.5rem',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 700,
                      }}
                    >
                      <FiSearch size={16} />
                      {lookupLoading ? 'Searching...' : 'Lookup Database'}
                    </button>
                  </div>
                  {lookupError && (
                    <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiAlertCircle size={14} />
                      <span>{lookupError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Verified Customer — Select Package to Upgrade To Section */}
              {customerPackage && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    padding: '2rem',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 6px 25px rgba(15, 87, 168, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          backgroundColor: '#eff6ff',
                          color: '#0056b3',
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiZap size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: '#0056b3', fontSize: '1.15rem', fontWeight: 800 }}>
                          Select Package to Upgrade To
                        </h4>
                        <p style={{ margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                          Choose a higher performance package to upgrade your existing connection.
                        </p>
                      </div>
                    </div>

                    {/* Current Package Active Badge */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Current Plan: </span>
                      <strong style={{ color: '#0f172a' }}>{customerPackage.packageName || customerPackage.package || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Dropdown Selector */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label
                      htmlFor="pm-requiredPackage-step1"
                      style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
                    >
                      <FiPackage size={16} style={{ color: '#0056b3' }} />
                      <span>Choose Target Package</span> <span style={{ color: '#dc2626' }}>*</span>
                    </label>

                    <select
                      id="pm-requiredPackage-step1"
                      name="requiredPackage"
                      className="form-control"
                      value={requiredPackage}
                      onChange={(e) => setRequiredPackage(e.target.value)}
                      disabled={!loadingProducts && upgradeCandidates.length === 0}
                      style={{
                        width: '100%',
                        height: '52px',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        border: isSamePackageError ? '2px solid #dc2626' : (showValidationErrors && !requiredPackage ? '2px solid #dc2626' : '1.5px solid #cbd5e1'),
                        backgroundColor: isSamePackageError ? '#fef2f2' : '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">-- Select Package to Upgrade To --</option>
                      {loadingProducts ? (
                        <option disabled>Loading available packages...</option>
                      ) : (
                        upgradeCandidates.map((pkg) => {
                          const pkgName = pkg.productName || pkg.name;
                          const pkgPrice = pkg.price ?? pkg.monthlyPrice;
                          return (
                            <option key={pkg._id || pkgName} value={pkgName}>
                              {pkgName} {pkg.speed ? `(${pkg.speed})` : ''} {pkgPrice ? `- LKR ${pkgPrice.toLocaleString()}/mo` : ''}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>

                  {/* Visual Package Cards Grid for quick interactive selection */}
                  {!loadingProducts && upgradeCandidates.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                        Or Click a Recommended Upgrade Package:
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '1rem',
                        }}
                      >
                        {upgradeCandidates.map((pkg) => {
                          const pkgName = pkg.productName || pkg.name;
                          const pkgPrice = pkg.price ?? pkg.monthlyPrice;
                          const isSelected = requiredPackage === pkgName;

                          return (
                            <div
                              key={pkg._id || pkgName}
                              onClick={() => setRequiredPackage(pkgName)}
                              style={{
                                padding: '1.25rem',
                                borderRadius: '14px',
                                border: isSelected ? '2px solid #0056b3' : '1.5px solid #e2e8f0',
                                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isSelected ? '0 8px 24px rgba(0, 86, 179, 0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: isSelected ? '#0056b3' : '#f1f5f9', color: isSelected ? '#ffffff' : '#475569', padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                                    {pkg.category || 'Broadband'}
                                  </span>
                                  {isSelected && (
                                    <span style={{ color: '#0056b3', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 800 }}>
                                      <FiCheckCircle size={14} /> Selected
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: isSelected ? '#0056b3' : '#0f172a', marginBottom: '0.35rem' }}>
                                  {pkgName}
                                </div>

                                {pkg.speed && (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#0284c7', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    <FiZap size={13} />
                                    <span>{pkg.speed}</span>
                                  </div>
                                )}
                              </div>

                              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Monthly</span>
                                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                                  {pkgPrice ? `LKR ${pkgPrice.toLocaleString()}` : 'Custom'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!loadingProducts && upgradeCandidates.length === 0 && (
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.75rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiAlertCircle size={18} style={{ color: '#64748b' }} />
                      <span>You're already on our best available package for your connection technology — there's nothing higher to upgrade to right now.</span>
                    </div>
                  )}

                  {isSamePackageError && (
                    <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiAlertCircle size={14} />
                      <span>Requested package cannot be the same as your current package (BRD 5.6).</span>
                    </div>
                  )}

                  {showValidationErrors && !requiredPackage && !isSamePackageError && (
                    <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiAlertCircle size={14} />
                      <span>Please select a requested package to upgrade to.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentKey === 'loop' && (
            <LoopCheckStep address={registeredAddress} onContinue={handleLoopContinue} />
          )}

          {currentKey === 'schedule' && (
            <PackageDetailsStep
              isActive={currentKey === 'schedule'}
              customerPackage={customerPackage}
              requiredPackage={requiredPackage}
              effectiveDate={effectiveDate}
              setEffectiveDate={setEffectiveDate}
              remarks={remarks}
              setRemarks={setRemarks}
              showValidationErrors={showValidationErrors}
            />
          )}

          {currentKey === 'declaration' && (
            <PackageMigrationDeclarationStep
              isActive={currentKey === 'declaration'}
              customerPackage={customerPackage}
              requiredPackage={requiredPackage}
              effectiveDate={effectiveDate}
              declarationAccepted={declarationAccepted}
              setDeclarationAccepted={setDeclarationAccepted}
              signature={signature}
              setSignature={setSignature}
              signatureFile={signatureFile}
              setSignatureFile={setSignatureFile}
              showValidationErrors={showValidationErrors}
            />
          )}

          {currentKey === 'payment' && (
            <PaymentStep
              isActive={currentKey === 'payment'}
              verifiedPhone={mobileNumber || phone}
              amount={500}
              amountLabel="Service Upgradation Processing Fee"
              onSuccess={submitApplication}
            />
          )}
        </div>

        {submitError && (
          <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Step Navigation Button Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 1 || submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 700,
            }}
          >
            <FiArrowLeft size={16} />
            <span>{t('common.previous', 'Previous')}</span>
          </button>

          {(currentKey === 'loop' || currentKey === 'payment') ? null : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              <span>{t('common.nextStep', 'Next Step')}</span>
              <FiArrowRight size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
