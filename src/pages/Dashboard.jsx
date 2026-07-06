import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlusCircle, FiLink, FiMapPin, FiTrash2, 
  FiUserCheck, FiTrendingUp, FiClock, FiDollarSign, FiCheckSquare 
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import heroSlt from '../assets/HeroSLT.png';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-wrapper" 
      style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 150px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <img src={heroSlt} alt="SLTMobitel" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-text"
      >
        <h1>{t('hero.welcome')}</h1>
        <p>{t('hero.subtitle')}</p>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}
      >
        {t('dashboard.title')}
      </motion.h2>

      <motion.div 
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {forms.map(form => (
          <motion.div 
            key={form.id} 
            variants={itemVariants}
            whileHover={form.active ? { y: -4, boxShadow: 'var(--shadow-lg)' } : {}}
            whileTap={form.active ? { scale: 0.98 } : {}}
            className="card"
            style={{ 
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              cursor: form.active ? 'pointer' : 'not-allowed',
              opacity: form.active ? 1 : 0.6,
              height: '100%'
            }}
            onClick={() => form.active && navigate(form.route)}
          >
            <div style={{ 
              color: form.active ? 'var(--slt-green)' : 'var(--text-secondary)', 
              flexShrink: 0,
              backgroundColor: form.active ? 'rgba(0, 166, 80, 0.1)' : 'transparent',
              padding: '12px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {form.icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ marginBottom: '0.25rem', color: form.active ? 'var(--slt-blue)' : 'var(--text-secondary)', overflowWrap: 'break-word' }}>{form.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, overflowWrap: 'break-word' }}>{form.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
