import React from 'react';
import { GraduationCap, HeartHandshake, Users, Truck } from 'lucide-react';

const CARDS = [
  {
    icon: GraduationCap,
    title: 'Teen Drivers',
    body: 'Your kid just got their license. You can\'t ride along every time. The sticker gives every driver behind them a way to tell you how they\'re doing.',
    link: 'Individual or Family',
    href: '#pricing',
  },
  {
    icon: HeartHandshake,
    title: 'Senior Drivers',
    body: 'The conversation about Mom or Dad\'s driving is rough. The sticker does the watching for you, with no awkward sit-down required. Bought by adult kids who worry. Worn without a fight.',
    link: 'Family',
    href: '#pricing',
  },
  {
    icon: Users,
    title: 'Families',
    body: 'One dashboard for every car in the household. Daily and weekly digests, gamified leaderboards between drivers, unlimited history.',
    link: 'Family',
    href: '#pricing',
  },
  {
    icon: Truck,
    title: 'Commercial Fleets',
    body: 'Branded vehicles, real public ratings, insurance-ready PDF reports. From $999 a year for 10 trucks. No GPS hardware.',
    link: 'See fleet plans',
    href: '/fleet-drivers',
  },
];

export default function GSWhoItsFor() {
  return (
    <section style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, textAlign: 'center', marginBottom: 48 }}>
          Who it's for
        </h2>
        <div className="gs-who-grid">
          {CARDS.map(({ icon: Icon, title, body, link, href }) => (
            <div
              key={title}
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 16,
                padding: 32,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 999,
                backgroundColor: 'rgba(212,160,23,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} color="#D4A017" strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25, margin: 0 }}>{title}</h3>
              <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.6, margin: 0, flex: 1 }}>{body}</p>
              <a
                href={href}
                onClick={href.startsWith('#') ? e => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); } : undefined}
                style={{ color: '#D4A017', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                {link} &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .gs-who-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .gs-who-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .gs-who-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}