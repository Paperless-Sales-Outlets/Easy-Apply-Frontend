import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GeneralInfoStep({ isActive }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const [customer, setCustomer] = useState({
    telephone: '',
    legalOwner: '',
    contactPerson: '',
    tel: '',
    mobile: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerify = async () => {
    if (!customer.telephone) {
      alert('Please enter a telephone number.');
      return;
    }

    setLoading(true);

    // Temporary mock API
    setTimeout(() => {
      setCustomer({
        telephone: customer.telephone,
        legalOwner: 'Nimal Perera',
        contactPerson: 'Nimal Perera',
        tel: customer.telephone,
        mobile: '0771234567',
        email: 'nimal@gmail.com',
      });

      setVerified(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div>
      <h3
        style={{
          color: 'var(--slt-blue)',
          marginBottom: '1.5rem',
        }}
      >
        {t('wizards.locationChange.generalInfo.heading')}
      </h3>

      {/* Telephone */}
      <div className="form-group flex flex-col-mobile gap-4">

        <div style={{ flex: 1 }}>
          <label className="form-label">
            {t('wizards.locationChange.generalInfo.telephone')}
          </label>

          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <input
              name="telephone"
              type="tel"
              className="form-control"
              value={customer.telephone}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={10}
              required={isActive}
            />

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={loading}
              style={{
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <small
            style={{
              color: verified ? 'green' : '#999',
              display: 'block',
              marginTop: 8,
            }}
          >
            {verified ? '✓ Verified' : 'Not Verified'}
          </small>
        </div>

        <div style={{ flex: 2 }}>
          <label className="form-label">
            {t('wizards.locationChange.generalInfo.legalOwner')}
          </label>

          <input
            name="legalOwner"
            type="text"
            className="form-control"
            value={customer.legalOwner}
            readOnly
          />
        </div>

      </div>

      <h4
        style={{
          color: 'var(--text-primary)',
          marginTop: '2rem',
          marginBottom: '1rem',
        }}
      >
        {t('wizards.locationChange.generalInfo.contactHeading')}
      </h4>

      <div
        className="card"
        style={{
          padding: '1.5rem',
          background: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          boxShadow: 'none',
        }}
      >

        <div className="form-group">
          <label className="form-label">
            {t('wizards.locationChange.generalInfo.contactPerson')}
          </label>

          <input
            name="contactPerson"
            type="text"
            className="form-control"
            value={customer.contactPerson}
            onChange={handleChange}
            disabled={!verified}
          />
        </div>

        <div className="form-group flex flex-col-mobile gap-4 mt-4">

          <div style={{ flex: 1 }}>
            <label className="form-label">
              {t('wizards.locationChange.generalInfo.tel')}
            </label>

            <input
              name="tel"
              type="tel"
              className="form-control"
              value={customer.tel}
              readOnly
            />
          </div>

          <div style={{ flex: 1 }}>
            <label className="form-label">
              {t('wizards.locationChange.generalInfo.mobile')}
            </label>

            <input
              name="mobile"
              type="tel"
              className="form-control"
              value={customer.mobile}
              onChange={handleChange}
              disabled={!verified}
            />
          </div>

        </div>

        <div className="form-group mt-4">
          <label className="form-label">
            {t('wizards.locationChange.generalInfo.email')}
          </label>

          <input
            name="email"
            type="email"
            className="form-control"
            value={customer.email}
            onChange={handleChange}
            disabled={!verified}
          />
        </div>

      </div>
    </div>
  );
}