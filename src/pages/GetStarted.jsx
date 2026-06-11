import React, { useState, useEffect, useRef } from 'react';
import useSEO from '@/hooks/useSEO';
import useStructuredData from '@/hooks/useStructuredData';
import { base44 } from '@/api/base44Client';
import GSNav from '@/components/getstarted/GSNav';
import GSHero from '@/components/getstarted/GSHero';
import GSSocialProof from '@/components/getstarted/GSSocialProof';
import GSHowItWorks from '@/components/getstarted/GSHowItWorks';
import GSDesignGallery from '@/components/getstarted/GSDesignGallery';
import GSWhoItsFor from '@/components/getstarted/GSWhoItsFor';
import GSComparison from '@/components/getstarted/GSComparison';
import GSPricing from '@/components/getstarted/GSPricing';
import GSFAQ from '@/components/getstarted/GSFAQ';
import GSFinalCTA from '@/components/getstarted/GSFinalCTA';
import GSFoundersOffer from '@/components/getstarted/GSFoundersOffer';
import GSFooter from '@/components/getstarted/GSFooter';
import GSMobileBar from '@/components/getstarted/GSMobileBar';

function ScrollReveal({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="gs-reveal">{children}</div>;
}

export default function GetStarted() {
  useSEO({
    title: 'Judge My Driving | QR Driver Feedback Stickers for Teens, Seniors & Fleets',
    description: 'Turn your bumper into a real-time feedback tool. QR-coded stickers let anyone rate your driver instantly. Plans from $49/year. Ships free. 30-day money-back guarantee.',
    canonical: 'https://app.judgemydriving.com/get-started',
  });
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Judge My Driving QR Bumper Sticker',
    description: 'QR-coded bumper stickers that let the public rate any driver in real time. Real-time email alerts, driver dashboard, and leaderboards.',
    brand: { '@type': 'Brand', name: 'Judge My Driving' },
    url: 'https://app.judgemydriving.com/get-started',
    offers: [
      { '@type': 'Offer', name: 'Individual Plan', price: '49.00', priceCurrency: 'USD', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://app.judgemydriving.com/get-started' },
      { '@type': 'Offer', name: 'Family Plan', price: '99.00', priceCurrency: 'USD', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://app.judgemydriving.com/get-started' },
    ],

  });

  const [heroVisible, setHeroVisible] = useState(true);
  const [pricingVisible, setPricingVisible] = useState(false);
  const [checkoutOverlay, setCheckoutOverlay] = useState(false);
  const [resumeError, setResumeError] = useState(false);
  const heroRef = useRef(null);
  const pricingRef = useRef(null);

  const VALID_PLANS = ['individual', 'family', 'starter_fleet', 'professional_fleet'];

  useEffect(() => {
    const heroObs = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    const pricingObs = new IntersectionObserver(
      ([entry]) => setPricingVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (heroRef.current) heroObs.observe(heroRef.current);
    if (pricingRef.current) pricingObs.observe(pricingRef.current);
    return () => { heroObs.disconnect(); pricingObs.disconnect(); };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get('plan');

    if (!planId || !VALID_PLANS.includes(planId)) {
      if (planId) {
        // invalid value — scroll to pricing
        setTimeout(() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }), 300);
      }
      return;
    }

    // Remove plan param from URL immediately so back-button won't re-trigger
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);

    (async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        // Not logged in — just scroll to pricing
        setTimeout(() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }), 300);
        return;
      }

      // Authenticated with a valid plan — auto-resume checkout
      setCheckoutOverlay(true);
      try {
        const res = await base44.functions.invoke('createCheckoutSession', { plan_tier: planId, mode: 'subscription' });
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          throw new Error('No URL returned');
        }
      } catch {
        setCheckoutOverlay(false);
        setResumeError(true);
        setTimeout(() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    })();
  }, []);

  return (
    <div style={{ backgroundColor: '#0F0F0F', color: '#FFFFFF', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      {checkoutOverlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: '#0F0F0F',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(212,160,23,0.2)',
            borderTopColor: '#D4A017',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#D4A017', fontSize: 18, fontWeight: 600, margin: 0 }}>Taking you to secure checkout…</p>
        </div>
      )}
      <style>{`
        .gs-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .gs-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>
      <GSNav />
      <div ref={heroRef}><GSHero /></div>
      <ScrollReveal><GSSocialProof /></ScrollReveal>
      <ScrollReveal><GSHowItWorks /></ScrollReveal>
      <ScrollReveal><GSDesignGallery /></ScrollReveal>
      <ScrollReveal><GSWhoItsFor /></ScrollReveal>
      <ScrollReveal><GSComparison /></ScrollReveal>
      <ScrollReveal><GSFoundersOffer /></ScrollReveal>
      <ScrollReveal>
        <div ref={pricingRef} id="pricing">
          {resumeError && (
            <p style={{
              textAlign: 'center', color: '#D4A017', fontSize: 14,
              backgroundColor: 'rgba(212,160,23,0.08)',
              border: '1px solid rgba(212,160,23,0.2)',
              borderRadius: 8, padding: '10px 20px', margin: '0 24px',
            }}>
              Almost there. Pick your plan below to finish checkout.
            </p>
          )}
          <GSPricing />
        </div>
      </ScrollReveal>
      <ScrollReveal><GSFAQ /></ScrollReveal>
      <ScrollReveal><GSFinalCTA /></ScrollReveal>
      <GSFooter />
      <GSMobileBar heroVisible={heroVisible} pricingVisible={pricingVisible} />
    </div>
  );
}