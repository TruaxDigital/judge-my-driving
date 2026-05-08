import React, { useEffect, useRef, useState } from 'react';
import useSEO from '@/hooks/useSEO';
import useStructuredData from '@/hooks/useStructuredData';
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
  useSEO({
    title: 'Teen Driver Safety Stickers | Real-Time Feedback for New Drivers | Judge My Driving',
    description: 'Give parents peace of mind the moment their teen hits the road. QR bumper stickers let other drivers send real-time ratings and comments straight to your inbox. $49/year.',
    canonical: 'https://app.judgemydriving.com/student-drivers',
  });
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How does the teen driver sticker work?', acceptedAnswer: { '@type': 'Answer', text: 'A QR code on the bumper sticker lets any driver scan and rate your teen in real time. You get an email alert for every rating with a timestamp and rough location.' } },
      { '@type': 'Question', name: 'Will my teen know they are being rated?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — the sticker is visible on the bumper. Reviewers are anonymous, but your teen knows feedback may come in. That visibility itself improves behavior.' } },
      { '@type': 'Question', name: 'How much does it cost?', acceptedAnswer: { '@type': 'Answer', text: 'Individual plan is $49/year for one sticker. Family plan is $99/year for three stickers. Both include a 30-day money-back guarantee.' } },
      { '@type': 'Question', name: 'Is there an app my teen needs to install?', acceptedAnswer: { '@type': 'Answer', text: 'No app required. The QR code opens a mobile-optimized web page. No downloads, no accounts needed for the reviewer.' } },
    ],
  });

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
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .sd-reveal.sd-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .sd-reveal-delay-1 { transition-delay: 0.1s; }
        .sd-reveal-delay-2 { transition-delay: 0.2s; }
        .sd-reveal-delay-3 { transition-delay: 0.3s; }
        @media (prefers-reduced-motion: reduce) {
          .sd-reveal, .sd-reveal-delay-1, .sd-reveal-delay-2, .sd-reveal-delay-3 { opacity: 1; transform: none; transition: none; }
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