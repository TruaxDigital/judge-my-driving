import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the sticker work?',
    a: 'The sticker has a QR code printed on it. Anyone with a phone camera can scan it from outside the car. They land on a clean rating page where they leave 1 to 5 stars and an optional comment. You get an email the moment they hit submit. The driver does not need an app or an account.',
  },
  {
    q: 'Is the person scanning anonymous?',
    a: 'Yes. The reviewer does not log in or share their name. We do capture rough location and timestamp so you can spot patterns. You see the rating, the comment, the time, and the rough area.',
  },
  {
    q: 'Will it ruin my paint or bumper?',
    a: 'No. The stickers are weatherproof vinyl with low-tack adhesive made for vehicles. They peel off cleanly when you are ready to replace them.',
  },
  {
    q: 'What if my driver gets a fake bad review?',
    a: 'Every scan logs a timestamp and rough location. Patterns matter, single ratings do not. One angry driver does not move your overall score in a real way. Repeated issues are exactly what you want to see early.',
  },
  {
    q: 'What happens if I do not love it?',
    a: 'Email hello@judgemydriving.com within 30 days for a full refund. No questions, no scripts, no hoops.',
  },
  {
    q: 'How fast does the sticker ship?',
    a: 'We print and ship orders in 3 to 5 business days inside the United States. You will get a tracking link by email.',
  },
  {
    q: 'Can I add more vehicles later?',
    a: 'Yes. Family plans add vehicles for $39 a year each. Fleet plans scale up to 50 trucks with custom pricing above that.',
  },
  {
    q: 'Do you sell my data?',
    a: 'No. We do not sell, share, or rent any data about you, your driver, or the people scanning.',
    link: { label: 'Read the privacy policy here.', href: '/privacy' },
  },
];

export default function GSFAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" style={{ backgroundColor: '#1A1A1A', padding: '96px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 48, textAlign: 'center' }}>
          Quick answers
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FAQS.map(({ q, a, link }, i) => (
            <div
              key={i}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button
                onClick={() => toggle(i)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); toggle(Math.min(i + 1, FAQS.length - 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); toggle(Math.max(i - 1, 0)); }
                }}
                aria-expanded={openIdx === i}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', padding: '20px 0', cursor: 'pointer',
                  textAlign: 'left', gap: 16,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.4 }}>{q}</span>
                <ChevronDown
                  size={20}
                  color="#7A7A7A"
                  style={{ flexShrink: 0, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                />
              </button>
              {openIdx === i && (
                <div style={{ paddingBottom: 20 }}>
                  <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                    {a}{' '}
                    {link && (
                      <a href={link.href} style={{ color: '#D4A017' }}>{link.label}</a>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}