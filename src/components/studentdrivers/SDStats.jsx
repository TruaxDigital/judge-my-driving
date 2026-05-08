import React from 'react';

const STATS = [
  {
    number: '3x',
    body: 'Higher fatal crash risk for 16 to 19 year-olds compared to drivers 20 and up.',
    source: 'IIHS, 2023',
    href: 'https://www.iihs.org/topics/teenagers',
  },
  {
    number: '6M+',
    body: 'Teen driver crashes per year in the United States.',
    source: 'NHTSA, 2023',
    href: 'https://www.nhtsa.gov/road-safety/teen-driving',
  },
  {
    number: '1 in 3',
    body: 'Fatal teen crashes involve speeding. Most happen in the first 12 months of driving.',
    source: 'NHTSA Teen Driving, 2023',
    href: 'https://www.nhtsa.gov/road-safety/teen-driving',
  },
];

export default function SDStats() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{
          textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#D4A017',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 48,
        }}>
          The numbers parents do not want to read
        </p>

        <div className="sd-stats-grid">
          {STATS.map(({ number, body, source, href }) => (
            <div
              key={number}
              style={{
                backgroundColor: '#222', borderRadius: 16, padding: 40,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div style={{ fontSize: 'clamp(48px, 6vw, 64px)', fontWeight: 700, color: '#D4A017', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>
                {number}
              </div>
              <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, margin: 0, flex: 1 }}>{body}</p>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#7A7A7A', fontStyle: 'italic', textDecoration: 'none' }}
              >
                {source}
              </a>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#B8B8B8', fontSize: 17, lineHeight: 1.55, marginTop: 48, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          The first year is the highest risk year. That is exactly the year you can't ride along.
        </p>
      </div>

      <style>{`
        .sd-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) { .sd-stats-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}