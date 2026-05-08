import React, { useState } from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Pick a sticker design',
    body: 'Choose from 15+ designs. Family-friendly, fleet-branded, attention-grabbing. We ship to any address in the US in 3 to 5 days.',
  },
  {
    num: '02',
    title: 'Stick it on the bumper',
    body: 'Peel and place. Works on any clean surface. No tools, no app, no driver onboarding. The QR code does the rest.',
  },
  {
    num: '03',
    title: 'Get rated in real time',
    body: 'When someone scans, the driver gets a quick 5-star rating page. You get an email the moment a rating comes in, with the comment and the rough location.',
  },
];

export default function GSHowItWorks() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="how-it-works" style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            How it works
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
            Three steps. No app for the driver. No hardware. No subscriptions for the people scanning.
          </p>
        </div>

        <div className="gs-steps-grid">
          {STEPS.map(({ num, title, body }) => (
            <div
              key={num}
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: 64, fontWeight: 700, color: '#D4A017', lineHeight: 1, marginBottom: 16 }}>
                {num}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, lineHeight: 1.25 }}>{title}</h3>
              <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{ background: 'none', border: 'none', color: '#D4A017', fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            See a sample feedback email
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#1A1A1A', borderRadius: 16, padding: 32,
              border: '1px solid rgba(255,255,255,0.1)', maxWidth: 500, width: '100%',
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Sample feedback email</h3>
            <div style={{ backgroundColor: '#222', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 13, color: '#7A7A7A', marginBottom: 4 }}>From: noreply@judgemydriving.com</div>
              <div style={{ fontSize: 13, color: '#7A7A7A', marginBottom: 16 }}>Subject: New rating on your sticker</div>
              <div style={{ fontSize: 15, color: '#FFFFFF', marginBottom: 8 }}>
                <strong style={{ color: '#D4A017' }}>4 out of 5 stars</strong>
              </div>
              <div style={{ fontSize: 14, color: '#B8B8B8', marginBottom: 8 }}>
                "Drove cautiously through the school zone. Gave plenty of room to cyclists."
              </div>
              <div style={{ fontSize: 13, color: '#7A7A7A' }}>Near: Richmond, VA &bull; 2:34 PM</div>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              style={{ marginTop: 24, background: '#D4A017', color: '#0F0F0F', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .gs-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .gs-steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}