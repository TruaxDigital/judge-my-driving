import React, { useEffect, useState } from 'react';
import { Mail, EyeOff, Truck, ShieldCheck } from 'lucide-react';
import { DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';

const TRUST_ITEMS = [
  { icon: Mail, label: 'Email alert on every scan' },
  { icon: EyeOff, label: 'Anonymous reviewer' },
  { icon: Truck, label: 'Ships free in 3 to 5 days' },
  { icon: ShieldCheck, label: '30-day money back' },
];

const HERO_DESIGNS = ['tell_my_boss', 'student_driver', 'on_the_clock'];

export default function GSHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section style={{ paddingTop: 128, paddingBottom: 96, backgroundColor: '#0F0F0F' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="gs-hero-grid">
          {/* Left: Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.4)',
              borderRadius: 999, padding: '6px 14px', width: 'fit-content',
            }}>
              <span style={{ color: '#D4A017', fontSize: 13, fontWeight: 600 }}>Real-time driver feedback</span>
            </div>

            {/* H1 */}
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
              Find out how they're really driving.{' '}
              <span style={{ color: '#D4A017' }}>Before the call from the cops.</span>
            </h1>

            {/* Subhead */}
            <p style={{ color: '#B8B8B8', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.55, margin: 0, maxWidth: 560 }}>
              A QR-coded bumper sticker that lets anyone on the road rate the driver. Anonymous for them. Honest for you. Every scan emails you the rating, the comment, and the location in real time.
            </p>

            {/* Trust strip */}
            <div className="gs-trust-grid">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={16} color="#D4A017" strokeWidth={1.75} />
                  <span style={{ color: '#B8B8B8', fontSize: 14, fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <a
                href="#pricing"
                onClick={e => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="gs-cta-pulse"
                style={{
                  display: 'inline-block', backgroundColor: '#D4A017', color: '#0F0F0F',
                  fontWeight: 700, fontSize: 16, padding: '14px 32px', borderRadius: 12,
                  textDecoration: 'none', boxShadow: '0 8px 24px rgba(212,160,23,0.25)',
                }}
              >
                See pricing
              </a>
              <a href="/login" style={{ color: '#7A7A7A', fontSize: 14, textDecoration: 'none' }}
                onMouseOver={e => e.target.style.color = '#B8B8B8'}
                onMouseOut={e => e.target.style.color = '#7A7A7A'}
              >
                Already have an account? Sign in
              </a>
              <p style={{ fontSize: 13, color: '#8A8680', marginTop: 8, marginBottom: 0 }}>Prefer a faster way? Sign up with Google or Apple.</p>
              </div>
          </div>

          {/* Right: Design stack — vertical cascade */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.8s ease',
              gap: 16,
              overflow: 'hidden',
            }}
          >
            {HERO_DESIGNS.map((id, i) => {
              const rotations = [-3, 2, -1.5];
              return (
                <div
                  key={id}
                  style={{
                    transform: `rotate(${rotations[i]}deg)`,
                    width: '90%',
                    zIndex: 3 - i,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={DESIGN_URLS[id]}
                    alt={id.replace(/_/g, ' ')}
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .gs-hero-grid {
          display: grid;
          grid-template-columns: 58% 42%;
          gap: 48px;
          align-items: center;
          overflow: hidden;
        }
        .gs-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
        }
        @keyframes gs-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .gs-cta-pulse {
          animation: gs-pulse 0.6s ease-out 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-cta-pulse { animation: none; }
        }
        @media (max-width: 768px) {
          .gs-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .gs-hero-grid > div:last-child {
            order: -1;
            min-height: 240px !important;
          }
        }
      `}</style>
    </section>
  );
}