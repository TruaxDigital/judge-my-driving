import React, { useEffect, useRef, useState } from 'react';
import useSEO from '@/hooks/useSEO';
import useStructuredData from '@/hooks/useStructuredData';
import SRNav from '@/components/seniordrivers/SRNav';
import SRHero from '@/components/seniordrivers/SRHero';
import SRStats from '@/components/seniordrivers/SRStats';
import SRHowItWorks from '@/components/seniordrivers/SRHowItWorks';
import SRDignity from '@/components/seniordrivers/SRDignity';
import SRDesignGallery from '@/components/seniordrivers/SRDesignGallery';
import SRTestimonials from '@/components/seniordrivers/SRTestimonials';
import SRPricing from '@/components/seniordrivers/SRPricing';
import SRFAQ from '@/components/seniordrivers/SRFAQ';
import SRFinalCTA from '@/components/seniordrivers/SRFinalCTA';
import SRFooter from '@/components/seniordrivers/SRFooter';
import SRMobileBar from '@/components/seniordrivers/SRMobileBar';

function ScrollReveal({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('sr-visible'); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="sr-reveal">{children}</div>;
}

export default function SeniorDrivers() {
  useSEO({
    title: 'Senior Driver Safety Stickers | Monitor Aging Parent Driving | Judge My Driving',
    description: 'Know how your aging parent is driving without GPS or surveillance. Real-time public ratings sent to your inbox. No app, no tracker. $49/year with a 30-day guarantee.',
    canonical: 'https://app.judgemydriving.com/senior-drivers',
  });
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How do I monitor my elderly parent\'s driving without invading their privacy?', acceptedAnswer: { '@type': 'Answer', text: 'A QR bumper sticker lets other drivers on the road submit anonymous ratings. You get real-time email alerts. No GPS, no camera, no app on their phone.' } },
      { '@type': 'Question', name: 'Will my parent feel spied on?', acceptedAnswer: { '@type': 'Answer', text: 'No tracker, no app, no GPS. The rating reflects what the public already sees on the road. The sticker is visible and the mechanic is transparent.' } },
      { '@type': 'Question', name: 'Can I share the dashboard with siblings?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Family plan includes a shared dashboard so multiple caregivers can monitor the same driver together.' } },
      { '@type': 'Question', name: 'How much does the senior driver sticker cost?', acceptedAnswer: { '@type': 'Answer', text: 'The Individual plan is $49/year. The Family plan covers up to three drivers for $99/year. Both include a 30-day money-back guarantee.' } },
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
        .sr-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .sr-reveal.sr-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .sr-reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      <SRNav />
      <div ref={heroRef}><SRHero /></div>
      <ScrollReveal><SRStats /></ScrollReveal>
      <ScrollReveal><SRHowItWorks /></ScrollReveal>
      <ScrollReveal><SRDignity /></ScrollReveal>
      <ScrollReveal><SRDesignGallery /></ScrollReveal>
      <ScrollReveal><SRTestimonials /></ScrollReveal>
      <ScrollReveal><div ref={pricingRef}><SRPricing /></div></ScrollReveal>
      <ScrollReveal><SRFAQ /></ScrollReveal>
      <ScrollReveal><SRFinalCTA /></ScrollReveal>
      <SRFooter />
      <SRMobileBar heroVisible={heroVisible} pricingVisible={pricingVisible} />
    </div>
  );
}