import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiBriefcase, FiUsers, FiFileText, FiCheck, FiInfo, FiLayers } from 'react-icons/fi';
import FileUploadField from '../../components/form/FileUploadField';
import NicUploadSection from '../../components/form/NicUploadSection';

export default function DocumentsStep({ isActive }) {
  const { t } = useTranslation();
  const [transferType, setTransferType] = useState('person-to-person');
  const [nicFormat, setNicFormat] = useState('pdf');
  const [activeCategory, setActiveCategory] = useState('standard');
  const [uploads, setUploads] = useState({
    newOwnerConsent: null,
    newOwnerNicPdf: null,
    newOwnerNicFront: null,
    newOwnerNicBack: null,
    supportingDoc1: null,
    supportingDoc2: null,
  });

  const handleFileChange = (name, fileData) => {
    setUploads((prev) => ({ ...prev, [name]: fileData }));
  };

  const SCENARIOS = [
    {
      id: 'person-to-person',
      category: 'standard',
      title: 'Individual to Individual',
      badge: 'Most Common',
      desc: 'Transfer from current registered individual customer to another person.',
      icon: <FiUser size={20} />,
    },
    {
      id: 'person-to-company',
      category: 'standard',
      title: 'Individual to Business / Company',
      badge: 'Corporate',
      desc: 'Transfer from a personal account to an incorporated business or organization.',
      icon: <FiBriefcase size={20} />,
    },
    {
      id: 'company-to-company',
      category: 'standard',
      title: 'Company to Company',
      badge: 'B2B',
      desc: 'Transfer line between two registered business entities.',
      icon: <FiLayers size={20} />,
    },
    {
      id: 'private-to-official',
      category: 'standard',
      title: 'Personal to Official / Corporate Account',
      badge: 'Staff/Official',
      desc: 'Convert personal private line into an authorized corporate line.',
      icon: <FiBriefcase size={20} />,
    },
    {
      id: 'official-to-private',
      category: 'standard',
      title: 'Official Account to Personal Line',
      badge: 'Personal',
      desc: 'Transfer an employer/organization line to personal individual ownership.',
      icon: <FiUser size={20} />,
    },
    {
      id: 'spouse-demise',
      category: 'bereavement',
      title: 'Transfer to Surviving Spouse',
      badge: 'Family',
      desc: 'Line transfer following the passing of the registered account holder.',
      icon: <FiUsers size={20} />,
    },
    {
      id: 'family-demise',
      category: 'bereavement',
      title: 'Transfer to Immediate Family / Next of Kin',
      badge: 'Family',
      desc: 'Transfer to children or parents upon passing of registered customer.',
      icon: <FiUsers size={20} />,
    },
    {
      id: 'both-demise',
      category: 'bereavement',
      title: 'Legal Heir Transfer (Both Spouses Deceased)',
      badge: 'Estate',
      desc: 'Transfer to legitimate heir where both account holder and spouse are deceased.',
      icon: <FiFileText size={20} />,
    },
    {
      id: 'temporary',
      category: 'special',
      title: 'Temporary Transfer (Owner Abroad / Untraceable)',
      badge: 'Special',
      desc: 'Interim transfer via Indemnity Bond when original owner is unreachable.',
      icon: <FiInfo size={20} />,
    },
  ];

  const filteredScenarios = SCENARIOS.filter((s) => s.category === activeCategory);

  const getDocuments = () => {
    switch (transferType) {
      case 'person-to-company':
        return [
          t('wizards.ownershipChange.documents.docs.form20'),
          t('wizards.ownershipChange.documents.docs.brCopy'),
          t('wizards.ownershipChange.documents.docs.companyRequest'),
          t('wizards.ownershipChange.documents.docs.companyResolution'),
        ];
      case 'company-to-company':
        return [
          t('wizards.ownershipChange.documents.docs.form20'),
          t('wizards.ownershipChange.documents.docs.companyResolution'),
          t('wizards.ownershipChange.documents.docs.brCopy'),
          t('wizards.ownershipChange.documents.docs.companyRequestOfficial'),
        ];
      case 'private-to-official':
      case 'official-to-private':
        return [
          t('wizards.ownershipChange.documents.docs.authLetter'),
          t('wizards.ownershipChange.documents.docs.consentPresentOwner'),
        ];
      case 'spouse-demise':
        return [
          t('wizards.ownershipChange.documents.docs.marriageCert'),
          t('wizards.ownershipChange.documents.docs.deathCert'),
          t('wizards.ownershipChange.documents.docs.birthCert'),
          t('wizards.ownershipChange.documents.docs.spouseRequest'),
        ];
      case 'family-demise':
        return [
          t('wizards.ownershipChange.documents.docs.deathCertOrGs'),
          t('wizards.ownershipChange.documents.docs.marriageOrBirth'),
          t('wizards.ownershipChange.documents.docs.closestRelationRequest'),
        ];
      case 'both-demise':
        return [
          t('wizards.ownershipChange.documents.docs.deathCert'),
          t('wizards.ownershipChange.documents.docs.birthCertUser'),
          t('wizards.ownershipChange.documents.docs.familyConsent'),
          t('wizards.ownershipChange.documents.docs.gsJpCert'),
        ];
      case 'temporary':
        return [
          t('wizards.ownershipChange.documents.docs.legalOwnerMissing'),
          t('wizards.ownershipChange.documents.docs.tempForm'),
          t('wizards.ownershipChange.documents.docs.presentUserRequest'),
        ];
      default:
        return [];
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ color: 'var(--slt-blue, #0f57a8)', fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.35rem' }}>
          {t('wizards.ownershipChange.documents.heading')}
        </h3>
        <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.92rem' }}>
          Choose your transfer scenario and attach the required identification and supporting authorization documents.
        </p>
      </div>

      {/* Hidden input to pass selected transferScenario in form submit */}
      <input type="hidden" name="transferScenario" value={transferType} />

      {/* Category Tabs */}
      <div style={{ marginBottom: '1rem' }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
          Transfer Scenario Category
        </label>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'rgba(15, 87, 168, 0.05)',
            padding: '0.3rem',
            borderRadius: '12px',
            border: '1px solid rgba(15, 87, 168, 0.12)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveCategory('standard');
              if (!SCENARIOS.find((s) => s.id === transferType && s.category === 'standard')) {
                setTransferType('person-to-person');
              }
            }}
            style={{
              flex: 1,
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              backgroundColor: activeCategory === 'standard' ? '#ffffff' : 'transparent',
              color: activeCategory === 'standard' ? 'var(--slt-blue, #0f57a8)' : 'var(--text-secondary, #64748b)',
              boxShadow: activeCategory === 'standard' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <FiUser size={15} /> Standard Transfers
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('bereavement');
              if (!SCENARIOS.find((s) => s.id === transferType && s.category === 'bereavement')) {
                setTransferType('spouse-demise');
              }
            }}
            style={{
              flex: 1,
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              backgroundColor: activeCategory === 'bereavement' ? '#ffffff' : 'transparent',
              color: activeCategory === 'bereavement' ? 'var(--slt-blue, #0f57a8)' : 'var(--text-secondary, #64748b)',
              boxShadow: activeCategory === 'bereavement' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <FiUsers size={15} /> Demise / Bereavement
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('special');
              setTransferType('temporary');
            }}
            style={{
              flex: 1,
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              backgroundColor: activeCategory === 'special' ? '#ffffff' : 'transparent',
              color: activeCategory === 'special' ? 'var(--slt-blue, #0f57a8)' : 'var(--text-secondary, #64748b)',
              boxShadow: activeCategory === 'special' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <FiFileText size={15} /> Special Cases
          </button>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.75rem',
        }}
      >
        {filteredScenarios.map((s) => {
          const isSelected = transferType === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setTransferType(s.id)}
              style={{
                border: isSelected ? '2px solid var(--slt-blue, #0f57a8)' : '1.5px solid var(--border-color, #e2e8f0)',
                backgroundColor: isSelected ? 'rgba(15, 87, 168, 0.04)' : '#ffffff',
                borderRadius: '14px',
                padding: '1rem 1.15rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'var(--slt-blue, #0f57a8)' : 'rgba(15, 87, 168, 0.08)',
                      color: isSelected ? '#ffffff' : 'var(--slt-blue, #0f57a8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {s.icon}
                  </div>
                  {s.badge && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '20px',
                        backgroundColor: isSelected ? 'rgba(15, 87, 168, 0.12)' : '#f1f5f9',
                        color: isSelected ? 'var(--slt-blue, #0f57a8)' : '#64748b',
                      }}
                    >
                      {s.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 800, color: isSelected ? 'var(--slt-blue, #0f57a8)' : '#0f172a', fontSize: '0.98rem', marginBottom: '0.25rem' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: '1.4' }}>
                  {s.desc}
                </div>
              </div>

              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.65rem' }}>
                  <FiCheck size={14} /> Selected Scenario
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Document Uploads Card */}
      <div
        className="card"
        style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--slt-blue, #0f57a8)' }}>
          <FiFileText size={20} />
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>
            {t('wizards.ownershipChange.documents.provideFollowing')}
          </h4>
        </div>

        {/* 1. New Owner Consent Document */}
        <FileUploadField
          name="newOwnerConsent"
          label={t('wizards.ownershipChange.documents.docs.newOwnerConsent')}
          accept=".pdf,.jpg,.jpeg,.png"
          required={isActive}
          value={uploads.newOwnerConsent}
          onChange={handleFileChange}
          helpText="Upload the signed agreement or consent form authorizing this line transfer."
        />

        {/* 2. New Owner NIC Upload with Radio Toggle */}
        <NicUploadSection
          format={nicFormat}
          onFormatChange={setNicFormat}
          values={uploads}
          onFileChange={handleFileChange}
          required={isActive}
          idPrefix="oc"
          pdfName="newOwnerNicPdf"
          frontName="newOwnerNicFront"
          backName="newOwnerNicBack"
          pdfLabel={t('wizards.ownershipChange.documents.docs.newOwnerNic')}
          frontLabel={t('wizards.ownershipChange.documents.nicFront')}
          backLabel={t('wizards.ownershipChange.documents.nicBack')}
          pdfHelpText={t('wizards.ownershipChange.documents.nicPdfHelp')}
          formatLabel={t('wizards.ownershipChange.documents.nicFormatLabel')}
        />

        {/* 3. Additional Required Supporting Checklist for Special Scenarios */}
        {transferType !== 'person-to-person' && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'block' }}>
              Scenario-Specific Document Checklist:
            </label>
            <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 1rem 0' }}>
              {getDocuments().map((doc, idx) => (
                <li key={idx} style={{ marginBottom: '0.65rem' }}>
                  <label className="checkbox-label" style={{ alignItems: 'flex-start', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      name={`requiredDoc_${idx}`}
                      className="checkbox-input"
                      style={{ marginTop: '0.2rem' }}
                      defaultChecked
                    />
                    <span style={{ color: '#334155', lineHeight: '1.4' }}>{doc}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '1rem' }}>
              <FileUploadField
                name="supportingDoc1"
                label="Upload Scenario Supporting Document (e.g. Death Cert / Marriage Cert / Form 20 / Resolution)"
                accept=".pdf,.jpg,.jpeg,.png"
                value={uploads.supportingDoc1}
                onChange={handleFileChange}
                helpText="Attach any official legal certificate or authorization letter required for this scenario."
              />
            </div>
          </div>
        )}

        {Object.entries(uploads).map(([key, val]) =>
          val ? <input key={key} type="hidden" name={key} value={val.data} /> : null
        )}

        {/* Informational Guidance Note */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.9rem 1.15rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            lineHeight: '1.5',
          }}
        >
          <FiInfo size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>{t('wizards.ownershipChange.documents.note')}</strong> {t('wizards.ownershipChange.documents.noteText')}
          </div>
        </div>
      </div>
    </div>
  );
}
