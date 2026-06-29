import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiEdit, FiTrash2, FiSettings, FiRefreshCcw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const forms = [
    { id: 'new-connection', title: t('dashboard.forms.newConnection.title'), description: t('dashboard.forms.newConnection.description'), icon: <FiPlusCircle size={32} />, active: true, route: '/new-connection' },
    { id: 'internet-services', title: t('dashboard.forms.internetServices.title'), description: t('dashboard.forms.internetServices.description'), icon: <FiSettings size={32} />, active: true, route: '/internet-services' },
    { id: 'ownership-change', title: t('dashboard.forms.ownershipChange.title'), description: t('dashboard.forms.ownershipChange.description'), icon: <FiRefreshCcw size={32} />, active: true, route: '/ownership-change' },
    { id: 'location-change', title: t('dashboard.forms.locationChange.title'), description: t('dashboard.forms.locationChange.description'), icon: <FiEdit size={32} />, active: true, route: '/location-change' },
    { id: 'termination', title: t('dashboard.forms.termination.title'), description: t('dashboard.forms.termination.description'), icon: <FiTrash2 size={32} />, active: true, route: '/termination' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>{t('dashboard.title')}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('dashboard.subtitle')}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {forms.map(form => (
          <div 
            key={form.id} 
            className="card"
            style={{ 
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              width: '100%',
              cursor: form.active ? 'pointer' : 'not-allowed',
              opacity: form.active ? 1 : 0.6,
              transition: 'transform 0.2s',
            }}
            onClick={() => form.active && navigate(form.route)}
            onMouseOver={(e) => { if(form.active) e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseOut={(e) => { if(form.active) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ color: form.active ? 'var(--slt-green)' : 'var(--text-secondary)', flexShrink: 0 }}>
              {form.icon}
            </div>
            <div>
              <h3 style={{ marginBottom: '0.25rem', color: form.active ? 'var(--slt-blue)' : 'var(--text-secondary)' }}>{form.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{form.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
