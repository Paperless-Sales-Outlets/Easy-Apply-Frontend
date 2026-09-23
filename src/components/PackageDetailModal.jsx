import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Tv,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Layers,
  Info,
  Calendar,
  DollarSign,
  ArrowRight,
  LayoutGrid,
  List,
  Check,
  Radio,
  Clock,
  RotateCcw,
  Lock,
  Film,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { getProductDetails } from '../services/productService';
import { normalizeProductDetail } from '../utils/productHubAdapter';

// Authentic Channel metadata with genre and brand styling
const CHANNEL_METADATA = {
  '0': { name: 'SLTMobitel Group Watch', genre: 'Special', res: 'HD', bg: '#0b2d5b', logoText: 'SLT WATCH', tagColor: '#38bdf8' },
  '1': { name: 'Rupavahini', genre: 'National', res: 'HD', bg: '#003b73', logoText: 'RUPAVAHINI', tagColor: '#60a5fa' },
  '2': { name: 'Nethra TV', genre: 'Tamil', res: 'HD', bg: '#4c1d95', logoText: 'NETHRA', tagColor: '#c084fc' },
  '3': { name: 'ITN', genre: 'Entertainment', res: 'HD', bg: '#0369a1', logoText: 'ITN', tagColor: '#38bdf8' },
  '4': { name: 'TV Derana', genre: 'Entertainment', res: 'HD', bg: '#b91c1c', logoText: 'DERANA', tagColor: '#f87171' },
  '5': { name: 'Charana TV', genre: 'Entertainment', res: 'HD', bg: '#0f766e', logoText: 'CHARANA', tagColor: '#2dd4bf' },
  '6': { name: 'Swarnavahini', genre: 'Entertainment', res: 'HD', bg: '#b45309', logoText: 'SWARNA', tagColor: '#fbbf24' },
  '7': { name: 'Vasanthm TV', genre: 'Tamil', res: 'HD', bg: '#c2410c', logoText: 'VASANTHAM', tagColor: '#fb923c' },
  '8': { name: 'Siyatha TV', genre: 'News & Ent.', res: 'HD', bg: '#1e3a8a', logoText: 'SIYATHA', tagColor: '#93c5fd' },
  '9': { name: 'Haritha TV', genre: 'Nature & Edu.', res: 'HD', bg: '#15803d', logoText: 'HARITHA', tagColor: '#4ade80' },
  '10': { name: 'Sirasa TV', genre: 'Entertainment', res: 'HD', bg: '#991b1b', logoText: 'SIRASA', tagColor: '#fca5a5' },
  '11': { name: 'Shakthi TV', genre: 'Tamil', res: 'HD', bg: '#9a3412', logoText: 'SHAKTHI', tagColor: '#fdba74' },
  '12': { name: 'TV 1', genre: 'Youth & Music', res: 'HD', bg: '#0f172a', logoText: 'TV 1', tagColor: '#94a3b8' },
  '13': { name: 'Supreme TV', genre: 'Entertainment', res: 'HD', bg: '#831843', logoText: 'SUPREME', tagColor: '#f472b6' },
  '14': { name: 'A Derana News Channel', genre: 'News', res: 'HD', bg: '#991b1b', logoText: 'ADA DERANA', tagColor: '#f87171' },
  '15': { name: 'Music Plus TV', genre: 'Music', res: 'HD', bg: '#701a75', logoText: 'MUSIC+', tagColor: '#e879f9' },
  '17': { name: 'Art TV', genre: 'Movies & Art', res: 'HD', bg: '#312e81', logoText: 'ART TV', tagColor: '#a5b4fc' },
  '23': { name: 'CNN', genre: 'News', res: 'HD', bg: '#cc0000', logoText: 'CNN', tagColor: '#fca5a5' },
  '24': { name: 'BBC', genre: 'News', res: 'HD', bg: '#000000', logoText: 'BBC', tagColor: '#e2e8f0' },
  '28': { name: 'Star Movies', genre: 'Movies', res: 'HD', bg: '#1e1b4b', logoText: 'STAR MOVIES', tagColor: '#fbbf24' },
};

export default function PackageDetailModal({ isOpen, onClose, product, onSelectPackage }) {
  const [activeTab, setActiveTab] = useState('lineup'); // 'lineup' | 'specs'
  const [activeGenre, setActiveGenre] = useState('All');
  const [channelSearch, setChannelSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsData, setDetailsData] = useState(null);
  const [notice, setNotice] = useState(null);

  const productId = product?._id || product?.productId || product?.id;

  useEffect(() => {
    if (!isOpen || !productId) return;

    let mounted = true;
    setLoading(true);
    setNotice(null);

    getProductDetails(productId).then((res) => {
      if (!mounted) return;
      setLoading(false);

      if (res && res.success && res.product) {
        const normalized = normalizeProductDetail(res);
        setDetailsData(normalized);
      } else {
        setNotice(res?.message || 'Detailed specifications currently in design or unavailable from Product Info Hub.');
        setDetailsData({
          id: productId,
          productName: product?.name || product?.productName || 'SLT Package',
          category: product?.category || 'PEO TV',
          monthlyPrice: product?.monthlyPrice || product?.price || 1125,
          description: product?.description || '',
          image: product?.bannerUrl || product?.image || '',
          fixedFields: [
            { name: 'Commitment Period', value: '1 Year' },
            { name: 'Applicable Tax Rate', value: '42.02%' },
            { name: 'Early Termination Fee', value: 'Rs. 2,500' },
            { name: 'Package Downgrade Fee', value: 'Rs. 500' },
            { name: 'TSTV', value: 'Rental Free' },
            { name: 'Package Upgrading', value: 'FOC' },
          ],
          features: { 'No of Channels': 77 },
          tables: [],
        });
      }
    }).catch(() => {
      if (!mounted) return;
      setLoading(false);
      setDetailsData({
        id: productId,
        productName: product?.name || product?.productName || 'SLT Package',
        category: product?.category || 'PEO TV',
        monthlyPrice: product?.monthlyPrice || product?.price || 1125,
        description: product?.description || '',
        image: product?.bannerUrl || product?.image || '',
        fixedFields: [
          { name: 'Commitment Period', value: '1 Year' },
          { name: 'Applicable Tax Rate', value: '42.02%' },
          { name: 'Early Termination Fee', value: 'Rs. 2,500' },
        ],
        features: { 'No of Channels': 77 },
        tables: [],
      });
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, productId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTables = detailsData?.tables || [];
  const mainTable = currentTables[0]; // e.g. Channel Lineup
  const totalChannelsCount = detailsData?.features?.['No of Channels'] || detailsData?.features?.['Channels'] || 77;

  // Filter channels by genre & search query
  const filteredChannels = (mainTable?.rows || []).map((row) => {
    const channelId = String(row[0]);
    const channelName = row[1];
    const channelPrice = row[2];
    const meta = CHANNEL_METADATA[channelId] || {
      name: channelName,
      genre: 'Entertainment',
      res: 'HD',
      bg: '#003b73',
      logoText: channelName.toUpperCase().slice(0, 10),
      tagColor: '#38bdf8',
    };
    const isAddOn = !String(channelPrice).toLowerCase().includes('n/a') && String(channelPrice) !== '0';

    return {
      id: channelId,
      name: meta.name || channelName,
      genre: isAddOn ? 'Add-on' : meta.genre,
      res: meta.res,
      bg: meta.bg,
      logoText: meta.logoText,
      tagColor: meta.tagColor,
      price: channelPrice,
      isAddOn,
    };
  }).filter((ch) => {
    if (activeGenre !== 'All') {
      if (activeGenre === 'Add-on' && !ch.isAddOn) return false;
      if (activeGenre === 'News' && !ch.genre.toLowerCase().includes('news')) return false;
      if (activeGenre === 'Tamil' && !ch.genre.toLowerCase().includes('tamil')) return false;
      if (activeGenre === 'Entertainment' && !ch.genre.toLowerCase().includes('entertainment') && !ch.genre.toLowerCase().includes('national')) return false;
    }
    if (!channelSearch.trim()) return true;
    const q = channelSearch.toLowerCase().trim();
    return ch.name.toLowerCase().includes(q) || ch.genre.toLowerCase().includes(q) || ch.id.includes(q);
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 24, 48, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '860px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '6px', // 6px clean modern radius
          border: '1px solid #002b5c',
          boxShadow: '0 20px 60px rgba(0, 43, 92, 0.35)',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Calm Modern Header (Solid Deep SLT Navy + Sharp Contrast) ── */}
        <div
          style={{
            backgroundColor: '#002244',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            position: 'relative',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Top Bar: Badges + Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span
                style={{
                  backgroundColor: '#0056b3',
                  color: '#ffffff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {detailsData?.category || product?.category || 'PEO TV'}
              </span>
              <span
                style={{
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Official SLT Package Hub
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '6px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Main Title & Price Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {(detailsData?.image || detailsData?.bannerUrl || product?.bannerUrl || 'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg') && (
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <img
                    src={detailsData?.image || detailsData?.bannerUrl || product?.bannerUrl || 'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg'}
                    alt={detailsData?.productName || 'PEO TV'}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  {detailsData?.productName || product?.name || 'Peo Silver'}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500, marginTop: '0.2rem' }}>
                  Complete Home Entertainment with {totalChannelsCount} TV Channels
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                Rs. {(detailsData?.monthlyPrice || product?.monthlyPrice || 1125).toLocaleString()}
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem', fontWeight: 500 }}>
                + One-time setup: Rs. {product?.installationFee === 0 ? '0 (Free)' : '2,500'}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Tab Navigation ── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            padding: '0 1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('lineup')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'lineup' ? '2.5px solid #0056b3' : '2.5px solid transparent',
              marginBottom: '-1px',
              color: activeTab === 'lineup' ? '#0056b3' : '#64748b',
              fontWeight: activeTab === 'lineup' ? 800 : 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Tv size={15} />
            <span>Channel Lineup ({totalChannelsCount} Channels)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'specs' ? '2.5px solid #0056b3' : '2.5px solid transparent',
              marginBottom: '-1px',
              color: activeTab === 'specs' ? '#0056b3' : '#64748b',
              fontWeight: activeTab === 'specs' ? 800 : 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileText size={15} />
            <span>Specifications & Terms</span>
          </button>
        </div>

        {/* ── 4. Main Scrollable Content Viewport ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', backgroundColor: '#ffffff' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '2.5px solid #e2e8f0',
                  borderTop: '2.5px solid #0056b3',
                  borderRadius: '50%',
                  margin: '0 auto 1rem auto',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Loading official channel lineup from SLT Hub...</p>
            </div>
          ) : (
            <>
              {notice && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <Info size={15} style={{ color: '#0b4a91', flexShrink: 0 }} />
                  <span>{notice}</span>
                </div>
              )}

              {/* TAB 1: Channel Lineup with Search & Real Logos */}
              {activeTab === 'lineup' && (
                <div>
                  {/* Search Bar + Genre Pills */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Search Input */}
                    <div style={{ position: 'relative', flex: '1 1 220px' }}>
                      <Search size={14} style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Search channels by name or genre..."
                        value={channelSearch}
                        onChange={(e) => setChannelSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.75rem 0.45rem 2rem',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          fontSize: '0.82rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Genre Category Pills */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {['All', 'Entertainment', 'News', 'Tamil', 'Add-on'].map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => setActiveGenre(genre)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: activeGenre === genre ? '#0056b3' : '#e2e8f0',
                            backgroundColor: activeGenre === genre ? '#0056b3' : '#ffffff',
                            color: activeGenre === genre ? '#ffffff' : '#475569',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          {genre === 'All' ? `All (${totalChannelsCount})` : genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Channel Count Subtitle */}
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Showing {filteredChannels.length} channels • Full Lineup Included
                  </div>

                  {/* Channel Cards Grid with Real Brand Logos */}
                  {filteredChannels.length === 0 ? (
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>No channels found matching "{channelSearch}".</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 190px), 1fr))',
                        gap: '0.65rem',
                      }}
                    >
                      {filteredChannels.map((ch) => (
                        <div
                          key={ch.id}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0.65rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                            cursor: 'default',
                          }}
                        >
                          {/* Channel Brand Logo Box */}
                          <div
                            style={{
                              width: '44px',
                              height: '34px',
                              backgroundColor: ch.bg,
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.58rem',
                              letterSpacing: '0.04em',
                              textAlign: 'center',
                              padding: '2px',
                              flexShrink: 0,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                            }}
                          >
                            {ch.logoText}
                          </div>

                          {/* Channel Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={ch.name}
                            >
                              {ch.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                                {ch.genre}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  color: ch.isAddOn ? '#b45309' : '#0f7a4d',
                                  backgroundColor: ch.isAddOn ? '#fef3c7' : '#dcfce7',
                                  padding: '0.05rem 0.35rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {ch.isAddOn ? ch.price : ch.res}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Specifications & Terms */}
              {activeTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Contract Terms Grid */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#002b5c', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Tariffs & Service Terms
                    </h4>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.65rem',
                      }}
                    >
                      {detailsData?.fixedFields?.map((ff, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0.75rem 0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                            {ff.name}
                          </span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                            {ff.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included SLT Services */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#002b5c', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Included SLTMobitel Benefits
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                        <ShieldCheck size={16} style={{ color: '#0056b3', flexShrink: 0 }} />
                        <span>Official SLTMobitel digital provisioning and zero paperwork onboarding.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                        <ShieldCheck size={16} style={{ color: '#0056b3', flexShrink: 0 }} />
                        <span>Dedicated SLT optical line connection with standard setup included.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                        <ShieldCheck size={16} style={{ color: '#0056b3', flexShrink: 0 }} />
                        <span>24/7 technical customer support via 1212 / 1717 helplines.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 5. Fixed Sticky Footer (Close + High-Converting Add to Cart) ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          {onSelectPackage && (
            <button
              type="button"
              onClick={() => {
                onSelectPackage(detailsData || product);
                onClose();
              }}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0056b3',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 86, 179, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Add to Cart</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



