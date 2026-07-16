import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CurrentCustomerStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.currentCustomer.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.telephone')}</label>
        <input name="currentTelephone" type="tel" className="form-control" required={isActive} />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.customerName')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.currentCustomer.customerNameNote')}
        </p>
        <input name="currentCustomerName" type="text" className="form-control" placeholder={t('wizards.ownershipChange.currentCustomer.customerNamePlaceholder')} required={isActive} />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.partnership')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.currentCustomer.partnershipNote')}
        </p>
        <textarea name="currentPartnership" className="form-control" rows="3" placeholder={t('wizards.ownershipChange.currentCustomer.partnershipPlaceholder')}></textarea>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.ownershipChange.currentCustomer.nicBrc')}</label>
          <input name="currentNic" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.ownershipChange.currentCustomer.contactNo')}</label>
          <input name="currentContactNo" type="tel" className="form-control" required={isActive} />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.transferTo')}</label>
        <input name="transferTo" type="text" className="form-control" placeholder={t('wizards.ownershipChange.currentCustomer.transferToPlaceholder')} required={isActive} />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.currentCustomer.remarks')}</label>
        <textarea name="currentRemarks" className="form-control" rows="2"></textarea>
      </div>

    </div>
  );
}
