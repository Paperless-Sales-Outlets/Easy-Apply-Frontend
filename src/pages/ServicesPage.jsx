import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlusCircle, FiLink, FiMapPin,
  FiTrash2, FiUserCheck, FiTrendingUp,
  FiClock, FiDollarSign, FiCheckSquare,
  FiShoppingCart, FiChevronRight
} from 'react-icons/fi';
import { getLocalCart } from '../services/productService';

const SERVICES_DATA = [
  {
    id: 'new-connection',
    title: 'New Connection',
    description: 'Request for new connection of FTTH, LTE, or Copper services.',
    icon: <FiPlusCircle size={26} aria-hidden="true" />,
    route: '/new-connection',
  },
  {
    id: 'reconnection',
    title: 'Reactivate Account',
    description: 'Quickly restore your disconnected SLT services.',
    icon: <FiLink size={26} aria-hidden="true" />,
    route: '/reconnection',
  },
  {
    id: 'relocation',
    title: 'Relocation',
    description: 'Request relocation of a connection (FTTH, LTE, Copper, or PEO TV).',
    icon: <FiMapPin size={26} aria-hidden="true" />,
    route: '/location-change',
  },
  {
    id: 'termination',
    title: 'Termination (Disconnection)',
    description: 'Request termination or disconnection of services.',
    icon: <FiTrash2 size={26} aria-hidden="true" />,
    route: '/termination',
  },
  {
    id: 'transfer',
    title: 'Transfer (Change of Ownership)',
    description: 'Transfer ownership of an existing connection.',
    icon: <FiUserCheck size={26} aria-hidden="true" />,
    route: '/ownership-change',
  },
  {
    id: 'package-upgration',
    title: 'Package Upgration',
    description: 'Apply for upgrade of your current package.',
    icon: <FiTrendingUp size={26} aria-hidden="true" />,
    route: '/package-upgration',
  },
  {
    id: 'service-vacation',
    title: 'Service Vacation',
    description: 'Apply for temporary service vacation.',
    icon: <FiClock size={26} aria-hidden="true" />,
    route: '/service-vacation',
  },
  {
    id: 'refund-request',
    title: 'Refund Request',
    description: 'Request a refund for deposits or overpayments.',
    icon: <FiDollarSign size={26} aria-hidden="true" />,
    route: '/refund-request',
  },
  {
    id: 'customer-request',
    title: 'General Customer Request',
    description: 'General application for accepting various customer requests.',
    icon: <FiCheckSquare size={26} aria-hidden="true" />,
    route: '/customer-request-acceptance',
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return getLocalCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    const syncCart = () => {
      try {
        setCartCount(getLocalCart().reduce((sum, item) => sum + (item.quantity || 1), 0));
      } catch (e) {
        setCartCount(0);
      }
    };
    syncCart();
    window.addEventListener('easyapply:cart-updated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('easyapply:cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  return (
    <div className="page-wide">
      <div className="page-head">
        <div>
          <h1 className="page-title">
            <span className="slash" aria-hidden="true"><i /><i /></span>
            Online Application Forms
          </h1>
          <p className="page-lead">Apply online for changes to your SLT connection. No forms to print, no queues.</p>
        </div>
        <div className="page-head__actions">
          <button type="button" className="btn-ds btn-ds--buy" onClick={() => navigate('/cart')}>
            <FiShoppingCart size={18} aria-hidden="true" />
            <span>{cartCount > 0 ? `View Cart (${cartCount})` : 'View Cart'}</span>
          </button>
          <button type="button" className="btn-ds btn-ds--outline" onClick={() => navigate('/check-status')}>
            Check Status
          </button>
        </div>
      </div>

      <ul className="svc-grid">
        {SERVICES_DATA.map((service) => (
          <li key={service.id}>
            <button
              type="button"
              className="svc-card"
              onClick={() => navigate(service.route)}
              aria-label={`${service.title}: ${service.description}`}
            >
              <span className="svc-card__tile">{service.icon}</span>
              <span className="svc-card__text">
                <strong>{service.title}</strong>
                <span>{service.description}</span>
              </span>
              <FiChevronRight size={22} aria-hidden="true" className="svc-card__go" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
