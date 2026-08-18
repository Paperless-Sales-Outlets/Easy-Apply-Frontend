import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedContext } from '../../components/verification';
import PackageDetailsStep from './PackageDetailsStep';
import PackageMigrationDeclarationStep from './PackageMigrationDeclarationStep';
import LoopCheckStep from './LoopCheckStep';
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

  // Step 2: Migration Parameters State
  const [requiredPackage, setRequiredPackage] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Available packages the customer can migrate to — fetched once, used by
  // the product picker shown right on Step 1 (next to the verified account).
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
            { _id: '1', name: '300 Mbps Fibre Broadband', speed: '300 Mbps', monthlyPrice: 6990 },
            { _id: '2', name: '500 Mbps Fibre Broadband', speed: '500 Mbps', monthlyPrice: 8990 },
            { _id: '3', name: '1 Gbps Fibre Broadband', speed: '1 Gbps', monthlyPrice: 12990 },
            { _id: '4', name: 'LTE Home 150 GB', speed: 'Up to 100 Mbps', monthlyPrice: 4490 },
            { _id: '5', name: 'LTE Home 300 GB', speed: 'Up to 100 Mbps', monthlyPrice: 6490 },
            { _id: '6', name: 'PEO TV Starter Pack', speed: 'HD Quality', monthlyPrice: 1999 },
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

  // Fibre loop feasibility check — only relevant when the upgrade moves the
  // customer onto Fibre from a different technology (Copper/LTE).
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
      setLookupError('Please enter a valid telephone number.');
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
        setLookupError('First you need to buy or activate a new product.');
        setTimeout(() => {
          navigate('/new-connection/products');
        }, 2500);
      }
    } catch (err) {
      setCustomerPackage(null);
      setLookupError('First you need to buy or activate a new product.');
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

  // Package migration is upgrade-only — build comparable "current" / "candidate"
  // descriptors and only offer products in the picker that are a real upgrade.
  const currentPackageInfo = {
    name: customerPackage?.packageName || customerPackage?.package || '',
    speed: customerPackage?.speed || '',
    monthlyPrice: customerPackage?.monthlyPrice || 0,
  };

  // Only real connectivity packages belong in the migration-target picker —
  // accessories, devices, PEO TV, voice-only and bundles aren't a "package"
  // in the copper/LTE/fibre sense this upgrade check cares about. Products
  // that don't carry a category at all (e.g. the offline fallback list)
  // fall through to the name-based technology classification below instead.
  const BROADBAND_CATEGORIES = ['broadband', 'fibre broadband', 'lte home'];
  const upgradeCandidates = products.filter((p) => {
    const category = (p.category || p.serviceType || '').toLowerCase();
    if (category && !BROADBAND_CATEGORIES.includes(category)) return false;

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

  // Fibre needs a physical loop/port — only gate the flow on it when the
  // customer is actually moving onto Fibre from Copper/LTE.
  const needsLoop = Boolean(customerPackage && candidatePackageInfo && needsLoopCheck(currentPackageInfo, candidatePackageInfo));

  const registeredAddress =
    customerPackage?.address || [customerPackage?.addressLine1, customerPackage?.addressLine2].filter(Boolean).join(', ');

  const stepKeys = needsLoop ? ['account', 'loop', 'schedule', 'declaration'] : ['account', 'schedule', 'declaration'];
  const totalSteps = stepKeys.length;
  const currentKey = stepKeys[currentStep - 1];

  // Reset feasibility state and restart past account verification whenever the
  // target package changes — the loop-check requirement and step numbering can
  // both shift depending on which package is selected.
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
    }
    setShowValidationErrors(false);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    if (!isStep3Valid) {
      setShowValidationErrors(true);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        telephone: customerPackage?.telephone || phone,
        accountNumber: customerPackage?.accountNumber,
        customerName: customerPackage?.fullName || customerPackage?.customerName,
        nic: customerPackage?.nic,
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
            referenceNumber: `SLT-PKG-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.packageMigration',
          },
        });
      } else {
        setSubmitError(err.response?.data?.message || 'Failed to submit Package Migration request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = needsLoop
    ? [
        t('wizards.packageMigration.steps.step1', 'Existing Account Verification'),
        'Fibre Feasibility Check',
        t('wizards.packageMigration.steps.step2', 'Migration Schedule'),
        t('wizards.packageMigration.steps.step3', 'Declaration & Submission'),
      ]
    : [
        t('wizards.packageMigration.steps.step1', 'Existing Account Verification'),
        t('wizards.packageMigration.steps.step2', 'Migration Schedule'),
        t('wizards.packageMigration.steps.step3', 'Declaration & Submission'),
      ];

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.packageMigration.title')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('wizards.packageMigration.subtitle')}</p>

      {/* Progress Bar */}
      <WizardStepper currentStep={currentStep} steps={stepTitles} />

      {/* VERIFIED CUSTOMER SUMMARY BOX AT TOP */}
      <ExistingCustomerSummaryBox customerData={customerPackage} customerExists={customerExists} />

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
        {currentKey === 'account' && (
          <div>
            <h3 style={{ color: 'var(--slt-blue, #0056b3)', marginBottom: '1.25rem', fontWeight: 800 }}>
              Verify Account Details
            </h3>

            {!customerPackage && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                  Telephone / Account Number
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0112345678"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleLookup()}
                    className="btn btn-primary"
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? 'Searching...' : 'Lookup Database'}
                  </button>
                </div>
                {lookupError && (
                  <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
                    {lookupError}
                  </p>
                )}
              </div>
            )}

            {customerPackage && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ color: '#0056b3', marginTop: 0, marginBottom: '0.35rem', fontWeight: 800 }}>Select Package to Upgrade To</h4>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: 0, marginBottom: '1rem' }}>
                  Your current package is <strong>{customerPackage.packageName || customerPackage.package || 'N/A'}</strong>. Package migration only supports upgrades — choose a higher package below.
                </p>

                <label className="form-label" htmlFor="pm-requiredPackage-step1" style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Required Package <span style={{ color: 'red' }}>*</span>
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
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: isSamePackageError ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    backgroundColor: isSamePackageError ? '#fef2f2' : '#ffffff',
                  }}
                >
                  <option value="">-- Select Requested Package --</option>
                  {loadingProducts ? (
                    <option disabled>Loading packages...</option>
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

                {!loadingProducts && upgradeCandidates.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    You're already on our best available package for your current technology — there's nothing higher to migrate to right now.
                  </div>
                )}
                {isSamePackageError && (
                  <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    Requested package cannot be the same as your current package (BRD 5.6).
                  </div>
                )}
                {showValidationErrors && !requiredPackage && !isSamePackageError && (
                  <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                    Please select a requested package.
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
        </div>

        {submitError && (
          <p style={{ color: 'var(--danger, #dc3545)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {submitError}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrev} disabled={currentStep === 1 || submitting}>
            {t('common.previous')}
          </button>

          {currentKey === 'loop' ? null : currentStep < totalSteps ? (
            <button type="button" onClick={handleNext} className="btn btn-primary" disabled={submitting}>
              {t('common.nextStep')}
            </button>
          ) : (
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? t('common.submitting') : 'Submit Package Migration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
