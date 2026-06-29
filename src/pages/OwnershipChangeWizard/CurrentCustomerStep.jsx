import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CurrentCustomerStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.currentCustomer.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.telephone')}</label>
        <input type="tel" className="form-control" required />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.customerName')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.currentCustomer.customerNameNote')}
        </p>
        <input type="text" className="form-control" placeholder={t('wizards.ownershipChange.currentCustomer.customerNamePlaceholder')} required />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.partnership')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.currentCustomer.partnershipNote')}
        </p>
        <textarea className="form-control" rows="3" placeholder={t('wizards.ownershipChange.currentCustomer.partnershipPlaceholder')}></textarea>
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.ownershipChange.currentCustomer.nicBrc')}</label>
          <input type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.ownershipChange.currentCustomer.contactNo')}</label>
          <input type="tel" className="form-control" required />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.transferTo')}</label>
        <input type="text" className="form-control" placeholder={t('wizards.ownershipChange.currentCustomer.transferToPlaceholder')} required />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.remarks')}</label>
        <textarea className="form-control" rows="2"></textarea>
      </div>

    </div>
  );
}
