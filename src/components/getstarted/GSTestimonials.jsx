import React, { useState } from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'The first scan came in three days after we put the sticker on. Someone said my son was driving great in the rain. I almost cried. The second one, two weeks later, said he was tailgating. We had a conversation that night. That is the whole product right there.',
    name: 'Megan R.',
    role: 'Mom of a 17-year-old',
    city: 'Charlotte, NC',
    initials: 'MR',
  },
  {
    quote: 'I live four hours from my dad. I used to call him every Sunday and ask if he was still feeling okay behind the wheel. Now I get an email when someone rates him on the road. He has a 4.7. I sleep at night.',
    name: 'Daniel K.',
    role: 'Son of a senior driver',
    city: 'Phoenix, AZ',
    initials: 'DK',
  },
  {
    quote: 'I ran 14 trucks blind for nine years. First month with JMD, I caught one driver who was a problem and one driver who deserved a raise. The insurance report at renewal saved us almost $4,000. The sticker pays for itself ten times over.',
    name: 'Jamal P.',
    role: 'Operations manager, regional HVAC company',
    city: 'Atlanta, GA',
    initials: 'JP',
  },
];

export default function GSTestimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            What people are saying
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6 }}>
            Real users. Real installs. Names changed only where requested.
          </p>
        </div>

        {/* Desktop: 3 col grid */}
        <div className="gs-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>

        {/* Mobile: single card + dots */}
        <div className="gs-testimonials-mobile">
          <TestimonialCard t={TESTIMONIALS[activeIdx]} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  width: 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer',
                  backgroundColor: activeIdx === i ? '#D4A017' : 'rgba(255,255,255,0.2)',
                  padding: 0,
                }}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <p style={{ color: '#7A7A7A', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
          Want to share your experience? Email{' '}
          <a href="mailto:hello@judgemydriving.com" style={{ color: '#7A7A7A' }}>hello@judgemydriving.com</a>.
        </p>
      </div>

      <style>{`
        .gs-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .gs-testimonials-mobile { display: none; }
        @media (max-width: 768px) {
          .gs-testimonials-grid { display: none; }
          .gs-testimonials-mobile { display: block; }
        }
      `}</style>
    </section>
  );
}

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
        <Star size={16} color="rgba(212,160,23,0.3)" fill="rgba(212,160,23,0.3)" />
      </div>
      <p style={{ color: '#FFFFFF', fontSize: 15, lineHeight: 1.65, fontStyle: 'italic', flex: 1, margin: 0 }}>
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
          padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#D4A017',
          whiteSpace: 'nowrap',
        }}>
          Verified user
        </div>
      </div>
    </div>
  );
}