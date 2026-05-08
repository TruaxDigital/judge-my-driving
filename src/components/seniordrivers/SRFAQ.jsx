import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Will my parent feel like I am spying on them?',
    a: 'No tracker, no app, no GPS, no camera in the car. The QR code on the bumper is the same QR code anyone could put on any vehicle. The rating reflects what the public already sees on the road. You are not following them. You are seeing what other drivers already see.',
  },
  {
    q: 'What if my parent refuses to put it on?',
    a: 'Many adult children install it themselves on a visit, or send it directly to a sibling who can place it. The sticker takes ten seconds and works without any setup or buy-in from the driver. If your parent later asks about the sticker, you can be honest about why it is there. Most are surprisingly fine with it once they understand the mechanic.',
  },
  {
    q: 'Will the sticker make them feel old or embarrassed?',
    a: 'The senior-targeted designs are written to honor the driver, not to mark them. "Still Got It," "Experienced Driver," "Decades on the Road." None of them say "elderly" or "old." Many of our adult-child users tell us their parent ended up choosing the design themselves.',
  },
  {
    q: 'Will it hurt the paint?',
    a: 'No. The stickers are weatherproof vinyl with low-tack adhesive made for vehicles. They peel off cleanly when you replace them.',
  },
  {
    q: 'What if someone leaves a fake bad review?',
    a: 'Every scan logs a timestamp and rough location. Patterns matter, single ratings do not. One angry driver does not move your overall score. Repeated issues are exactly the early warning you want.',
  },
  {
    q: 'When does the feedback mean it is time to take the keys?',
    a: 'Judge My Driving does not make that call for you. It gives you data: timestamped ratings, comments, dates. That data is one input alongside doctor visits, family observations, and the parent\'s own self-report. Use it to inform a real conversation, not replace one.',
  },
  {
    q: 'Can I share the dashboard with my siblings?',
    a: 'Yes, on the Family plan. You can invite a sibling or another caregiver to the same dashboard so the load is shared. You all see the same ratings.',
  },
  {
    q: 'What about insurance discounts?',
    a: "Some carriers offer good-driver discounts when you can document a senior driver's record. JMD does not promise a discount, but the email log and dashboard give you something to bring to the conversation. Ask their agent.",
  },
  {
    q: 'Do you sell my data?',
    a: 'No. We do not sell, share, or rent any data about you, your parent, or the people scanning.',
    link: { label: 'Read the privacy policy here.', href: '/privacy' },
  },
];

export default function SRFAQ() {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 48, textAlign: 'center' }}>
          The questions adult children ask first
        </h2>
        <div>
          {FAQS.map(({ q, a, link }, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                  size={20} color="#7A7A7A"
                  style={{ flexShrink: 0, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                />
              </button>
              {openIdx === i && (
                <div style={{ paddingBottom: 20 }}>
                  <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
                    {a}{' '}
                    {link && <a href={link.href} style={{ color: '#D4A017' }}>{link.label}</a>}
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