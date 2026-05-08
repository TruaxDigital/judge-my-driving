import React, { useEffect, useState } from 'react';
import { Mail, EyeOff, Truck, ShieldCheck } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Mail, label: 'Email alert on every scan' },
  { icon: EyeOff, label: 'Anonymous reviewer' },
  { icon: Truck, label: 'Ships free in 3 to 5 days' },
  { icon: ShieldCheck, label: '30-day money back' },
];

export default function SDHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      style={{
        backgroundColor: '#0F0F0F',
        paddingTop: 128, paddingBottom: 96,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.4)',
          borderRadius: 999, padding: '6px 14px', marginBottom: 24,
        }}>
          <span style={{ color: '#D4A017', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Built for parents of new drivers</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 24px', fontFamily: 'Inter, sans-serif' }}>
          You can't ride shotgun forever.{' '}
          <span style={{ color: '#D4A017', display: 'block' }}>But you can still know.</span>
        </h1>

        <p style={{ color: '#B8B8B8', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.55, maxWidth: 640, margin: '0 auto 32px', fontFamily: 'Inter, sans-serif' }}>
          Other drivers scan a QR sticker on your teen's car and rate how they drive. You get the rating, the comment, and the rough location in your inbox the moment it happens. They drive knowing someone is watching.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <a
            href="#pricing"
            onClick={e => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="sd-cta-pulse"
            style={{
              display: 'inline-block', backgroundColor: '#D4A017', color: '#0F0F0F',
              fontWeight: 700, fontSize: 17, padding: '16px 40px', borderRadius: 12,
              textDecoration: 'none', boxShadow: '0 8px 24px rgba(212,160,23,0.25)',
            }}
          >
            Get a sticker for $49
          </a>
          <a
            href="#how-it-works"
            onClick={e => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ color: '#B8B8B8', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}
          >
            See how it works
          </a>
        </div>

        <div className="sd-trust-grid">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon size={16} color="#D4A017" strokeWidth={1.75} />
              <span style={{ color: '#B8B8B8', fontSize: 14, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        <p style={{ color: '#7A7A7A', fontSize: 14, marginTop: 16 }}>
          Less than $1 a week. Cancel anytime.
        </p>
      </div>

      <style>{`
        @keyframes sd-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
        .sd-cta-pulse { animation: sd-pulse 0.6s ease-out 1; }
        @media (prefers-reduced-motion: reduce) { .sd-cta-pulse { animation: none; } }
        .sd-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
          max-width: 480px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .sd-trust-grid { grid-template-columns: repeat(4, 1fr); max-width: none; }
        }
      `}</style>
    </section>
  );
}