import React from 'react';

export default function GSFoundersOffer() {
  const scrollToPricing = (e) => {
    e.preventDefault();
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{ backgroundColor: '#0F0F0F', padding: '0 24px 48px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#1A1A1A',
          borderRadius: 16,
          padding: '40px 40px',
          border: '2px solid #D4A017',
          boxShadow: '0 0 32px rgba(212,160,23,0.12), 0 8px 24px rgba(0,0,0,0.35)',
        }}>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, lineHeight: 1.2, color: '#D4A017', margin: '0 0 16px' }}>
            Founding member pricing
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.7, margin: '0 0 28px' }}>
            The first 100 families get a founders discount and direct email access to the founder. When the 100 spots are gone, this offer is gone.
          </p>
          <a
            href="#pricing"
            onClick={scrollToPricing}
            style={{
              display: 'inline-block', backgroundColor: '#D4A017', color: '#0F0F0F',
              fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10,
              textDecoration: 'none', boxShadow: '0 8px 20px rgba(212,160,23,0.25)',
            }}
          >
            Claim a founders spot
          </a>
        </div>
      </div>
    </section>
  );
}