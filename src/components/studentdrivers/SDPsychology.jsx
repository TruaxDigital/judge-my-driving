import React, { useState, useEffect } from 'react';
import { DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';

const POINTS = [
  {
    title: 'Visibility changes behavior',
    body: "Teens are wired for social feedback. The moment they know strangers can rate them, the foot eases off the gas. This is not a tracker yelling from the cab. It is a quiet reminder that the world is watching.",
  },
  {
    title: 'Real consequences, no nagging',
    body: "When the email comes in, you have data. Not a hunch, not a fight. A timestamped rating with a comment. That makes the conversation easier and shorter.",
  },
  {
    title: 'Earned trust, not surveillance',
    body: "No camera in the dash. No app on their phone. No GPS pings every six minutes. Your teen keeps their privacy and you get the feedback that matters most: how they actually behave on the road.",
  },
];

export default function SDPsychology() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sd-psych-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 8px' }}>
              Why teens drive better with the sticker on
            </h2>
            {POINTS.map(({ title, body }) => (
              <div key={title}>
                <h3 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {[
              { id: 'new_driver', rot: -3 },
              { id: 'tell_my_mom', rot: 2 },
              { id: 'tell_my_dad', rot: -1.5 },
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
        .sd-psych-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .sd-psych-grid { grid-template-columns: 1fr; gap: 48px; }
          .sd-psych-grid > div:last-child { order: -1; }
        }
      `}</style>
    </section>
  );
}