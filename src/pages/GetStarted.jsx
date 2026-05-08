import React, { useState, useEffect, useRef } from 'react';
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
      <GSNav />
      <div ref={heroRef}><GSHero /></div>
      <GSSocialProof />
      <GSHowItWorks />
      <GSDesignGallery />
      <GSWhoItsFor />
      <GSComparison />
      <GSTestimonials />
      <div ref={pricingRef} id="pricing"><GSPricing /></div>
      <GSFAQ />
      <GSFinalCTA />
      <GSFooter />
      <GSMobileBar heroVisible={heroVisible} pricingVisible={pricingVisible} />
    </div>
  );
}