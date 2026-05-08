import React from 'react';

const STATS = [
  {
    number: '#1',
    body: 'Highest crash death rate per mile of any age group: drivers 75 and older.',
    source: 'IIHS, 2023',
    href: 'https://www.iihs.org/topics/older-drivers',
  },
  {
    number: '83%',
    body: 'Of adult children avoid having the driving conversation with an aging parent.',
    source: 'AAA Foundation for Traffic Safety, 2022',
    href: 'https://aaafoundation.org/older-drivers/',
  },
  {
    number: '4 in 10',
    body: 'Senior drivers say they have already self-restricted, but most have never been told their actual driving record.',
    source: 'AAA LongROAD Study, 2023',
    href: 'https://aaafoundation.org/longroad-study/',
  },
];

export default function SRStats() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{
          textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#D4A017',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 48,
        }}>
          The quiet truth about driving after 70
        </p>

        <div className="sr-stats-grid">
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
              <div style={{ fontSize: 'clamp(48px, 6vw, 64px)', fontWeight: 700, color: '#D4A017', lineHeight: 1 }}>
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

        <p style={{ textAlign: 'center', color: '#B8B8B8', fontSize: 18, lineHeight: 1.55, marginTop: 48, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          The conversation does not have to start with you. It can start with the data.
        </p>
      </div>

      <style>{`
        .sr-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 768px) { .sr-stats-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}