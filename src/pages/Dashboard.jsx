import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';


const FORMS = [
  { id: 'new-connection', key: 'newConnection', icon: 'plus-circle', route: '/new-connection' },
  { id: 'reconnection', key: 'reconnection', icon: 'link', route: '/reconnection' },
  { id: 'relocation', key: 'relocation', icon: 'map-pin', route: '/location-change' },
  { id: 'termination', key: 'termination', icon: 'trash', route: '/termination' },
  { id: 'transfer', key: 'transfer', icon: 'user-check', route: '/ownership-change' },
  { id: 'package-migration', key: 'packageMigration', icon: 'trending-up', route: '/package-migration' },
  { id: 'service-vacation', key: 'serviceVacation', icon: 'clock', route: '/service-vacation' },
  { id: 'refund-request', key: 'refundRequest', icon: 'banknote', route: '/refund-request' },
  { id: 'customer-request-acceptance', key: 'customerRequestAcceptance', icon: 'check-square', route: '/customer-request-acceptance' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>


      <section className="page-container" aria-labelledby="forms-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 id="forms-heading" className="section-title" style={{ marginBottom: 0 }}>
            {t('dashboard.title')}
          </h2>
          <Link to="/check-status" className="btn btn-secondary">
            {t('dashboard.forms.checkStatus.title')}
          </Link>
        </div>
        <motion.ul
          className="dashboard-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {FORMS.map((form) => (
            <motion.li key={form.id} variants={itemVariants}>
              <Link to={form.route} className="form-tile">
                <span className="tile-icon">
                  <Icon name={form.icon} size={24} />
                </span>
                <span className="tile-body">
                  <span className="tile-title">{t(`dashboard.forms.${form.key}.title`)}</span>
                  <span className="tile-desc">{t(`dashboard.forms.${form.key}.description`)}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>
    </div>
  );
}
