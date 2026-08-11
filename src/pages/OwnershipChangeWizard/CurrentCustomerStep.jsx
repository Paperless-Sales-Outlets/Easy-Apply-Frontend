import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CurrentCustomerStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.currentCustomer.heading')}</h3>

      <div className="form-group">
        <label className="form-label" htmlFor="oc-partnership">{t('wizards.ownershipChange.currentCustomer.partnership')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.currentCustomer.partnershipNote')}
        </p>
        <textarea id="oc-partnership" name="currentPartnership" className="form-control" rows="3" placeholder={t('wizards.ownershipChange.currentCustomer.partnershipPlaceholder')}></textarea>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="oc-transferTo">{t('wizards.ownershipChange.currentCustomer.transferTo')}</label>
        <input id="oc-transferTo" name="transferTo" type="text" className="form-control" placeholder={t('wizards.ownershipChange.currentCustomer.transferToPlaceholder')} required={isActive} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="oc-remarks">{t('wizards.ownershipChange.currentCustomer.remarks')}</label>
        <textarea id="oc-remarks" name="currentRemarks" className="form-control" rows="2"></textarea>
      </div>

    </div>
  );
}
