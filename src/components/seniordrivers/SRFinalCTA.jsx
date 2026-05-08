import React from 'react';

export default function SRFinalCTA() {
  return (
    <section style={{
      backgroundColor: 'rgba(212,160,23,0.10)',
      borderTop: '1px solid rgba(212,160,23,0.25)',
      borderBottom: '1px solid rgba(212,160,23,0.25)',
      padding: '80px 24px',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, color: '#FFFFFF', margin: 0 }}>
          You can keep wondering. Or you can start knowing.
        </h2>
        <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          For $49 a year, you trade a thousand silent worries for one calm inbox.
        </p>
        <a
          href="#pricing"
          onClick={e => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
          style={{
            backgroundColor: '#D4A017', color: '#0F0F0F',
            fontWeight: 700, fontSize: 17, padding: '16px 40px', borderRadius: 12,
            textDecoration: 'none', boxShadow: '0 8px 24px rgba(212,160,23,0.25)',
          }}
        >
          Get a sticker for $49
        </a>
        <p style={{ color: '#7A7A7A', fontSize: 14, margin: 0 }}>
          Or talk to a human at{' '}
          <a href="mailto:hello@judgemydriving.com" style={{ color: '#7A7A7A', textDecoration: 'underline' }}>
            hello@judgemydriving.com
          </a>
        </p>
      </div>
    </section>
  );
}