import React, { useState, useEffect } from 'react';
import {
  X,
  Tv,
  ShieldCheck,
  FileText,
  Search,
  Info,
  ArrowRight,
} from 'lucide-react';
import { getProductDetails } from '../services/productService';
import { normalizeProductDetail } from '../../shared/utils/productHubAdapter';

// Authentic Channel metadata with genre and brand styling
const CHANNEL_METADATA = {
  '0': { name: 'SLTMobitel Group Watch', genre: 'Special', res: 'HD', bg: '#0d2b52', logoText: 'SLT WATCH', tagColor: '#4b92d6' },
  '1': { name: 'Rupavahini', genre: 'National', res: 'HD', bg: '#123c73', logoText: 'RUPAVAHINI', tagColor: '#4b92d6' },
  '2': { name: 'Nethra TV', genre: 'Tamil', res: 'HD', bg: '#4c1d95', logoText: 'NETHRA', tagColor: '#c084fc' },
  '3': { name: 'ITN', genre: 'Entertainment', res: 'HD', bg: '#0a4b8c', logoText: 'ITN', tagColor: '#4b92d6' },
  '4': { name: 'TV Derana', genre: 'Entertainment', res: 'HD', bg: '#b42318', logoText: 'DERANA', tagColor: '#f87171' },
  '5': { name: 'Charana TV', genre: 'Entertainment', res: 'HD', bg: '#0f766e', logoText: 'CHARANA', tagColor: '#2dd4bf' },
  '6': { name: 'Swarnavahini', genre: 'Entertainment', res: 'HD', bg: '#93560a', logoText: 'SWARNA', tagColor: '#f4d58f' },
  '7': { name: 'Vasanthm TV', genre: 'Tamil', res: 'HD', bg: '#c2410c', logoText: 'VASANTHAM', tagColor: '#fb923c' },
  '8': { name: 'Siyatha TV', genre: 'News & Ent.', res: 'HD', bg: '#1e3a8a', logoText: 'SIYATHA', tagColor: '#8ebde8' },
  '9': { name: 'Haritha TV', genre: 'Nature & Edu.', res: 'HD', bg: '#0f7a4d', logoText: 'HARITHA', tagColor: '#4ade80' },
  '10': { name: 'Sirasa TV', genre: 'Entertainment', res: 'HD', bg: '#b42318', logoText: 'SIRASA', tagColor: '#f5c2bd' },
  '11': { name: 'Shakthi TV', genre: 'Tamil', res: 'HD', bg: '#93560a', logoText: 'SHAKTHI', tagColor: '#fdba74' },
  '12': { name: 'TV 1', genre: 'Youth & Music', res: 'HD', bg: '#131f33', logoText: 'TV 1', tagColor: '#94a1b5' },
  '13': { name: 'Supreme TV', genre: 'Entertainment', res: 'HD', bg: '#831843', logoText: 'SUPREME', tagColor: '#f472b6' },
  '14': { name: 'A Derana News Channel', genre: 'News', res: 'HD', bg: '#b42318', logoText: 'ADA DERANA', tagColor: '#f87171' },
  '15': { name: 'Music Plus TV', genre: 'Music', res: 'HD', bg: '#701a75', logoText: 'MUSIC+', tagColor: '#e879f9' },
  '17': { name: 'Art TV', genre: 'Movies & Art', res: 'HD', bg: '#312e81', logoText: 'ART TV', tagColor: '#a5b4fc' },
  '23': { name: 'CNN', genre: 'News', res: 'HD', bg: '#cc0000', logoText: 'CNN', tagColor: '#f5c2bd' },
  '24': { name: 'BBC', genre: 'News', res: 'HD', bg: '#000000', logoText: 'BBC', tagColor: '#dfe5ee' },
  '28': { name: 'Star Movies', genre: 'Movies', res: 'HD', bg: '#1e1b4b', logoText: 'STAR MOVIES', tagColor: '#f4d58f' },
};

/** Modal with full package details (specs, channels, pricing). */
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
      bg: 'var(--blue-800)',
      logoText: channelName.toUpperCase().slice(0, 10),
      tagColor: 'var(--blue-400)',
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
          backgroundColor: 'var(--paper)',
          borderRadius: 'var(--radius-sm)', // 6px clean modern radius
          border: '1px solid #002b5c',
          boxShadow: 'var(--shadow-xl)',
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
            color: 'var(--paper)',
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
                  backgroundColor: 'var(--blue-600)',
                  color: 'var(--paper)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {detailsData?.category || product?.category || 'PEO TV'}
              </span>
              <span
                style={{
                  color: 'var(--grey-400)',
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
                borderRadius: 'var(--radius-sm)',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--paper)',
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
              {(
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    backgroundColor: 'var(--paper)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-md)',
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  {detailsData?.productName || product?.name || 'Peo Silver'}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#c3ccd9', fontWeight: 500, marginTop: '0.2rem' }}>
                  Complete Home Entertainment with {totalChannelsCount} TV Channels
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                Rs. {(detailsData?.monthlyPrice || product?.monthlyPrice || 1125).toLocaleString()}
                <span style={{ fontSize: '0.85rem', color: '#c3ccd9', fontWeight: 600 }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a1b5', marginTop: '0.3rem', fontWeight: 500 }}>
                + One-time setup: Rs. {product?.installationFee === 0 ? '0 (Free)' : '2,500'}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Tab Navigation ── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--grey-200)',
            backgroundColor: 'var(--grey-50)',
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
              borderBottom: activeTab === 'lineup' ? '2.5px solid #0056a2' : '2.5px solid transparent',
              marginBottom: '-1px',
              color: activeTab === 'lineup' ? '#0056a2' : '#52627a',
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
              borderBottom: activeTab === 'specs' ? '2.5px solid #0056a2' : '2.5px solid transparent',
              marginBottom: '-1px',
              color: activeTab === 'specs' ? '#0056a2' : '#52627a',
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
                  border: '2.5px solid var(--grey-200)',
                  borderTop: '2.5px solid var(--blue-600)',
                  borderRadius: '50%',
                  margin: '0 auto 1rem auto',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: '0.85rem', color: '#52627a', fontWeight: 600 }}>Loading official channel lineup from SLT Hub...</p>
            </div>
          ) : (
            <>
              {notice && (
                <div
                  style={{
                    backgroundColor: 'var(--blue-50)',
                    border: '1px solid var(--blue-200)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <Info size={15} style={{ color: '#0a4b8c', flexShrink: 0 }} />
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
                      <Search size={14} style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a1b5' }} />
                      <input
                        type="text"
                        placeholder="Search channels by name or genre..."
                        value={channelSearch}
                        onChange={(e) => setChannelSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.75rem 0.45rem 2rem',
                          backgroundColor: 'var(--grey-50)',
                          border: '1px solid var(--grey-300)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--grey-900)',
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
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: activeGenre === genre ? '#0056a2' : '#dfe5ee',
                            backgroundColor: activeGenre === genre ? '#0056a2' : '#ffffff',
                            color: activeGenre === genre ? '#ffffff' : '#3b4a61',
                            fontSize: '0.75rem',
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
                  <div style={{ fontSize: '0.76rem', color: '#52627a', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Showing {filteredChannels.length} channels • Full Lineup Included
                  </div>

                  {/* Channel Cards Grid with Real Brand Logos */}
                  {filteredChannels.length === 0 ? (
                    <div style={{ backgroundColor: '#f6f8fb', borderRadius: 'var(--radius-sm)', padding: '2rem', textAlign: 'center', border: '1px solid #dfe5ee' }}>
                      <p style={{ color: '#52627a', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>No channels found matching "{channelSearch}".</p>
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
                            backgroundColor: 'var(--paper)',
                            border: '1px solid var(--grey-200)',
                            borderRadius: 'var(--radius-sm)',
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
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--paper)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              letterSpacing: '0.04em',
                              textAlign: 'center',
                              padding: '2px',
                              flexShrink: 0,
                              boxShadow: 'var(--shadow-xs)',
                            }}
                          >
                            {ch.logoText}
                          </div>

                          {/* Channel Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: 'var(--grey-900)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={ch.name}
                            >
                              {ch.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#52627a', fontWeight: 600 }}>
                                {ch.genre}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: ch.isAddOn ? '#93560a' : '#0f7a4d',
                                  backgroundColor: ch.isAddOn ? '#fdf0d5' : '#e2f4e3',
                                  padding: '0.05rem 0.35rem',
                                  borderRadius: 'var(--radius-sm)',
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
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#002b5c', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                            backgroundColor: 'var(--grey-50)',
                            border: '1px solid var(--grey-200)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.75rem 0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: '#52627a', textTransform: 'uppercase', fontWeight: 700 }}>
                            {ff.name}
                          </span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#131f33' }}>
                            {ff.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included SLT Services */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#002b5c', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Included SLTMobitel Benefits
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: '#26344b', fontWeight: 600 }}>
                        <ShieldCheck size={16} style={{ color: '#0056a2', flexShrink: 0 }} />
                        <span>Official SLTMobitel digital provisioning and zero paperwork onboarding.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: '#26344b', fontWeight: 600 }}>
                        <ShieldCheck size={16} style={{ color: '#0056a2', flexShrink: 0 }} />
                        <span>Dedicated SLT optical line connection with standard setup included.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: '#26344b', fontWeight: 600 }}>
                        <ShieldCheck size={16} style={{ color: '#0056a2', flexShrink: 0 }} />
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
            borderTop: '1px solid var(--grey-200)',
            backgroundColor: 'var(--paper)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--grey-300)',
              backgroundColor: 'var(--paper)',
              color: 'var(--grey-700)',
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
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--blue-600)',
                color: 'var(--paper)',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)',
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



