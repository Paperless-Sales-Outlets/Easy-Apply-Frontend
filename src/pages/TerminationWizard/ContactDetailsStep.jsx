import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ContactDetailsStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.termination.contact.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.termination.contact.name')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.termination.contact.nameNote')}
        </p>
        <input name="fullName" type="text" className="form-control" required />
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.termination.contact.nicBrc')}</label>
        <div style={{ maxWidth: '400px' }}>
          <input name="nic" type="text" className="form-control" required />
        </div>
      </div>

      <div className="card mt-6" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.contact.contactHeading')}</h4>
        
        <div className="form-group flex flex-col-mobile gap-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.termination.contact.mobile')}</label>
            <input name="contactNo" type="tel" className="form-control" required />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.termination.contact.fixed')}</label>
            <input name="fixedNo" type="tel" className="form-control" />
          </div>
        </div>

        <div className="form-group flex flex-col-mobile gap-4 mt-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.termination.contact.email')}</label>
            <input name="email" type="email" className="form-control" required />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.termination.contact.fax')}</label>
            <input name="faxNo" type="tel" className="form-control" />
          </div>
        </div>
      </div>

    </div>
  );
}
