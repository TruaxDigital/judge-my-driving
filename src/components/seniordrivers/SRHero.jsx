import React, { useEffect, useState } from 'react';
import { Mail, EyeOff, Truck, ShieldCheck } from 'lucide-react';
import { DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';

const TRUST_ITEMS = [
  { icon: Mail, label: 'Email alert on every scan' },
  { icon: EyeOff, label: 'Anonymous reviewer' },
  { icon: Truck, label: 'Ships free in 3 to 5 days' },
  { icon: ShieldCheck, label: '30-day money back' },
];

const HERO_DESIGNS = ['still_got_it', 'decades_behind_wheel', 'experienced_driver'];

export default function SRHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" style={{ paddingTop: 128, paddingBottom: 96, backgroundColor: '#0F0F0F' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="sr-hero-grid">
          {/* Left: Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.4)',
              borderRadius: 999, padding: '6px 14px', width: 'fit-content',
            }}>
              <span style={{ color: '#D4A017', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>For adult children of senior drivers</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
              You worry every time they drive.{' '}
              <span style={{ color: '#D4A017' }}>Now you'll know.</span>
            </h1>

            <p style={{ color: '#B8B8B8', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.55, margin: 0, maxWidth: 560 }}>
              Other drivers scan a QR sticker on your parent's car and rate how they're doing. The rating, the comment, and the rough location land in your inbox in real time. No tracker, no app on their phone, no awkward conversation required.
            </p>

            <div className="sr-hero-trust-grid">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={16} color="#D4A017" strokeWidth={1.75} />
                  <span style={{ color: '#B8B8B8', fontSize: 14, fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <a
                href="#pricing"
                onClick={e => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="sr-cta-pulse"
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
                style={{ color: '#7A7A7A', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}
              >
                See how it works ↓
              </a>
            </div>

            <p style={{ color: '#7A7A7A', fontSize: 14, margin: 0 }}>Less than $1 a week. Cancel anytime.</p>
          </div>

          {/* Right: Sticker stack */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease',
            gap: 16,
            overflow: 'hidden',
          }}>
            {HERO_DESIGNS.map((id, i) => {
              const rotations = [-3, 2, -1.5];
              return (
                <div key={id} style={{
                 transform: `rotate(${rotations[i]}deg)`,
                 width: '90%',
                 zIndex: 3 - i,
                 boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                 borderRadius: 12,
                 overflow: 'hidden',
                 flexShrink: 0,
                 position: 'relative',
                }}>
                 <img src={DESIGN_URLS[id]} alt={id.replace(/_/g, ' ')} style={{ width: '100%', display: 'block' }} />
                 <img
                   src="https://media.base44.com/images/public/69b8646a9cc3aed112928d77/c1261e10f_qr-code2.png"
                   alt="QR code"
                   style={{
                     position: 'absolute',
                     bottom: '6%',
                     right: '5%',
                     width: '28%',
                     pointerEvents: 'none',
                   }}
                 />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .sr-hero-grid {
          display: grid;
          grid-template-columns: 58% 42%;
          gap: 48px;
          align-items: center;
          overflow: hidden;
        }
        .sr-hero-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
        }
        @keyframes sr-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
        .sr-cta-pulse { animation: sr-pulse 0.6s ease-out 1; }
        @media (prefers-reduced-motion: reduce) { .sr-cta-pulse { animation: none; } }
        @media (max-width: 768px) {
          .sr-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .sr-hero-grid > div:last-child { order: -1; min-height: 240px !important; }
        }
      `}</style>
    </section>
  );
}