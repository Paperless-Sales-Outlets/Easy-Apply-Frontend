import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FiX, FiHeart, FiSearch, FiShoppingCart, FiCheck, FiInfo } from 'react-icons/fi';
import { getProductDetails } from '../services/productService';
import { normalizeProductDetail } from '../utils/productHubAdapter';
import useScrollLock from '../utils/useScrollLock';

// Brand tile colours for known channels; unknown ones fall back to SLT navy.
const CHANNEL_METADATA = {
  '0': { name: 'SLTMobitel Group Watch', genre: 'Special', bg: '#0b2d5b', logoText: 'SLT WATCH' },
  '1': { name: 'Rupavahini', genre: 'National', bg: '#003b73', logoText: 'RUPAVAHINI' },
  '2': { name: 'Nethra TV', genre: 'Tamil', bg: '#4c1d95', logoText: 'NETHRA' },
  '3': { name: 'ITN', genre: 'Entertainment', bg: '#0369a1', logoText: 'ITN' },
  '4': { name: 'TV Derana', genre: 'Entertainment', bg: '#b91c1c', logoText: 'DERANA' },
  '5': { name: 'Charana TV', genre: 'Entertainment', bg: '#0f766e', logoText: 'CHARANA' },
  '6': { name: 'Swarnavahini', genre: 'Entertainment', bg: '#b45309', logoText: 'SWARNA' },
  '7': { name: 'Vasantham TV', genre: 'Tamil', bg: '#c2410c', logoText: 'VASANTHAM' },
  '8': { name: 'Siyatha TV', genre: 'News & Ent.', bg: '#1e3a8a', logoText: 'SIYATHA' },
  '9': { name: 'Haritha TV', genre: 'Nature & Edu.', bg: '#15803d', logoText: 'HARITHA' },
  '10': { name: 'Sirasa TV', genre: 'Entertainment', bg: '#991b1b', logoText: 'SIRASA' },
  '11': { name: 'Shakthi TV', genre: 'Tamil', bg: '#9a3412', logoText: 'SHAKTHI' },
  '12': { name: 'TV 1', genre: 'Youth & Music', bg: '#0f172a', logoText: 'TV 1' },
  '13': { name: 'Supreme TV', genre: 'Entertainment', bg: '#831843', logoText: 'SUPREME' },
  '14': { name: 'A Derana News Channel', genre: 'News', bg: '#991b1b', logoText: 'ADA DERANA' },
  '15': { name: 'Music Plus TV', genre: 'Music', bg: '#701a75', logoText: 'MUSIC+' },
  '17': { name: 'Art TV', genre: 'Movies & Art', bg: '#312e81', logoText: 'ART TV' },
  '23': { name: 'CNN', genre: 'News', bg: '#cc0000', logoText: 'CNN' },
  '24': { name: 'BBC', genre: 'News', bg: '#000000', logoText: 'BBC' },
  '28': { name: 'Star Movies', genre: 'Movies', bg: '#1e1b4b', logoText: 'STAR MOVIES' },
};

const GENRES = ['All', 'Entertainment', 'News', 'Tamil', 'Add-on'];
const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

/**
 * Package details dialog. The listing shows only name, price and actions; the
 * rest (cost breakdown, terms, channel lineup) lives here. Page scroll is
 * locked while it is open, Escape/backdrop close it, and focus is kept inside.
 */
export default function PackageDetailModal({
  isOpen,
  onClose,
  product,
  onSelectPackage,
  isInCart = false,
  isFavorite = false,
  onToggleFavorite,
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview'); // 'overview' | 'channels'
  const [activeGenre, setActiveGenre] = useState('All');
  const [channelSearch, setChannelSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsData, setDetailsData] = useState(null);
  const [notice, setNotice] = useState(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useScrollLock(isOpen);

  const productId = product?._id || product?.productId || product?.id;

  useEffect(() => {
    if (!isOpen || !productId) return undefined;
    let mounted = true;
    setLoading(true);
    setNotice(null);
    setTab('overview');
    setActiveGenre('All');
    setChannelSearch('');

    const fallback = {
      id: productId,
      productName: product?.name || product?.productName || 'SLT Package',
      category: product?.category || '',
      monthlyPrice: product?.monthlyPrice || product?.price || 0,
      description: product?.description || '',
      image: product?.bannerUrl || product?.image || '',
      fixedFields: [],
      features: {},
      tables: [],
    };

    getProductDetails(productId)
      .then((res) => {
        if (!mounted) return;
        setLoading(false);
        if (res && res.success && res.product) {
          setDetailsData(normalizeProductDetail(res));
        } else {
          // No invented terms: show only what we actually know about the package.
          setNotice(t('details.unavailable', 'Full specifications are not available right now.'));
          setDetailsData(fallback);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        setNotice(t('details.unavailable', 'Full specifications are not available right now.'));
        setDetailsData(fallback);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId]);

  // Escape closes; Tab stays inside the dialog; focus returns to the opener.
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener && opener.focus) opener.focus();
    };
  }, [isOpen, onClose]);

  const mainTable = (detailsData?.tables || [])[0];
  const channels = useMemo(() => {
    const rows = mainTable?.rows || [];
    return rows.map((row) => {
      const id = String(row[0]);
      const rawName = row[1];
      const price = row[2];
      const meta = CHANNEL_METADATA[id] || {
        name: rawName,
        genre: 'Entertainment',
        bg: '#173c71',
        logoText: String(rawName || '').toUpperCase().slice(0, 10),
      };
      const isAddOn = !String(price).toLowerCase().includes('n/a') && String(price) !== '0';
      return { id, name: meta.name || rawName, genre: isAddOn ? 'Add-on' : meta.genre, bg: meta.bg, logoText: meta.logoText, price, isAddOn };
    });
  }, [mainTable]);

  const visibleChannels = channels.filter((ch) => {
    if (activeGenre === 'Add-on' && !ch.isAddOn) return false;
    if (activeGenre === 'News' && !ch.genre.toLowerCase().includes('news')) return false;
    if (activeGenre === 'Tamil' && !ch.genre.toLowerCase().includes('tamil')) return false;
    if (activeGenre === 'Entertainment' && !/entertainment|national/i.test(ch.genre)) return false;
    const q = channelSearch.trim().toLowerCase();
    return !q || ch.name.toLowerCase().includes(q) || ch.genre.toLowerCase().includes(q);
  });

  if (!isOpen) return null;

  const name = detailsData?.productName || product?.name || product?.productName || 'SLT Package';
  const category = detailsData?.category || product?.category || '';
  const price = detailsData?.monthlyPrice || product?.monthlyPrice || product?.price || 0;
  const installation = product?.installationFee !== undefined ? Number(product.installationFee) : null;
  const image = product?.bannerUrl || detailsData?.image || detailsData?.bannerUrl || '';
  const hasChannels = channels.length > 0;

  const facts = [
    { label: t('details.monthly', 'Monthly charge'), value: money(price) },
    installation !== null && {
      label: t('details.installation', 'Installation (one time)'),
      value: installation > 0 ? money(installation) : t('details.free', 'Free'),
    },
    ...(detailsData?.fixedFields || []).map((f) => ({
      label: f.name,
      // bare numbers on money-like rows ("2500") read as prices
      value:
        /fee|charge|rental|price|deposit/i.test(f.name) && /^\d+(\.\d+)?$/.test(String(f.value).trim())
          ? money(f.value)
          : f.value,
    })),
    ...Object.entries(detailsData?.features || {}).map(([k, v]) => ({ label: k, value: String(v) })),
  ].filter(Boolean);

  return createPortal(
    <div
      className="dlg-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
        <header className="dlg__head">
          {image && (
            <div className="dlg__media" aria-hidden="true">
              <img src={image} alt="" />
            </div>
          )}
          <div className="dlg__headcopy">
            {category && <span className="dlg__cat">{category}</span>}
            <h2 id="dlg-title">{name}</h2>
            {detailsData?.description && <p>{detailsData.description}</p>}
            <p className="dlg__price">
              <strong>{money(price)}</strong> <span>{t('details.perMonth', '/ month')}</span>
            </p>
          </div>

          <div className="dlg__tools">
            {onToggleFavorite && (
              <button
                type="button"
                className="dlg__icon"
                aria-pressed={isFavorite}
                aria-label={isFavorite ? t('details.unsave', 'Remove from favourites') : t('details.save', 'Save to favourites')}
                onClick={() => onToggleFavorite(String(productId))}
              >
                <FiHeart size={20} aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            <button ref={closeRef} type="button" className="dlg__icon" onClick={onClose} aria-label={t('common.close', 'Close')}>
              <FiX size={22} aria-hidden="true" />
            </button>
          </div>
        </header>

        {hasChannels && (
          <div className="dlg__tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'overview'} onClick={() => setTab('overview')}>
              {t('details.overview', 'Overview')}
            </button>
            <button type="button" role="tab" aria-selected={tab === 'channels'} onClick={() => setTab('channels')}>
              {t('details.channels', 'Channels')} ({channels.length})
            </button>
          </div>
        )}

        <div className="dlg__body">
          {loading ? (
            <p className="dlg__loading" role="status">{t('common.loading', 'Loading...')}</p>
          ) : (
            <>
              {notice && (
                <p className="dlg__notice">
                  <FiInfo size={18} aria-hidden="true" />
                  <span>{notice}</span>
                </p>
              )}

              {tab === 'overview' && (
                <dl className="dlg__facts">
                  {facts.map((f, i) => (
                    <div key={`${f.label}-${i}`}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {tab === 'channels' && (
                <div className="dlg__channels">
                  <div className="dlg__filters">
                    <label className="dlg__search">
                      <FiSearch size={18} aria-hidden="true" />
                      <input
                        type="search"
                        value={channelSearch}
                        onChange={(e) => setChannelSearch(e.target.value)}
                        placeholder={t('details.searchChannels', 'Search channels')}
                        aria-label={t('details.searchChannels', 'Search channels')}
                      />
                    </label>
                    <div className="chip-row" role="group" aria-label={t('details.genre', 'Genre')}>
                      {GENRES.map((g) => (
                        <button key={g} type="button" className="chip" aria-pressed={activeGenre === g} onClick={() => setActiveGenre(g)}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {visibleChannels.length === 0 ? (
                    <p className="dlg__loading">{t('details.noChannels', 'No channels match your search.')}</p>
                  ) : (
                    <ul className="chan-grid">
                      {visibleChannels.map((ch) => (
                        <li key={ch.id}>
                          <span className="chan__logo" style={{ background: ch.bg }}>{ch.logoText}</span>
                          <span className="chan__text">
                            <strong>{ch.name}</strong>
                            <small>{ch.isAddOn ? `${ch.genre} · ${ch.price}` : ch.genre}</small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <footer className="dlg__foot">
          <button type="button" className="btn-ds btn-ds--text" onClick={onClose}>
            {t('common.close', 'Close')}
          </button>
          {onSelectPackage && (
            <button
              type="button"
              className="btn-ds btn-ds--buy"
              onClick={() => {
                onSelectPackage(detailsData || product);
                onClose();
              }}
            >
              {isInCart ? <FiCheck size={18} aria-hidden="true" /> : <FiShoppingCart size={18} aria-hidden="true" />}
              <span>{isInCart ? t('catalog.card.inCart', 'In Cart') : t('catalog.card.addToCart', 'Add to Cart')}</span>
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
