import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';

export default function Navbar() {
  return (
    <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--slt-blue)' }}>
        <FiFileText size={24} color="var(--slt-green)" />
        <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>SLTMobitel Paperless</span>
      </Link>
      <div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Agent Dashboard</span>
      </div>
    </nav>
  );
}
