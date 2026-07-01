import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlusCircle, FiLink, FiMapPin, FiTrash2, 
  FiUserCheck, FiTrendingUp, FiClock, FiDollarSign, FiCheckSquare 
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const forms = [
    { id: 'new-connection', title: t('dashboard.forms.newConnection.title'), description: t('dashboard.forms.newConnection.description'), icon: <FiPlusCircle size={32} />, active: true, route: '/new-connection' },
    { id: 'reconnection', title: t('dashboard.forms.reconnection.title'), description: t('dashboard.forms.reconnection.description'), icon: <FiLink size={32} />, active: true, route: '/reconnection' },
    { id: 'relocation', title: t('dashboard.forms.relocation.title'), description: t('dashboard.forms.relocation.description'), icon: <FiMapPin size={32} />, active: true, route: '/location-change' },
    { id: 'termination', title: t('dashboard.forms.termination.title'), description: t('dashboard.forms.termination.description'), icon: <FiTrash2 size={32} />, active: true, route: '/termination' },
    { id: 'transfer', title: t('dashboard.forms.transfer.title'), description: t('dashboard.forms.transfer.description'), icon: <FiUserCheck size={32} />, active: true, route: '/ownership-change' },
    { id: 'package-migration', title: t('dashboard.forms.packageMigration.title'), description: t('dashboard.forms.packageMigration.description'), icon: <FiTrendingUp size={32} />, active: true, route: '/package-migration' },
    { id: 'service-vacation', title: t('dashboard.forms.serviceVacation.title'), description: t('dashboard.forms.serviceVacation.description'), icon: <FiClock size={32} />, active: true, route: '/service-vacation' },
    { id: 'refund-request', title: t('dashboard.forms.refundRequest.title'), description: t('dashboard.forms.refundRequest.description'), icon: <FiDollarSign size={32} />, active: true, route: '/refund-request' },
    { id: 'customer-request-acceptance', title: t('dashboard.forms.customerRequestAcceptance.title'), description: t('dashboard.forms.customerRequestAcceptance.description'), icon: <FiCheckSquare size={32} />, active: true, route: '/customer-request-acceptance' },
  ];

  return (
    <div className="dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 150px)' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>{t('dashboard.title')}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('dashboard.subtitle')}</p>
      
      <div className="dashboard-grid">
        {forms.map(form => (
          <div 
            key={form.id} 
            className="card"
            style={{ 
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              cursor: form.active ? 'pointer' : 'not-allowed',
              opacity: form.active ? 1 : 0.6,
              transition: 'transform 0.2s, box-shadow 0.2s',
              height: '100%'
            }}
            onClick={() => form.active && navigate(form.route)}
            onMouseOver={(e) => { 
              if(form.active) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              } 
            }}
            onMouseOut={(e) => { 
              if(form.active) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              } 
            }}
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
