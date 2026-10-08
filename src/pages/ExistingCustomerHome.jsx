import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiRefreshCw, FiMapPin, FiRepeat, FiTrendingUp, FiSun, FiDollarSign,
  FiFileText, FiPower, FiPackage, FiUser, FiGrid, FiChevronRight,
  FiCheckCircle, FiClock, FiAlertCircle, FiHelpCircle,
} from 'react-icons/fi';
import LiveStatusBadge from '../components/LiveStatusBadge';
import { AUTH_UPDATED_EVENT, getSession, getAuthUser, selectAccount } from '../utils/authSession';
import api from '../utils/api';

// The eight account services — everything except New Connection.
const SERVICES = [
  { title: 'Reconnection', desc: 'Restore a disconnected service', route: '/reconnection', icon: FiRefreshCw },
  { title: 'Relocation', desc: 'Move your connection to a new address', route: '/location-change', icon: FiMapPin },
  { title: 'Transfer Ownership', desc: 'Change the owner of this connection', route: '/ownership-change', icon: FiRepeat },
  { title: 'Package Migration', desc: 'Upgrade or change your package', route: '/package-migration', icon: FiTrendingUp },
  { title: 'Service Vacation', desc: 'Pause your service temporarily', route: '/service-vacation', icon: FiSun },
  { title: 'Termination', desc: 'Disconnect this service', route: '/termination', icon: FiPower },
  { title: 'Refund Request', desc: 'Claim deposits or overpayments', route: '/refund-request', icon: FiDollarSign },
  { title: 'General Request', desc: 'Any other request or enquiry', route: '/customer-request-acceptance', icon: FiFileText },
];

const REQUEST_LABELS = {
  reconnection: 'Reconnection', relocation: 'Relocation', 'location-change': 'Relocation',
  termination: 'Termination', transfer: 'Ownership Transfer', 'ownership-change': 'Ownership Transfer',
  'package-migration': 'Package Migration', 'service-vacation': 'Service Vacation',
  'refund-request': 'Refund Request', 'customer-request-acceptance': 'General Request',
  'internet-services': 'Internet Services', 'new-connection': 'New Connection',
};

const STATUS = {
  approved: { label: 'Approved', color: '#047857', bg: '#ecfdf5', Icon: FiCheckCircle },
  rejected: { label: 'Rejected', color: '#b91c1c', bg: '#fef2f2', Icon: FiAlertCircle },
  pending: { label: 'Pending', color: '#b45309', bg: '#fffbeb', Icon: FiClock },
};

const css = `
.ech{background:var(--page-bg);min-height:100vh;padding:2rem 0 4rem}
.ech-wrap{max-width:var(--page-max);margin:0 auto;padding:0 var(--page-gutter);display:grid;gap:1.5rem}
.ech-hero{position:relative;overflow:hidden;background:var(--brand-gradient);color:#fff;border-radius:16px;padding:2rem 2.25rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;box-shadow:0 20px 40px -10px rgba(0,86,179,.25)}
.ech-hero::before{content:'';position:absolute;top:-150px;right:-100px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,.18),transparent 70%);filter:blur(40px)}
.ech-hero>*{position:relative}
.ech-avatar{width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);display:grid;place-items:center;flex-shrink:0}
.ech-card{background:rgba(255,255,255,.7);backdrop-filter:blur(12px);border:1px solid #e2e8f0;border-radius:16px;padding:1.75rem;box-shadow:10px 10px 30px rgba(200,208,220,.35),-10px -10px 30px rgba(255,255,255,.9)}
.ech-h{display:flex;align-items:center;gap:.6rem;margin:0 0 1.25rem;font-size:1.1rem;font-weight:800;color:#0f172a}
.ech-tile{width:34px;height:34px;border-radius:8px;background:var(--brand-gradient);color:#fff;display:grid;place-items:center;flex-shrink:0}
.ech-main{display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;align-items:start}
.ech-col{display:grid;gap:1.5rem}
.ech-services{display:grid;grid-template-columns:repeat(4,1fr);gap:.9rem}
.ech-svc{display:flex;flex-direction:column;gap:.5rem;text-align:left;padding:1.1rem;border:1px solid #e2e8f0;border-radius:12px;background:#fff;cursor:pointer;font:inherit;transition:transform .15s,box-shadow .15s,border-color .15s}
.ech-svc:hover,.ech-svc:focus-visible{transform:translateY(-3px);border-color:#0056b3;box-shadow:0 10px 24px rgba(0,86,179,.14);outline:none}
.ech-ico{width:42px;height:42px;border-radius:10px;background:#e3f0fe;color:#0056b3;display:grid;place-items:center;transition:background .15s,color .15s}
.ech-svc:hover .ech-ico,.ech-svc:focus-visible .ech-ico{background:var(--brand-gradient);color:#fff}
.ech-details{display:grid;grid-template-columns:repeat(2,1fr);gap:1.1rem}
.ech-lbl{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748b;margin-bottom:.2rem}
.ech-val{font-size:.95rem;font-weight:700;color:#1e293b;word-break:break-word}
.ech-prod{display:flex;justify-content:space-between;align-items:center;gap:.75rem;width:100%;padding:.85rem 1rem;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;text-align:left;font:inherit;transition:border-color .15s,background .15s}
.ech-prod:hover{border-color:#94a3b8}
.ech-prod[aria-current=true]{border-color:#0056b3;background:#eff6ff}
.ech-req{display:flex;justify-content:space-between;align-items:center;gap:.75rem;padding:.85rem 1rem;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}
.ech-link{display:inline-flex;align-items:center;gap:.3rem;padding:.5rem 1rem;border-radius:12px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;font-weight:700;font-size:.85rem;cursor:pointer}
.ech-link:hover{background:#f1f5f9}
.ech-help{background:var(--brand-gradient-soft);color:#fff;border:0}
@media(max-width:1000px){.ech-main{grid-template-columns:1fr}.ech-services{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.ech-services,.ech-details{grid-template-columns:1fr}.ech-hero{padding:1.5rem}}
`;

const Detail = ({ label, value }) => (
  <div><span className="ech-lbl">{label}</span><span className="ech-val">{value || 'NA'}</span></div>
);

const Heading = ({ id, icon: Icon, children }) => (
  <h2 className="ech-h" id={id}><span className="ech-tile"><Icon size={18} aria-hidden="true" /></span>{children}</h2>
);

export default function ExistingCustomerHome() {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession);
  const [requests, setRequests] = useState(null); // null = loading

  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener(AUTH_UPDATED_EVENT, sync);
    return () => window.removeEventListener(AUTH_UPDATED_EVENT, sync);
  }, []);

  const { mobileNumber, accountsList, user } = session;
  const account = session.selectedAccount || accountsList[0] || {};

  useEffect(() => {
    let alive = true;
    api.get(`/applications/by-phone?phone=${encodeURIComponent(mobileNumber)}`)
      .then((res) => alive && setRequests(res.data?.applications || []))
      .catch(() => alive && setRequests([]));
    return () => { alive = false; };
  }, [mobileNumber]);

  const name = account.fullName || account.customerName || user?.name || getAuthUser()?.name || 'Customer';
  const packageName = account.packageName || account.package;

  // Wizards read the chosen connection from the session, so pin it before leaving.
  const go = (route) => { selectAccount(account); navigate(route); };

  return (
    <div className="ech">
      <style>{css}</style>
      <div className="ech-wrap">
        <section className="ech-hero" aria-label="Account summary">
          <div className="ech-avatar"><FiUser size={30} color="rgba(255,255,255,.9)" aria-hidden="true" /></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ margin: 0, fontSize: '.85rem', color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>Welcome back</p>
            <h1 style={{ margin: '.15rem 0 .4rem', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-.5px', color: '#fff' }}>{name}</h1>
            <p style={{ margin: 0, fontSize: '.92rem', color: 'rgba(255,255,255,.85)' }}>
              {account.telephone ? `Line ${account.telephone}` : `Mobile +94 ${mobileNumber}`}
              {account.accountNumber ? ` | Account ${account.accountNumber}` : ''}
              {packageName ? ` | ${packageName}` : ''}
            </p>
          </div>
          <LiveStatusBadge status={account.status} />
        </section>

        <div className="ech-main">
          <div className="ech-col">
            <section className="ech-card" aria-labelledby="ech-services">
              <Heading id="ech-services" icon={FiGrid}>Account Services</Heading>
              <div className="ech-services">
                {SERVICES.map(({ title, desc, route, icon: Icon }) => (
                  <button key={route} type="button" className="ech-svc" onClick={() => go(route)}>
                    <span className="ech-ico"><Icon size={20} aria-hidden="true" /></span>
                    <strong style={{ color: '#0f172a', fontSize: '.92rem' }}>{title}</strong>
                    <span style={{ color: '#64748b', fontSize: '.78rem', lineHeight: 1.45 }}>{desc}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="ech-card" aria-labelledby="ech-reqs">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <Heading id="ech-reqs" icon={FiFileText}>My Service Requests</Heading>
                <button type="button" className="ech-link" onClick={() => navigate('/check-status')}>
                  Track Status <FiChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
              {requests === null && <p style={{ color: '#64748b', margin: 0 }}>Loading requests...</p>}
              {requests?.length === 0 && <p style={{ color: '#64748b', margin: 0 }}>No service requests yet. Pick a service above to get started.</p>}
              <div style={{ display: 'grid', gap: '.6rem' }}>
                {requests?.slice(0, 5).map((r) => {
                  const s = STATUS[r.status] || STATUS.pending;
                  return (
                    <div className="ech-req" key={r.referenceNumber}>
                      <div>
                        <strong style={{ color: '#0f172a', fontSize: '.92rem' }}>{REQUEST_LABELS[r.serviceType] || r.serviceType}</strong>
                        <div style={{ color: '#64748b', fontSize: '.78rem', marginTop: 2 }}>
                          {r.referenceNumber}{r.createdAt ? ` | ${new Date(r.createdAt).toLocaleDateString('en-LK')}` : ''}
                        </div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '.3rem .7rem', borderRadius: 9999, background: s.bg, color: s.color, fontSize: '.75rem', fontWeight: 700 }}>
                        <s.Icon size={13} aria-hidden="true" /> {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="ech-col">
            <section className="ech-card" aria-labelledby="ech-cust">
              <Heading id="ech-cust" icon={FiUser}>Customer Details</Heading>
              <div className="ech-details">
                <Detail label="Name" value={name} />
                <Detail label="Telephone" value={account.telephone || account.phoneNumber} />
                <Detail label="Package" value={packageName} />
                <Detail label="Outstanding" value={account.outstandingBalance != null ? `Rs. ${Number(account.outstandingBalance).toLocaleString('en-LK')}` : ''} />
                <div style={{ gridColumn: '1 / -1' }}><Detail label="Registered Address" value={account.address} /></div>
              </div>
            </section>

            <section className="ech-card" aria-labelledby="ech-prods">
              <Heading id="ech-prods" icon={FiPackage}>My Products ({accountsList.length})</Heading>
              <div style={{ display: 'grid', gap: '.6rem' }}>
                {accountsList.map((a, i) => (
                  <button key={a.accountNumber || a.telephone || i} type="button" className="ech-prod"
                    aria-current={(a.accountNumber || a.telephone) === (account.accountNumber || account.telephone)}
                    onClick={() => selectAccount(a)}>
                    <span>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '.9rem' }}>{a.packageName || a.package || a.serviceType || 'SLT Service'}</strong>
                      <span style={{ color: '#64748b', fontSize: '.78rem' }}>{a.telephone || a.accountNumber}</span>
                    </span>
                    <LiveStatusBadge status={a.status} size="sm" />
                  </button>
                ))}
              </div>
            </section>

            <section className="ech-card ech-help" aria-labelledby="ech-help">
              <h2 className="ech-h" id="ech-help" style={{ color: '#fff' }}>Need Assistance?</h2>
              <p style={{ margin: '0 0 1rem', fontSize: '.88rem', color: 'rgba(255,255,255,.85)', lineHeight: 1.5 }}>
                Our support team can help with any request or question about your connection.
              </p>
              <button type="button" onClick={() => navigate('/help')}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '.75rem', borderRadius: 10, border: 0, background: '#fff', color: '#0b4a91', fontWeight: 700, cursor: 'pointer' }}>
                <FiHelpCircle aria-hidden="true" /> Get Help / Support
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
