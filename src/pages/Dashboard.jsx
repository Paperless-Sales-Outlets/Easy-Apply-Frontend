import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiFile, FiEdit, FiTrash2, FiUserCheck, FiSettings } from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();

  const forms = [
    { id: 'new-connection', title: 'New Connection', description: 'Application for new voice, broadband, or PEO TV services.', icon: <FiPlusCircle size={32} />, active: true, route: '/new-connection' },
    { id: 'internet-services', title: 'Internet Services', description: 'Application for new or upgrade of internet services.', icon: <FiSettings size={32} />, active: false },
    { id: 'ownership-change', title: 'Megaline Ownership Change', description: 'Transfer ownership of an existing Megaline connection.', icon: <FiUserCheck size={32} />, active: false },
    { id: 'location-change', title: 'Telephone Location Change', description: 'Request relocation of a telephone connection.', icon: <FiEdit size={32} />, active: false },
    { id: 'termination', title: 'Termination of Services', description: 'Request termination of existing services.', icon: <FiTrash2 size={32} />, active: false },
    { id: 'supplier-reg', title: 'Supplier Registration', description: 'Supplier registration checklist and application.', icon: <FiFile size={32} />, active: false },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Select an application form to digitize.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {forms.map(form => (
          <div 
            key={form.id} 
            className="card"
            style={{ 
              padding: '1.5rem', 
              cursor: form.active ? 'pointer' : 'not-allowed',
              opacity: form.active ? 1 : 0.6,
              transition: 'transform 0.2s',
            }}
            onClick={() => form.active && navigate(form.route)}
            onMouseOver={(e) => { if(form.active) e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseOut={(e) => { if(form.active) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ color: form.active ? 'var(--slt-green)' : 'var(--text-secondary)', marginBottom: '1rem' }}>
              {form.icon}
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: form.active ? 'var(--slt-blue)' : 'var(--text-secondary)' }}>{form.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{form.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
