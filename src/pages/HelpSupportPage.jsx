import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPhone,
  FiMail,
  FiMessageCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiMapPin,
  FiHelpCircle,
  FiShield,
  FiWifi,
  FiTv,
  FiFileText,
  FiDollarSign,
} from 'react-icons/fi';

/* ── FAQ Data ─────────────────────────────────────────────────────────────── */
const FAQ_CATEGORIES = [
  {
    category: 'New Connections',
    icon: <FiWifi size={18} />,
    items: [
      {
        q: 'How do I apply for a new connection?',
        a: 'Navigate to the Home page, select "New Connection" from Our Services, and follow the step-by-step wizard. You will need your NIC, address details, and a contact number.',
      },
      {
        q: 'What documents are required for a new connection?',
        a: 'You will need a valid NIC or Passport, proof of address (utility bill or Grama Niladhari certificate), and a recent passport-size photograph.',
      },
      {
        q: 'How long does installation take?',
        a: 'Standard FTTH installations are typically completed within 3–5 working days from application approval. LTE connections may be activated within 24 hours.',
      },
    ],
  },
  {
    category: 'Billing & Payments',
    icon: <FiDollarSign size={18} />,
    items: [
      {
        q: 'How can I pay my bill online?',
        a: 'You can pay your bill through the SLTMobitel self-care portal, or via banking apps that support SLT bill payments. Visit myslt.slt.lk for online payments.',
      },
      {
        q: 'How do I request a refund?',
        a: 'Go to Our Services → Refund Request and fill out the application form. Refunds are typically processed within 14 working days.',
      },
      {
        q: 'What are the installation fees?',
        a: 'Installation fees vary by package and connection type. You can view the exact fee for each product on the Products page before adding to cart.',
      },
    ],
  },
  {
    category: 'Broadband & Internet',
    icon: <FiShield size={18} />,
    items: [
      {
        q: 'My internet speed is slow. What should I do?',
        a: 'Try restarting your router first. If the issue persists, check for any service outages in your area via our status page, or contact our support team at 1212.',
      },
      {
        q: 'Can I upgrade my broadband package?',
        a: 'Yes! Use the Package Migration service from Our Services to upgrade or change your current package. The change is typically applied within 24 hours.',
      },
      {
        q: 'What is the Fair Usage Policy (FUP)?',
        a: 'After exceeding your monthly data allowance, speeds may be reduced for the remainder of the billing cycle. Unlimited packages are not subject to FUP.',
      },
    ],
  },
  {
    category: 'PEO TV',
    icon: <FiTv size={18} />,
    items: [
      {
        q: 'How do I subscribe to PEO TV?',
        a: 'You can add PEO TV to your existing SLT connection by selecting a PEO TV package from our Products page and completing the application.',
      },
      {
        q: 'Can I watch PEO TV on my mobile device?',
        a: 'Yes, PEO TV Go allows you to stream content on your mobile phone or tablet. Download the PEO TV Go app from your app store.',
      },
    ],
  },
  {
    category: 'Account & Services',
    icon: <FiFileText size={18} />,
    items: [
      {
        q: 'How do I check my application status?',
        a: 'Navigate to "Application Status" from the top menu bar and enter your reference number to track your application in real-time.',
      },
      {
        q: 'Can I transfer my connection to someone else?',
        a: 'Yes, use the Transfer (Change of Ownership) service from Our Services. Both parties will need to provide valid identification documents.',
      },
      {
        q: 'How do I temporarily suspend my service?',
        a: 'Use the Service Vacation option from Our Services. You can suspend your service for up to 6 months with reduced monthly charges.',
      },
    ],
  },
];

/* ── Contact Cards ────────────────────────────────────────────────────────── */
const CONTACT_CHANNELS = [
  {
    title: 'Call Us',
    description: 'Speak with our support team',
    detail: '1212 (Toll-free)',
    detailSecondary: '+94 11 230 0300',
    icon: <FiPhone size={24} />,
    color: '#0056b3',
    bgColor: '#eff6ff',
  },
  {
    title: 'Email Us',
    description: 'Get a response within 24 hours',
    detail: 'support@slt.lk',
    detailSecondary: 'info@slt.lk',
    icon: <FiMail size={24} />,
    color: '#047857',
    bgColor: '#ecfdf5',
  },
  {
    title: 'Live Chat',
    description: 'Chat with our virtual assistant',
    detail: 'Available 24/7',
    detailSecondary: 'via SLTMobitel App',
    icon: <FiMessageCircle size={24} />,
    color: '#7c3aed',
    bgColor: '#f5f3ff',
  },
  {
    title: 'Visit Us',
    description: 'Walk into any SLT branch',
    detail: 'Find nearest branch',
    detailSecondary: 'Mon–Fri: 8:30 AM – 4:30 PM',
    icon: <FiMapPin size={24} />,
    color: '#dc2626',
    bgColor: '#fef2f2',
  },
];

/* ── Accordion Item ───────────────────────────────────────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: `1px solid ${isOpen ? '#bfdbfe' : '#e2e8f0'}`,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '1rem 1.25rem',
          border: 'none',
          background: isOpen ? '#f8fafc' : 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '0.92rem',
          fontWeight: 600,
          color: isOpen ? '#0056b3' : '#1e293b',
          transition: 'all 0.2s',
          gap: '1rem',
        }}
      >
        <span>{question}</span>
        {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 1.25rem 1rem',
                fontSize: '0.87rem',
                color: '#475569',
                lineHeight: 1.7,
              }}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function HelpSupportPage() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState({});
  const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].category);

  const toggleItem = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFaq = FAQ_CATEGORIES.find((c) => c.category === activeCategory);

  return (
    <div style={{ backgroundColor: 'var(--page-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '2rem var(--page-gutter)' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '4px', fontStyle: 'italic', fontSize: '1.8rem', fontWeight: 900 }}>
              <span style={{ color: '#10b981' }}>/</span><span style={{ color: '#0056b3' }}>/</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              Help & Support
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', maxWidth: '600px' }}>
            Find answers to your questions, get in touch with our support team, or browse our knowledge base.
          </p>
        </div>

        {/* ── Contact Cards ────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          {CONTACT_CHANNELS.map((channel) => (
            <div
              key={channel.title}
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${channel.color}, ${channel.color}88)`,
                }}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: channel.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: channel.color,
                  flexShrink: 0,
                }}
              >
                {channel.icon}
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {channel.title}
                </h3>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: '#475569' }}>
                  {channel.description}
                </p>
                <p style={{ margin: '0 0 0.15rem', fontSize: '0.9rem', fontWeight: 600, color: channel.color }}>
                  {channel.detail}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
                  {channel.detailSecondary}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ Section ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
            <FiHelpCircle size={20} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
            Frequently Asked Questions
          </h2>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              marginBottom: '1.25rem',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '9999px',
                  border: activeCategory === cat.category ? '2px solid #0056b3' : '1px solid #e2e8f0',
                  backgroundColor: activeCategory === cat.category ? '#eff6ff' : '#fff',
                  color: activeCategory === cat.category ? '#0056b3' : '#475569',
                  fontWeight: activeCategory === cat.category ? 700 : 500,
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                {cat.icon}
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activeFaq &&
              activeFaq.items.map((item, idx) => {
                const key = `${activeCategory}-${idx}`;
                return (
                  <AccordionItem
                    key={key}
                    question={item.q}
                    answer={item.a}
                    isOpen={!!openItems[key]}
                    onToggle={() => toggleItem(key)}
                  />
                );
              })}
          </div>
        </div>

        {/* ── Quick Links ──────────────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Quick Links
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: '1rem',
              maxWidth: '80%',
              margin: '0 auto',
            }}
          >
            {[
              { label: 'Check Application Status', desc: 'Track your service requests in real-time', path: '/check-status' },
              { label: 'Browse All Services', desc: 'View all available online application forms', path: '/services' },
              { label: 'Browse Products', desc: 'Explore our broadband, voice and PEO TV packages', path: '/new-connection/products' },
            ].map((link) => (
              <div
                key={link.path}
                onClick={() => navigate(link.path)}
                role="button"
                tabIndex={0}
                aria-label={`${link.label}: ${link.desc}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(link.path);
                  }
                }}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {link.label}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>{link.desc}</p>
                </div>
                <FiExternalLink size={18} style={{ color: '#0056b3', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Office Hours Banner ──────────────────────────────────────── */}
        <div
          style={{
            marginTop: '2.5rem',
            background: 'linear-gradient(135deg, #0056b3 0%, #0284c7 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <FiClock size={32} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', fontWeight: 700 }}>
              Customer Support Hours
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
              <strong>Hotline (1212):</strong> 24 hours / 7 days<br />
              <strong>Branch offices:</strong> Mon – Fri, 8:30 AM – 4:30 PM<br />
              <strong>Online support:</strong> Available 24/7 via chat & email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
