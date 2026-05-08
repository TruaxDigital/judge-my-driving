import React, { useState, useEffect, useRef, useCallback } from 'react';
import GSNav from '@/components/getstarted/GSNav';
import GSHero from '@/components/getstarted/GSHero';
import GSSocialProof from '@/components/getstarted/GSSocialProof';
import GSHowItWorks from '@/components/getstarted/GSHowItWorks';
import GSDesignGallery from '@/components/getstarted/GSDesignGallery';
import GSWhoItsFor from '@/components/getstarted/GSWhoItsFor';
import GSComparison from '@/components/getstarted/GSComparison';
import GSTestimonials from '@/components/getstarted/GSTestimonials';
import GSPricing from '@/components/getstarted/GSPricing';
import GSFAQ from '@/components/getstarted/GSFAQ';
import GSFinalCTA from '@/components/getstarted/GSFinalCTA';
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
  const [heroVisible, setHeroVisible] = useState(true);
  const [pricingVisible, setPricingVisible] = useState(false);
  const heroRef = useRef(null);
  const pricingRef = useRef(null);

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

  return (
    <div style={{ backgroundColor: '#0F0F0F', color: '#FFFFFF', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
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
      <ScrollReveal><GSTestimonials /></ScrollReveal>
      <ScrollReveal><div ref={pricingRef} id="pricing"><GSPricing /></div></ScrollReveal>
      <ScrollReveal><GSFAQ /></ScrollReveal>
      <ScrollReveal><GSFinalCTA /></ScrollReveal>
      <GSFooter />
      <GSMobileBar heroVisible={heroVisible} pricingVisible={pricingVisible} />
    </div>
  );
}