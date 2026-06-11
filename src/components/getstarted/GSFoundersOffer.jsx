import React, { useState } from 'react';

export default function GSFoundersOffer() {
  const [showToast, setShowToast] = useState(false);

  const scrollToPricing = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    setTimeout(() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <section style={{ backgroundColor: '#0F0F0F', padding: '0 24px 48px' }}>
      {/* Toast popup */}
      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: `translateX(-50%) translateY(${showToast ? '0' : '20px'})`,
        opacity: showToast ? 1 : 0, transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: 9999, pointerEvents: 'none',
        backgroundColor: '#1A1A1A', border: '2px solid #D4A017',
        borderRadius: 12, padding: '14px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: 20 }}>🎉</span>
        <span style={{ color: '#B8B8B8', fontSize: 15 }}>Use code</span>
        <span style={{
          color: '#0F0F0F', backgroundColor: '#D4A017',
          fontWeight: 800, fontSize: 16, letterSpacing: '0.08em',
          padding: '2px 10px', borderRadius: 6,
        }}>MARY</span>
        <span style={{ color: '#B8B8B8', fontSize: 15 }}>at checkout for your founders discount</span>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          backgroundColor: '#1A1A1A',
          borderRadius: 16,
          border: '2px solid #D4A017',
          boxShadow: '0 0 32px rgba(212,160,23,0.12), 0 8px 24px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
        className="gs-founders-grid"
        >
          {/* Left: Founder note */}
          <div style={{
            padding: '40px 40px',
            borderRight: '1px solid rgba(212,160,23,0.2)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#D4A017', textTransform: 'uppercase', margin: '0 0 16px' }}>
              A note from the founder
            </p>
            <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.75, margin: 0 }}>
              I built Judge My Driving because I wanted a simple, honest way to know how my kid was doing on the road — without installing an app on their phone or making them feel watched. A bumper sticker felt right. Anyone who sees them drive can leave feedback in seconds. No accounts. No apps. Just real signal from real people. That is still what this is.
            </p>
          </div>

          {/* Right: Founding member offer */}
          <div style={{
            padding: '40px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
          }}>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 700, lineHeight: 1.2, color: '#D4A017', margin: 0 }}>
              Founding member pricing
            </h2>
            <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              The first 100 families get a founders discount and direct email access to the founder. When the 100 spots are gone, this offer is gone.
            </p>
            <div>
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
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .gs-founders-grid {
            grid-template-columns: 1fr !important;
          }
          .gs-founders-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid rgba(212,160,23,0.2);
          }
        }
      `}</style>
    </section>
  );
}