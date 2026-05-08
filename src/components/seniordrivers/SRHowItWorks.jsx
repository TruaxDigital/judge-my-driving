import React, { useState } from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Pick a tasteful design',
    body: 'Choose from 15+ designs made for senior drivers. "Still Got It." "Experienced Driver." "Keeping Roads Safe." Stickers ship to your door, or directly to your parent, in 3 to 5 days.',
  },
  {
    num: '02',
    title: 'Place it on the bumper',
    body: 'Peel and stick. Ten seconds. No hardware, no wiring, no app for your parent to set up. They drive their car the way they always have.',
  },
  {
    num: '03',
    title: "See how they're doing on the road",
    body: 'Other drivers scan the QR code and leave a quick rating. You get an email the moment they hit submit. Comment, time, rough location. Real feedback, in real time.',
  },
];

const SAMPLE_EMAIL_HTML = `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#0F0F0F;padding:20px 24px;">
    <img src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg" alt="Judge My Driving" style="height:28px;" />
  </div>
  <div style="padding:24px;">
    <p style="font-size:13px;color:#888;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">New feedback received</p>
    <h2 style="font-size:22px;font-weight:700;color:#0F0F0F;margin:0 0 16px;">Your driver got a 5-star rating</h2>
    <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:16px;margin-bottom:16px;">
      <div style="display:flex;gap:4px;margin-bottom:8px;">
        ${[1,2,3,4,5].map(() => '<span style="color:#D4A017;font-size:18px;">&#9733;</span>').join('')}
      </div>
      <p style="font-size:15px;color:#222;margin:0 0 8px;line-height:1.5;">"Very careful driver, gave plenty of space and used signals perfectly. Refreshing to see."</p>
      <p style="font-size:12px;color:#888;margin:0;">Near Route 1, St. Petersburg, FL &bull; Today at 10:14 AM</p>
    </div>
    <a href="#" style="display:block;text-align:center;background:#D4A017;color:#0F0F0F;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">View full feedback report</a>
  </div>
  <div style="padding:12px 24px;background:#f0f0f0;border-top:1px solid #e0e0e0;">
    <p style="font-size:11px;color:#999;margin:0;text-align:center;">Judge My Driving &bull; Unsubscribe &bull; Privacy Policy</p>
  </div>
</div>
`;

export default function SRHowItWorks() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="how-it-works" style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            How it works
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 17, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            Three steps. No tracker, no app for your parent, no confrontation required.
          </p>
        </div>

        <div className="sr-steps-grid">
          {STEPS.map(({ num, title, body }) => (
            <div
              key={num}
              style={{
                backgroundColor: '#1A1A1A', borderRadius: 16, padding: 32,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Step {num}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25, marginBottom: 12 }}>{title}</h3>
              <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, margin: 0 }}>{body}</p>
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
            position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 520, width: '100%' }}>
            <div dangerouslySetInnerHTML={{ __html: SAMPLE_EMAIL_HTML }} />
            <button
              onClick={() => setModalOpen(false)}
              style={{
                marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
                color: '#FFFFFF', fontSize: 14, fontWeight: 600, padding: '10px', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .sr-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 768px) { .sr-steps-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}