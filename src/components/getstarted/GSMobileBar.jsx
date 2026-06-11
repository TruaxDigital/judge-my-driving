import React from 'react';

export default function GSMobileBar({ heroVisible, pricingVisible }) {
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
      className="gs-mobile-bar"
    >
      <a
        href="#pricing"
        onClick={e => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
        style={{
          display: 'block', width: '100%', backgroundColor: '#D4A017', color: '#0F0F0F',
          fontWeight: 700, fontSize: 15, padding: '12px 20px', borderRadius: 10,
          textDecoration: 'none', textAlign: 'center',
        }}
      >
        Get My Sticker • from $49/yr
      </a>
      <style>{`
        @media (min-width: 769px) { .gs-mobile-bar { display: none !important; } }
      `}</style>
    </div>
  );
}