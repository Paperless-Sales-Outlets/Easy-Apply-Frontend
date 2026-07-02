import React from 'react';
import { useTranslation } from 'react-i18next';

export default function RequestDetailsStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.customerRequestAcceptance.requestDetails.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.customerRequestAcceptance.requestDetails.fullName')}</label>
        <input type="text" className="form-control" required />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.customerRequestAcceptance.requestDetails.nicBrc')}</label>
          <input type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.customerRequestAcceptance.requestDetails.telephone')}</label>
          <input type="tel" className="form-control" required />
        </div>
      </div>

      <div className="card mt-4" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.customerRequestAcceptance.requestDetails.requiredService')}</h4>
        
        <div className="flex gap-4 flex-wrap">
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.ftth')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.peoTv')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.broadband')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.voice')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.lte')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.otherService')}</label>
        </div>
      </div>

      <div className="card mt-4" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.customerRequestAcceptance.requestDetails.requestType')}</h4>
        
        <div className="flex gap-4 flex-wrap">
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.billing')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.serviceMod')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.hardware')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.customerRequestAcceptance.requestDetails.otherRequest')}</label>
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.customerRequestAcceptance.requestDetails.contactDetails')}</label>
        
        <div className="flex flex-col-mobile gap-4 mt-2">
          <div style={{ flex: '1' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('wizards.customerRequestAcceptance.requestDetails.fixed')}</span>
            <input type="tel" className="form-control" />
          </div>
          <div style={{ flex: '1' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('wizards.customerRequestAcceptance.requestDetails.mobile')}</span>
            <input type="tel" className="form-control" />
          </div>
          <div style={{ flex: '1' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('wizards.customerRequestAcceptance.requestDetails.email')}</span>
            <input type="email" className="form-control" />
          </div>
        </div>
      </div>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2.5rem', marginBottom: '1.5rem' }}>{t('wizards.customerRequestAcceptance.requestDetails.descriptionHeading')}</h3>
      
      <div className="form-group">
        <textarea className="form-control" rows="5" placeholder={t('wizards.customerRequestAcceptance.requestDetails.description')} required></textarea>
      </div>

    </div>
  );
}
