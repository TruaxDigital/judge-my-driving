import React from 'react';

export default function GSTestimonials() {
  return (
    <section style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#1A1A1A', borderRadius: 16, padding: '48px 40px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
        }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 24, color: '#FFFFFF' }}>
            A note from the founder
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.75, margin: '0 0 32px' }}>
            {/* FOUNDER NOTE — edit this text in the visual editor */}
            I built Judge My Driving because I wanted a simple, honest way to know how my kid was doing on the road — without installing an app on their phone or making them feel watched. A bumper sticker felt right. Anyone who sees them drive can leave feedback in seconds. No accounts. No apps. Just real signal from real people. That is still what this is.
          </p>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24,
            color: '#D4A017', fontSize: 15, fontWeight: 600, lineHeight: 1.55,
          }}>
            Founding member pricing: the first 100 families get direct access to me and a founders discount.
          </div>
        </div>
      </div>
    </section>
  );
}