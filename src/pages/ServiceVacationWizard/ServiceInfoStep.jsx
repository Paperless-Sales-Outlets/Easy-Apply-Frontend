import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ServiceInfoStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.serviceVacation.serviceInfo.heading')}</h3>
      
      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.serviceVacation.serviceInfo.servicesToVacate')}</h4>
        
        <div className="flex gap-4 flex-wrap">
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.serviceVacation.serviceInfo.voice')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.serviceVacation.serviceInfo.broadband')}</label>
          <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.serviceVacation.serviceInfo.peoTv')}</label>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.serviceVacation.serviceInfo.deactivationPeriod')}</h4>
        
        <div className="form-group flex flex-col-mobile gap-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.serviceVacation.serviceInfo.deactivationDate')}</label>
            <input type="date" className="form-control" required={isActive} />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.serviceVacation.serviceInfo.resumeDate')}</label>
            <input type="date" className="form-control" required={isActive} />
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(0, 166, 80, 0.05)', borderLeft: '4px solid var(--slt-green)', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: 0 }}>
          <li>{t('wizards.serviceVacation.serviceInfo.note1')}</li>
          <li>{t('wizards.serviceVacation.serviceInfo.note2')}</li>
          <li>{t('wizards.serviceVacation.serviceInfo.note3')}</li>
          <li>{t('wizards.serviceVacation.serviceInfo.note4')}</li>
          <li>{t('wizards.serviceVacation.serviceInfo.note5')}</li>
        </ul>
      </div>

    </div>
  );
}
