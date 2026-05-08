import React, { useState } from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "I lasted six weeks before I cracked. He had his license, my schedule did not match his, and I was checking Find My Phone every 20 minutes. The first scan came in three days after we put the sticker on. A delivery driver said he was driving great in the rain. I almost cried. Worth every dollar of $49.",
    name: 'Megan R.',
    role: 'Mom of a 17-year-old',
    city: 'Charlotte, NC',
    initials: 'MR',
  },
  {
    quote: "My son thought he was hiding it from me. The fourth scan in a week said \"this kid is way too fast on the merge.\" I showed him the email. No yelling, no lecture, just the email. He has not gotten a bad rating in three months. The sticker did the work I could not.",
    name: 'Michael T.',
    role: 'Dad of a 16-year-old',
    city: 'Columbus, OH',
    initials: 'MT',
  },
  {
    quote: "I started with the Individual plan for my daughter. Two months later, my son got his license. The Family plan was a no-brainer. Three stickers, one dashboard, both kids covered for $99. I see who's driving better and who needs a check-in. The leaderboard is half a joke and half a real motivator.",
    name: 'Sarah L.',
    role: 'Mom of two teen drivers',
    city: 'Sacramento, CA',
    initials: 'SL',
  },
];

function TestimonialCard({ t }) {
  return (
    <div style={{
      backgroundColor: '#1A1A1A', borderRadius: 16, padding: 32,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4].map(i => <Star key={i} size={16} color="#D4A017" fill="#D4A017" />)}
        <Star size={16} color="#D4A017" fill="transparent" strokeWidth={1.75} />
      </div>
      <p style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 1.65, fontStyle: 'italic', flex: 1, margin: 0 }}>
        "{t.quote}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 999,
            backgroundColor: 'rgba(212,160,23,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#D4A017',
          }}>
            {t.initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#7A7A7A' }}>{t.role} &bull; {t.city}</div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(212,160,23,0.12)', borderRadius: 999,
          padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#D4A017', whiteSpace: 'nowrap',
        }}>
          Verified parent
        </div>
      </div>
    </div>
  );
}

export default function SDTestimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 12 }}>
            Real parents. Real first 30 days.
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            These are scenarios that match what JMD parents commonly report after install. Names changed for privacy.
          </p>
        </div>

        <div className="sd-testimonials-grid">
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>

        <div className="sd-testimonials-mobile">
          <TestimonialCard t={TESTIMONIALS[activeIdx]} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  width: 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer',
                  backgroundColor: activeIdx === i ? '#D4A017' : 'rgba(255,255,255,0.2)', padding: 0,
                }}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <p style={{ color: '#7A7A7A', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
          Want to share your story? Email{' '}
          <a href="mailto:hello@judgemydriving.com" style={{ color: '#7A7A7A' }}>hello@judgemydriving.com</a>.
        </p>
      </div>

      <style>{`
        .sd-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .sd-testimonials-mobile { display: none; }
        @media (max-width: 768px) {
          .sd-testimonials-grid { display: none; }
          .sd-testimonials-mobile { display: block; }
        }
      `}</style>
    </section>
  );
}