import React from 'react';

export default function SDMobileBar({ heroVisible, pricingVisible }) {
  const show = !heroVisible && !pricingVisible;

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        height: 64,
        backgroundColor: '#1A1A1A',
        borderTop: '1px solid rgba(212,160,23,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
      }}
      className="sd-mobile-bar"
    >
      <span style={{ color: '#B8B8B8', fontSize: 14, fontWeight: 500 }}>From $49/yr</span>
      <a
        href="#pricing"
        onClick={e => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
        style={{
          backgroundColor: '#D4A017', color: '#0F0F0F',
          fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10,
          textDecoration: 'none',
        }}
      >
        Get a sticker
      </a>
      <style>{`
        @media (min-width: 769px) { .sd-mobile-bar { display: none !important; } }
      `}</style>
    </div>
  );
}