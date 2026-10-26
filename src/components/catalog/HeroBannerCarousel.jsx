import React, { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import api from '../../utils/api';

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

// Home-page slider ads mirrored from sltmobitel.lk (proxied by the backend).
export default function HeroBannerCarousel() {
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api.get('/slt-banners').then((r) => setSlides(r.data?.data || [])).catch(() => {});
  }, []);

  const next = () => setActive((p) => (p + 1) % slides.length);
  const slide = slides[active];

  // Images auto-advance on a timer; videos advance when they finish playing.
  useEffect(() => {
    if (!slide || slide.type === 'video') return undefined;
    const timer = setTimeout(next, 5000);
    return () => clearTimeout(timer);
  }, [active, slides]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!slide) return null;
  const src = isMobile() ? slide.mobileSrc : slide.src;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        marginBottom: '2rem',
        height: 'clamp(220px, 32vw, 420px)',
        background: '#001f3f',
        boxShadow: '0 12px 35px rgba(0, 31, 63, 0.35)',
      }}
    >
      {slide.type === 'video' ? (
        <video
          key={src}
          src={src}
          autoPlay
          muted
          playsInline
          onEnded={next}
          onError={next}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <img key={src} src={src} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(48%, 560px)',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '0.75rem',
          background: 'linear-gradient(to left, rgba(0, 20, 40, 0.6), transparent)',
          color: '#ffffff',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2.6vw, 2.2rem)', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-head)' }}>
          {slide.title}
        </h2>
        {slide.description && (
          <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 1.3vw, 1.05rem)', fontWeight: 600, color: '#ffffff' }}>
            {slide.description}
          </p>
        )}
        {slide.link && (
          <a
            href={slide.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#047857',
              color: '#ffffff',
              padding: '0.6rem 1.6rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)',
            }}
          >
            {slide.buttonText} <FiArrowRight size={16} />
          </a>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '0.85rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.45rem',
        }}
      >
        {slides.map((s, idx) => (
          <span
            key={idx}
            onClick={() => setActive(idx)}
            style={{
              width: idx === active ? '18px' : '7px',
              height: '7px',
              borderRadius: '9999px',
              backgroundColor: idx === active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
