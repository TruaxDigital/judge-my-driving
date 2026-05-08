import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Designs', href: '#designs' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Fleet', href: '/fleet-drivers' },
];

function smoothScroll(href) {
  if (href.startsWith('#')) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = href;
  }
}

export default function GSNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: 64,
    backgroundColor: scrolled ? '#1A1A1A' : 'transparent',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
    transition: 'background-color 0.3s ease',
    display: 'flex', alignItems: 'center',
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/get-started">
            <img
              src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg"
              alt="Judge My Driving"
              style={{ height: 28, width: 'auto' }}
            />
          </a>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="gs-desktop-nav">
            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={e => { if (l.href.startsWith('#')) { e.preventDefault(); smoothScroll(l.href); } }}
                style={{ color: '#B8B8B8', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}
                onMouseOver={e => e.target.style.color = '#FFFFFF'}
                onMouseOut={e => e.target.style.color = '#B8B8B8'}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={e => { e.preventDefault(); smoothScroll('#pricing'); }}
              style={{
                backgroundColor: '#D4A017', color: '#0F0F0F', fontWeight: 700,
                padding: '10px 20px', borderRadius: 12, fontSize: 14, textDecoration: 'none',
                outline: 'none',
              }}
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 8 }}
            className="gs-mobile-nav"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, backgroundColor: '#1A1A1A',
          display: 'flex', flexDirection: 'column', padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <img src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg" alt="Judge My Driving" style={{ height: 28 }} />
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={e => {
                  if (l.href.startsWith('#')) { e.preventDefault(); smoothScroll(l.href); }
                  setMenuOpen(false);
                }}
                style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 600, textDecoration: 'none', padding: '12px 0' }}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={e => { e.preventDefault(); smoothScroll('#pricing'); setMenuOpen(false); }}
              style={{
                marginTop: 24, backgroundColor: '#D4A017', color: '#0F0F0F', fontWeight: 700,
                padding: '14px 24px', borderRadius: 12, fontSize: 16, textDecoration: 'none', textAlign: 'center',
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .gs-desktop-nav { display: none !important; } .gs-mobile-nav { display: block !important; } }
        @media (min-width: 769px) { .gs-desktop-nav { display: flex !important; } .gs-mobile-nav { display: none !important; } }
        a:focus-visible { outline: 2px solid #D4A017; outline-offset: 2px; }
        button:focus-visible { outline: 2px solid #D4A017; outline-offset: 2px; }
      `}</style>
    </>
  );
}