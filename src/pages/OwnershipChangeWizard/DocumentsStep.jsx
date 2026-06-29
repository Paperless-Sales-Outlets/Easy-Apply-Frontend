import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DocumentsStep() {
  const { t } = useTranslation();
  const [transferType, setTransferType] = useState('person-to-person');

  const getDocuments = () => {
    switch(transferType) {
      case 'person-to-person':
        return [
          t('wizards.ownershipChange.documents.docs.formA_or_consent'),
          t('wizards.ownershipChange.documents.docs.newOwnerConsent'),
          t('wizards.ownershipChange.documents.docs.newOwnerNic')
        ];
      case 'person-to-company':
        return [
          t('wizards.ownershipChange.documents.docs.formA_or_consent'),
          t('wizards.ownershipChange.documents.docs.form20'),
          t('wizards.ownershipChange.documents.docs.brCopy'),
          t('wizards.ownershipChange.documents.docs.companyRequest'),
          t('wizards.ownershipChange.documents.docs.companyResolution')
        ];
      case 'company-to-company':
        return [
          t('wizards.ownershipChange.documents.docs.form20'),
          t('wizards.ownershipChange.documents.docs.companyResolution'),
          t('wizards.ownershipChange.documents.docs.brCopy'),
          t('wizards.ownershipChange.documents.docs.companyRequestOfficial')
        ];
      case 'private-to-official':
        return [
          t('wizards.ownershipChange.documents.docs.authLetter'),
          t('wizards.ownershipChange.documents.docs.consentPresentOwner')
        ];
      case 'official-to-private':
        return [
          t('wizards.ownershipChange.documents.docs.authLetter'),
          t('wizards.ownershipChange.documents.docs.consentPresentOwner')
        ];
      case 'spouse-demise':
        return [
          t('wizards.ownershipChange.documents.docs.marriageCert'),
          t('wizards.ownershipChange.documents.docs.deathCert'),
          t('wizards.ownershipChange.documents.docs.birthCert'),
          t('wizards.ownershipChange.documents.docs.spouseRequest')
        ];
      case 'family-demise':
        return [
          t('wizards.ownershipChange.documents.docs.deathCertOrGs'),
          t('wizards.ownershipChange.documents.docs.marriageOrBirth'),
          t('wizards.ownershipChange.documents.docs.closestRelationRequest')
        ];
      case 'both-demise':
        return [
          t('wizards.ownershipChange.documents.docs.deathCert'),
          t('wizards.ownershipChange.documents.docs.birthCertUser'),
          t('wizards.ownershipChange.documents.docs.familyConsent'),
          t('wizards.ownershipChange.documents.docs.gsJpCert')
        ];
      case 'temporary':
        return [
          t('wizards.ownershipChange.documents.docs.legalOwnerMissing'),
          t('wizards.ownershipChange.documents.docs.tempForm'),
          t('wizards.ownershipChange.documents.docs.presentUserRequest')
        ];
      default:
        return [];
    }
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.documents.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.documents.scenario')}</label>
        <select 
          className="form-control" 
          value={transferType} 
          onChange={(e) => setTransferType(e.target.value)}
          style={{ padding: '0.8rem' }}
        >
          <optgroup label={t('wizards.ownershipChange.documents.genTransfers')}>
            <option value="person-to-person">{t('wizards.ownershipChange.documents.p2p')}</option>
            <option value="person-to-company">{t('wizards.ownershipChange.documents.p2c')}</option>
            <option value="company-to-company">{t('wizards.ownershipChange.documents.c2c')}</option>
            <option value="private-to-official">{t('wizards.ownershipChange.documents.p2o')}</option>
            <option value="official-to-private">{t('wizards.ownershipChange.documents.o2p')}</option>
          </optgroup>
          <optgroup label={t('wizards.ownershipChange.documents.demise')}>
            <option value="spouse-demise">{t('wizards.ownershipChange.documents.spouse')}</option>
            <option value="family-demise">{t('wizards.ownershipChange.documents.family')}</option>
            <option value="both-demise">{t('wizards.ownershipChange.documents.both')}</option>
          </optgroup>
          <optgroup label={t('wizards.ownershipChange.documents.otherGrp')}>
            <option value="temporary">{t('wizards.ownershipChange.documents.temporary')}</option>
          </optgroup>
        </select>
      </div>

      <div className="card mt-4" style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.ownershipChange.documents.provideFollowing')}</h4>
        
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {getDocuments().map((doc, idx) => (
            <li key={idx} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
              <input type="checkbox" className="checkbox-input" style={{ marginTop: '0.2rem' }} required />
              <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{doc}</span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0, 166, 80, 0.05)', borderLeft: '4px solid var(--slt-green)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>{t('wizards.ownershipChange.documents.note')}</strong> {t('wizards.ownershipChange.documents.noteText')}
        </div>
      </div>
    </div>
  );
}
