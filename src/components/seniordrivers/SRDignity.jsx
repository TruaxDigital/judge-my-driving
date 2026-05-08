import React from 'react';
import { DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';

const CARDS = [
  {
    title: 'No GPS, no app, no surveillance',
    body: 'There is no device in the car. No camera in the cab. No app on their phone. The QR code on the bumper is invisible to your parent\'s daily routine. They drive the way they always have.',
  },
  {
    title: 'Public ratings, not private snooping',
    body: "What you see is what any other driver sees of them on the road. This is the public's view of their driving, the same view a stranger gets on the highway. It is honest data without intrusion.",
  },
  {
    title: 'Real data for the real conversation',
    body: 'If the time comes for a hard conversation about driving, you do not have to lead with a feeling. You lead with a record. Timestamped ratings, comments, dates. That changes the tone of every conversation that follows.',
  },
];

export default function SRDignity() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sr-dignity-layout">
          <div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 40 }}>
              Why this is not a tracker, and not a takeaway
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {CARDS.map(({ title, body }) => (
                <div key={title}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25, marginBottom: 10 }}>{title}</h3>
                  <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {[
              { id: 'still_got_it', rot: -3 },
              { id: 'experienced_driver', rot: 2 },
              { id: 'decades_behind_wheel', rot: -1.5 },
            ].map(({ id, rot }) => (
              <div
                key={id}
                style={{
                  transform: `rotate(${rot}deg)`,
                  width: '90%',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img src={DESIGN_URLS[id]} alt={id.replace(/_/g, ' ')} style={{ width: '100%', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .sr-dignity-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .sr-dignity-layout { grid-template-columns: 1fr; gap: 48px; }
          .sr-dignity-layout > div:last-child { order: -1; }
        }
      `}</style>
    </section>
  );
}