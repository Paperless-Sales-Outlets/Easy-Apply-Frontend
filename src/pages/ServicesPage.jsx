import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPlusCircle, FiLink, FiMapPin, 
  FiTrash2, FiUserCheck, FiTrendingUp, 
  FiClock, FiDollarSign, FiCheckSquare,
  FiShoppingCart
} from 'react-icons/fi';

const SERVICES_DATA = [
  {
    id: 'new-connection',
    title: 'New Connection',
    description: 'Request for new connection of FTTH, LTE, or Copper services.',
    icon: <FiPlusCircle size={22} color="#0056b3" />,
    route: '/new-connection',
  },
  {
    id: 'reconnection',
    title: 'Reactivate Account',
    description: 'Quickly restore your disconnected SLT services.',
    icon: <FiLink size={22} color="#0056b3" />,
    route: '/reconnection',
  },
  {
    id: 'relocation',
    title: 'Relocation',
    description: 'Request relocation of a connection (FTTH, LTE, Copper, or PEO TV).',
    icon: <FiMapPin size={22} color="#0056b3" />,
    route: '/location-change',
  },
  {
    id: 'termination',
    title: 'Termination (Disconnection)',
    description: 'Request termination or disconnection of services.',
    icon: <FiTrash2 size={22} color="#0056b3" />,
    route: '/termination',
  },
  {
    id: 'transfer',
    title: 'Transfer (Change of Ownership)',
    description: 'Transfer ownership of an existing connection.',
    icon: <FiUserCheck size={22} color="#0056b3" />,
    route: '/ownership-change',
  },
  {
    id: 'package-migration',
    title: 'Package Migration',
    description: 'Apply for migration of your current package.',
    icon: <FiTrendingUp size={22} color="#0056b3" />,
    route: '/package-migration',
  },
  {
    id: 'service-vacation',
    title: 'Service Vacation',
    description: 'Apply for temporary service vacation.',
    icon: <FiClock size={22} color="#0056b3" />,
    route: '/service-vacation',
  },
  {
    id: 'refund-request',
    title: 'Refund Request',
    description: 'Request a refund for deposits or overpayments.',
    icon: <FiDollarSign size={22} color="#0056b3" />,
    route: '/refund-request',
  },
  {
    id: 'customer-request',
    title: 'General Customer Request',
    description: 'General application for accepting various customer requests.',
    icon: <FiCheckSquare size={22} color="#0056b3" />,
    route: '/customer-request-acceptance',
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ padding: '2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header bar area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '4px', fontStyle: 'italic', fontSize: '1.8rem', fontWeight: 900 }}>
              <span style={{ color: '#10b981' }}>/</span><span style={{ color: '#0056b3' }}>/</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Online Application Forms</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/cart')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: '#0056b3', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '0.6rem 1.2rem', fontWeight: 600,
                cursor: 'pointer', fontSize: '0.95rem'
              }}
            >
              <FiShoppingCart size={18} /> Add to Cart
            </button>
            <button
              onClick={() => navigate('/check-status')}
              style={{
                backgroundColor: '#eff6ff', color: '#0056b3',
                border: '1px solid #bfdbfe', borderRadius: '8px',
                padding: '0.6rem 1.2rem', fontWeight: 600,
                cursor: 'pointer', fontSize: '0.95rem'
              }}
            >
              Check Status
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem', 
          marginTop: '3rem'
        }}>
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(service.route)}
              role="button"
              tabIndex={0}
              aria-label={`${service.title}: ${service.description}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(service.route);
                }
              }}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
              }}
            >
              {/* Top Gradient Border */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '4px',
                background: 'linear-gradient(90deg, #0056b3 0%, #10b981 100%)'
              }} />

              <div style={{
                backgroundColor: '#f1f5f9',
                width: '52px',
                height: '52px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.2rem'
              }}>
                {service.icon}
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: 700 }}>
                  {service.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
