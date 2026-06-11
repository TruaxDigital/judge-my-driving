import React from 'react';

const STATS = [
  { number: '15+', label: 'Sticker designs to choose from' },
  { number: '2 min', label: 'From scan to email alert' },
  { number: '0', label: 'Apps your driver has to install' },
  { number: '30 days', label: 'Money back if it\'s not for you' },
];

export default function GSSocialProof() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ color: '#B8B8B8', fontSize: 18, textAlign: 'center', marginBottom: 48, lineHeight: 1.55 }}>
          Built for parents, families, caregivers, and small fleets across the United States.
        </p>
        <div className="gs-stats-grid">
          {STATS.map(({ number, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#D4A017', lineHeight: 1.1, marginBottom: 8 }}>
                {number}
              </div>
              <div style={{ color: '#7A7A7A', fontSize: 14, lineHeight: 1.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .gs-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        @media (max-width: 768px) {
          .gs-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 32px 16px; }
        }
      `}</style>
    </section>
  );
}