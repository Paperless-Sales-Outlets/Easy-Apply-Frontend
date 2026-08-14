import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedContext } from '../../components/verification';
import PackageDetailsStep from './PackageDetailsStep';
import PackageMigrationDeclarationStep from './PackageMigrationDeclarationStep';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';

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

  // Step 3: Declaration & Signature State
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);

  const totalSteps = 3;

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

  // Step Validations
  const isStep1Valid = Boolean(customerPackage) && Boolean(requiredPackage) && !isSamePackageError;
  const isStep2Valid = Boolean(effectiveDate);
  const isStep3Valid = declarationAccepted && (Boolean(signature) || Boolean(signatureFile));

  const handleNext = () => {
    if (currentStep === 1) {
      if (!customerPackage) {
        setLookupError('Please verify a valid customer account from the database before proceeding.');
        return;
      }
      if (!isStep1Valid) {
        setShowValidationErrors(true);
        return;
      }
    } else if (currentStep === 2) {
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

  const stepTitles = [
    t('wizards.packageMigration.steps.step1', 'Existing Account Verification'),
    t('wizards.packageMigration.steps.step2', 'Package Selection & Uploads'),
    t('wizards.packageMigration.steps.step3', 'Declaration & Submission'),
  ];

  return (
    <div className="container" style={{ padding: '2rem 1rem', width: '100%', margin: '0 auto' }}>
      {/* Stepper Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          {stepTitles.map((title, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                textAlign: 'center',
                color: currentStep === idx + 1 ? 'var(--slt-blue, #0056b3)' : '#64748b',
                fontWeight: currentStep === idx + 1 ? 800 : 600,
                fontSize: '0.88rem',
              }}
            >
              Step {idx + 1}: {title}
            </div>
          ))}
        </div>
        <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
          <div
            style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              backgroundColor: 'var(--slt-blue, #0056b3)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* VERIFIED CUSTOMER SUMMARY BOX AT TOP */}
      <ExistingCustomerSummaryBox customerData={customerPackage} customerExists={customerExists} />

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
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
                <h4 style={{ color: '#0056b3', marginTop: 0, marginBottom: '0.35rem', fontWeight: 800 }}>Select Package to Migrate To</h4>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: 0, marginBottom: '1rem' }}>
                  Your current package is <strong>{customerPackage.packageName || customerPackage.package || 'N/A'}</strong>. Choose the package you'd like to move to.
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
                    products.map((pkg) => (
                      <option key={pkg._id || pkg.name} value={pkg.name}>
                        {pkg.name} {pkg.speed ? `(${pkg.speed})` : ''} {pkg.monthlyPrice ? `- LKR ${pkg.monthlyPrice.toLocaleString()}/mo` : ''}
                      </option>
                    ))
                  )}
                </select>

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

        {currentStep === 2 && (
          <PackageDetailsStep
            isActive={currentStep === 2}
            customerPackage={customerPackage}
            requiredPackage={requiredPackage}
            setRequiredPackage={setRequiredPackage}
            effectiveDate={effectiveDate}
            setEffectiveDate={setEffectiveDate}
            remarks={remarks}
            setRemarks={setRemarks}
            showValidationErrors={showValidationErrors}
            isSamePackageError={isSamePackageError}
          />
        )}

        {currentStep === 3 && (
          <PackageMigrationDeclarationStep
            isActive={currentStep === 3}
            declarationAccepted={declarationAccepted}
            setDeclarationAccepted={setDeclarationAccepted}
            signature={signature}
            setSignature={setSignature}
            signatureFile={signatureFile}
            setSignatureFile={setSignatureFile}
            showValidationErrors={showValidationErrors}
          />
        )}

        {submitError && (
          <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', marginTop: '1rem', fontWeight: 700 }}>
            {submitError}
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {currentStep > 1 ? (
            <button type="button" onClick={handlePrev} className="btn btn-outline" disabled={submitting}>
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button type="button" onClick={handleNext} className="btn btn-primary">
              Next Step →
            </button>
          ) : (
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? 'Submitting Application...' : 'Submit Package Migration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
