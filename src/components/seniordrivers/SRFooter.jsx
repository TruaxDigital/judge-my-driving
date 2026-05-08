import React from 'react';

const PRODUCT_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Designs', href: '#designs' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'For teen drivers', href: '/student-drivers' },
  { label: 'Fleet plans', href: '/fleet-drivers' },
  { label: 'Sign in', href: '/login' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/get-started' },
  { label: 'Partners', href: '/partner-signup' },
  { label: 'Press', href: 'mailto:hello@judgemydriving.com' },
  { label: 'Contact', href: 'mailto:hello@judgemydriving.com' },
];

const LEGAL_LINKS = [
  { label: 'Terms of service', href: '/terms-of-service' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Refund policy', href: '/terms-of-service' },
  { label: 'Partner terms', href: '/partner-terms' },
];

function FooterCol({ title, links }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={href.startsWith('#') ? e => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); } : undefined}
            style={{ color: '#B8B8B8', fontSize: 14, textDecoration: 'none', lineHeight: 1.5 }}
            onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'}
            onMouseOut={e => e.currentTarget.style.color = '#B8B8B8'}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function SRFooter() {
  return (
    <footer style={{ backgroundColor: '#1A1A1A', padding: '64px 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sr-footer-grid">
          <div>
            <img
              src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
              alt="Judge My Driving"
              style={{ height: 36, marginBottom: 16 }}
            />
            <p style={{ color: '#7A7A7A', fontSize: 14, lineHeight: 1.6, maxWidth: 220 }}>
              Real-time public driver feedback. Made in the United States.
            </p>
          </div>
          <FooterCol title="Product" links={PRODUCT_LINKS} />
          <FooterCol title="Company" links={COMPANY_LINKS} />
          <FooterCol title="Legal" links={LEGAL_LINKS} />
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 48, padding: '24px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <p style={{ color: '#7A7A7A', fontSize: 13, margin: 0 }}>&copy; 2026 Judge My Driving. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'YouTube', href: 'https://www.youtube.com/channel/UC2KHf1B0MvARyF9y8k3ghYQ' },
              { label: 'Google', href: 'https://share.google/ZfMVX3kxFr3vi7QEI' },
              { label: 'TikTok', href: 'https://www.tiktok.com/@judgemydriving' },
              { label: 'Facebook', href: 'https://www.facebook.com/judgemydriving' },
              { label: 'X', href: 'https://x.com/JudgeMyDriving' },
              { label: 'Instagram', href: 'https://www.instagram.com/judgemydriving' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/company/judge-my-driving/' },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#7A7A7A', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = '#D4A017'}
                onMouseOut={e => e.currentTarget.style.color = '#7A7A7A'}
              >
                {label}
              </a>
            ))}

          </div>
        </div>
      </div>
      <style>{`
        .sr-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
        @media (max-width: 768px) { .sr-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
        @media (max-width: 480px) { .sr-footer-grid { grid-template-columns: 1fr; } }
      `}</style>
    </footer>
  );
}