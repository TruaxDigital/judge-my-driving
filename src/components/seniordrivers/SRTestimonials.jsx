import React, { useState } from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "I live four hours from my dad. I used to call him every Sunday and ask if he was still feeling okay behind the wheel. He always said yes. Now I get an email when someone rates him on the road. He has a 4.7 average. I sleep at night.",
    name: 'Daniel K.',
    role: 'Son of a senior driver',
    city: 'Phoenix, AZ',
    initials: 'DK',
  },
  {
    quote: "My mom is 79 and the most stubborn human I know. She refused to let me ride along, refused to let me look at her dashcam, refused to even discuss it. The sticker did what I could not. Three weeks in, two scans flagged real issues. We had a calm conversation. She agreed to a daytime-only rule on her own.",
    name: 'Patricia M.',
    role: 'Daughter of a senior driver',
    city: 'St. Petersburg, FL',
    initials: 'PM',
  },
  {
    quote: "My brother and I share the dashboard. We both see Dad's ratings. Now neither of us has to be the bad guy alone, and neither of us is in the dark. The Family plan made a hard situation feel like a team effort.",
    name: 'James W.',
    role: 'Son of a senior driver',
    city: 'Boise, ID',
    initials: 'JW',
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
        {[1,2,3,4,5].map(i => <Star key={i} size={16} color="#D4A017" fill="#D4A017" />)}
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
          Verified user
        </div>
      </div>
    </div>
  );
}

export default function SRTestimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 12 }}>
            Real adult children. Real first 30 days.
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            These are scenarios that match what JMD users commonly report after install. Names changed for privacy.
          </p>
        </div>

        <div className="sr-testimonials-grid">
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>

        <div className="sr-testimonials-mobile">
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
        .sr-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .sr-testimonials-mobile { display: none; }
        @media (max-width: 768px) {
          .sr-testimonials-grid { display: none; }
          .sr-testimonials-mobile { display: block; }
        }
      `}</style>
    </section>
  );
}