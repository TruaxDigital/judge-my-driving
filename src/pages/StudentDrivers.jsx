import React, { useEffect, useRef, useState } from 'react';
import SDNav from '@/components/studentdrivers/SDNav';
import SDHero from '@/components/studentdrivers/SDHero';
import SDStats from '@/components/studentdrivers/SDStats';
import SDHowItWorks from '@/components/studentdrivers/SDHowItWorks';
import SDPsychology from '@/components/studentdrivers/SDPsychology';
import SDDesignGallery from '@/components/studentdrivers/SDDesignGallery';
import SDTestimonials from '@/components/studentdrivers/SDTestimonials';
import SDPricing from '@/components/studentdrivers/SDPricing';
import SDFAQ from '@/components/studentdrivers/SDFAQ';
import SDFinalCTA from '@/components/studentdrivers/SDFinalCTA';
import SDFooter from '@/components/studentdrivers/SDFooter';
import SDMobileBar from '@/components/studentdrivers/SDMobileBar';

function ScrollReveal({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('sd-visible'); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="sd-reveal">{children}</div>;
}

export default function StudentDrivers() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [pricingVisible, setPricingVisible] = useState(false);
  const heroRef = useRef(null);
  const pricingRef = useRef(null);

  useEffect(() => {
    const heroObs = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.1 }
    );
    const pricingObs = new IntersectionObserver(
      ([entry]) => setPricingVisible(entry.isIntersecting), { threshold: 0.1 }
    );
    if (heroRef.current) heroObs.observe(heroRef.current);
    if (pricingRef.current) pricingObs.observe(pricingRef.current);
    return () => { heroObs.disconnect(); pricingObs.disconnect(); };
  }, []);

  return (
    <div style={{ backgroundColor: '#0F0F0F', color: '#FFFFFF', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .sd-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .sd-reveal.sd-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .sd-reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      <SDNav />
      <div ref={heroRef}><SDHero /></div>
      <ScrollReveal><SDStats /></ScrollReveal>
      <ScrollReveal><SDHowItWorks /></ScrollReveal>
      <ScrollReveal><SDPsychology /></ScrollReveal>
      <ScrollReveal><SDDesignGallery /></ScrollReveal>
      <ScrollReveal><SDTestimonials /></ScrollReveal>
      <ScrollReveal><div ref={pricingRef}><SDPricing /></div></ScrollReveal>
      <ScrollReveal><SDFAQ /></ScrollReveal>
      <ScrollReveal><SDFinalCTA /></ScrollReveal>
      <SDFooter />
      <SDMobileBar heroVisible={heroVisible} pricingVisible={pricingVisible} />
    </div>
  );
}