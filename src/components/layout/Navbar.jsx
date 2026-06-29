import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  return (
    <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--slt-blue)' }}>
        <FiFileText size={24} color="var(--slt-green)" />
        <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>{t('nav.title')}</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.6rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <FiGlobe size={16} color="var(--slt-blue)" />
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <option value="en">English</option>
            <option value="si">සිංහල (Sinhala)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
