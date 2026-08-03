import React from 'react';
import { useTranslation } from 'react-i18next';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import FileUploadField from '../../components/form/FileUploadField';

export default function CustomerInfoStep({ formData, handleChange, handleFileChange }) {
  const { t } = useTranslation();

  // Calculate maximum allowed date of birth (18+ years old)
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  const isBusiness = formData.customerType === 'business';
  const isForeign = formData.customerType === 'foreign';

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>
        {t('wizards.newConnection.customerInfo.heading')}
      </h3>

      {/* 1.1 Customer Type (BRD 5.1.5) */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">{t('wizards.newConnection.customerInfo.customerType')}</label>
        <div className="radio-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {[
            { value: 'home', labelKey: 'wizards.newConnection.customerInfo.home' },
            { value: 'office', labelKey: 'wizards.newConnection.customerInfo.office' },
            { value: 'religious', labelKey: 'wizards.newConnection.customerInfo.religious' },
            { value: 'business', labelKey: 'wizards.newConnection.customerInfo.business' },
            { value: 'government', labelKey: 'wizards.newConnection.customerInfo.government' },
            { value: 'foreign', labelKey: 'wizards.newConnection.customerInfo.foreign' },
          ].map((type) => (
            <label key={type.value} className="radio-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="customerType"
                value={type.value}
                className="radio-input"
                checked={formData.customerType === type.value}
                onChange={handleChange}
                required
              />
              {t(type.labelKey)}
            </label>
          ))}
        </div>
      </div>

      {/* Title & Name */}
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.title')}</label>
          <select
            name="title"
            className="form-control"
            value={formData.title || ''}
            onChange={handleChange}
          >
            <option value="" disabled>{t('wizards.newConnection.customerInfo.select')}</option>
            <option value="Rev">{t('wizards.newConnection.customerInfo.rev')}</option>
            <option value="Mr">{t('wizards.newConnection.customerInfo.mr')}</option>
            <option value="Ms">{t('wizards.newConnection.customerInfo.ms')}</option>
            <option value="Other">{t('wizards.newConnection.customerInfo.other')}</option>
          </select>
        </div>
        <div style={{ flex: '3' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.nameFull')}</label>
          <input
            name="nameFull"
            type="text"
            className="form-control"
            placeholder={t('wizards.newConnection.customerInfo.namePlaceholder')}
            value={formData.nameFull || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* DOB, NIC / Passport, Tax Exemption */}
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.dob')}</label>
          <input
            name="dob"
            type="date"
            className="form-control"
            value={formData.dob || ''}
            onChange={handleChange}
            max={maxDob}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.nic')}</label>
          <input
            name="nic"
            type="text"
            className="form-control"
            placeholder={isForeign ? 'Passport Number' : 'NIC / BR Number'}
            value={formData.nic || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.taxExemption')}</label>
          <input
            name="taxExemption"
            type="text"
            className="form-control"
            value={formData.taxExemption || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Conditional VAT Registration Number (Business Customers) */}
      {isBusiness && (
        <div className="form-group flex flex-col-mobile gap-4" style={{ marginTop: '1rem' }}>
          <div style={{ flex: '1' }}>
            <label className="form-label">
              {t('wizards.newConnection.customerInfo.vat')} <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              name="vatNumber"
              type="text"
              className="form-control"
              placeholder="e.g. VAT123456789"
              value={formData.vatNumber || ''}
              onChange={handleChange}
              required={isBusiness}
            />
          </div>
        </div>
      )}

      {/* Permanent Address */}
      <AddressInputWithMap
        name="address"
        label={t('wizards.newConnection.customerInfo.address')}
        value={formData.address || ''}
        onChange={handleChange}
        required
      />

      {/* 1.8 Contact Details (BRD 5.1.5: includes Designation & Fax) */}
      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.newConnection.customerInfo.contactDetails')}
      </h4>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.contactName')}</label>
          <input
            name="contactName"
            type="text"
            className="form-control"
            value={formData.contactName || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.designation')}</label>
          <input
            name="designation"
            type="text"
            className="form-control"
            placeholder="e.g. Manager / Proprietor"
            value={formData.designation || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.fixedNumber')}</label>
          <input
            name="fixedNumber"
            type="tel"
            inputMode="numeric"
            pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
            maxLength={10}
            title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            className="form-control"
            value={formData.fixedNumber || ''}
            onChange={handleChange}
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.mobileNumber')}</label>
          <input
            name="mobileNumber"
            type="tel"
            inputMode="numeric"
            pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
            maxLength={10}
            title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            className="form-control"
            value={formData.mobileNumber || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.faxNumber')}</label>
          <input
            name="faxNumber"
            type="tel"
            className="form-control"
            value={formData.faxNumber || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.email')}</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={formData.email || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {t('wizards.newConnection.customerInfo.mobileNote')}
      </p>

      {/* 1.9 Document Uploads (BRD 5.1.3) */}
      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--slt-blue)' }}>
        {t('wizards.newConnection.customerInfo.documentsHeading')}
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {!isForeign && (
          <>
            <FileUploadField
              name="nicFront"
              label={t('wizards.newConnection.customerInfo.nicFront')}
              required
              value={formData.nicFront}
              onChange={handleFileChange}
              helpText="Upload front side of NIC (PDF, JPG, PNG)"
            />
            <FileUploadField
              name="nicBack"
              label={t('wizards.newConnection.customerInfo.nicBack')}
              required
              value={formData.nicBack}
              onChange={handleFileChange}
              helpText="Upload back side of NIC (PDF, JPG, PNG)"
            />
          </>
        )}

        {isForeign && (
          <FileUploadField
            name="passportDoc"
            label={t('wizards.newConnection.customerInfo.passportDoc')}
            required
            value={formData.passportDoc}
            onChange={handleFileChange}
            helpText="Upload bio page of Passport (PDF, JPG, PNG)"
          />
        )}

        {isBusiness && (
          <FileUploadField
            name="brcDoc"
            label={t('wizards.newConnection.customerInfo.brcDoc')}
            required={isBusiness}
            value={formData.brcDoc}
            onChange={handleFileChange}
            helpText="Upload Business Registration Certificate"
          />
        )}

        {(isBusiness || formData.vatNumber) && (
          <FileUploadField
            name="vatDoc"
            label={t('wizards.newConnection.customerInfo.vatDoc')}
            value={formData.vatDoc}
            onChange={handleFileChange}
            helpText="Upload VAT Registration Certificate"
          />
        )}

        {formData.taxExemption && (
          <FileUploadField
            name="taxExemptionDoc"
            label={t('wizards.newConnection.customerInfo.taxExemptionDoc')}
            value={formData.taxExemptionDoc}
            onChange={handleFileChange}
            helpText="Upload Tax Exemption Certificate"
          />
        )}
      </div>
    </div>
  );
}
