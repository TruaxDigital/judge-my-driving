import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Will my teen take the sticker off?',
    a: 'Most do not. The sticker is a quiet daily reminder, not a public shaming tool. The designs are intentionally cool-leaning, like "Got Feedback?" and "Student Driver." If they do remove it, you will know fast because the scans stop. Replace it for $19 and have a different conversation.',
  },
  {
    q: 'Will it embarrass them?',
    a: 'The teen-targeted designs are written for teens, not against them. "Student Driver" reads as confident, not babyish. Most parents report their kid forgot the sticker was there within a week. The behavior change happens early.',
  },
  {
    q: 'What if someone leaves a fake bad review?',
    a: 'Every scan logs a timestamp and rough location. Patterns matter, single ratings do not. One angry driver does not move your overall score. Repeated issues are the exact early warning you want.',
  },
  {
    q: 'Is the person scanning anonymous?',
    a: 'Yes. The reviewer does not log in or share their name. We capture rough location and timestamp so you can spot patterns. You see the rating, the comment, the time, and the rough area.',
  },
  {
    q: 'Will it hurt the paint?',
    a: 'No. The stickers are weatherproof vinyl with low-tack adhesive made for vehicles. They peel off cleanly when you replace them.',
  },
  {
    q: 'Does it actually change driving behavior?',
    a: 'Third-party driver feedback has been used since 1991 and is shown in published research to reduce risky driving incidents by 20 to 30 percent. JMD modernizes the format with QR codes and real-time alerts.',
  },
  {
    q: 'What if I do not love it?',
    a: 'Email hello@judgemydriving.com within 30 days for a full refund. No scripts, no hoops.',
  },
  {
    q: 'What about insurance?',
    a: "Some carriers offer good-driver discounts when you can document a teen's driving record. JMD does not promise a discount, but the email log and dashboard give you something to bring to the conversation. Ask your agent.",
  },
  {
    q: 'Do you sell my data?',
    a: 'No. We do not sell, share, or rent any data about you, your teen, or the people scanning.',
    link: { label: 'Read the privacy policy here.', href: '/privacy' },
  },
];

export default function SDFAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 48, textAlign: 'center' }}>
          The questions every parent asks first
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
                  size={20}
                  color="#7A7A7A"
                  style={{ flexShrink: 0, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                />
              </button>
              {openIdx === i && (
                <div style={{ paddingBottom: 20 }}>
                  <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
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