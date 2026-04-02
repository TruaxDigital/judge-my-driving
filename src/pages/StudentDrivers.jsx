import React, { useState, useEffect } from 'react';
import useSEO from '@/hooks/useSEO';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Star, Bell, ShieldCheck, Zap } from 'lucide-react';
import { cn, isInIframe } from '@/lib/utils';
import { DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';
import DesignCatalogModal from '@/components/GetStarted/DesignCatalogModal';

const FEATURED_DESIGNS = [
  { id: 'new_driver', label: "New Driver" },
  { id: 'student_driver', label: "Student Driver" },
  { id: 'tell_my_mom', label: "Tell My Mom" },
  { id: 'tell_my_dad', label: "Tell My Dad" },
  { id: 'go_easy_new', label: "Go Easy, I'm New" },
  { id: 'tell_my_kids', label: "Tell My Kids" },
];

const PLANS = [
  {
    id: 'individual',
    name: 'Individual',
    price: 49,
    features: ['1 sticker included', 'Real-time email alerts', 'Feedback map & dashboard', '1 year history'],
  },
  {
    id: 'family',
    name: 'Family',
    price: 99,
    features: ['3 stickers included', 'All alert types', 'Unlimited feedback history', 'Family dashboard'],
    popular: true,
  },
];

const STATS = [
  { number: '3x', label: 'higher fatal crash risk for 16–19 year-olds vs. drivers 20+', source: 'IIHS, 2023' },
  { number: '6M+', label: 'teen driver crashes per year in the U.S.', source: 'NHTSA, 2023' },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Get your sticker', body: 'Pick a design. Ships to your door.' },
  { step: 2, title: 'Stick it on the car', body: '10 seconds. No hardware, no app, no wiring.' },
  { step: 3, title: 'Know how they drive when you\'re not there', body: 'Other drivers rate your teen. You get alerts by email, in real time.' },
];

export default function StudentDrivers() {
  useSEO({
    title: 'Teen Driver Safety Sticker | Monitor New Drivers | JMD',
    description: "Put a Judge My Driving sticker on your teen's car and get real-time public feedback on their driving. Build accountability from day one. Starts at $49/year.",
    canonical: 'https://app.judgemydriving.com/student-drivers',
  });

  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  const [partnerName, setPartnerName] = useState('');

  useEffect(() => {
    if (refCode) {
      sessionStorage.setItem('jmd_ref_code', refCode);
      base44.functions.invoke('getPartnerByRefCode', { ref_code: refCode })
        .then(res => { if (res.data?.partner?.partner_name) setPartnerName(res.data.partner.partner_name); })
        .catch(() => {});
    }
  }, [refCode]);

  const [selectedPlan, setSelectedPlan] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      setIsAuthed(authed);
      setCheckingAuth(false);
    });
  }, []);

  const handleContinue = async () => {
    if (!isAuthed) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (isInIframe()) {
      alert('Checkout is only available from the published app.');
      return;
    }
    setLoading(true);
    setError('');
    const storedRef = sessionStorage.getItem('jmd_ref_code') || refCode;
    const res = await base44.functions.invoke('createCheckoutSession', {
      plan_tier: selectedPlan,
      mode: 'subscription',
      ref_code: storedRef || undefined,
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setError(res.data?.error || 'Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 font-inter">
      <div className="max-w-lg mx-auto px-5 py-10">

        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
            alt="Judge My Driving"
            className="h-28 w-auto mx-auto"
          />
          {refCode && (
            <p className="text-primary text-sm font-semibold mt-3">
              Referred by {partnerName || 'a partner'}
            </p>
          )}
        </div>

        {/* Hero */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            You Can't Ride Shotgun Forever.{' '}
            <span className="text-primary">But You Can Still Know.</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Other drivers scan a QR sticker on your teen's car and rate how they drive. You get the feedback. They drive knowing someone's watching.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {STATS.map(s => (
            <div key={s.number} className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-4 text-center">
              <p className="text-3xl font-extrabold text-primary">{s.number}</p>
              <p className="text-zinc-300 text-xs mt-1 leading-tight">{s.label}</p>
              <p className="text-zinc-600 text-xs mt-1">{s.source}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-4">How it works</p>
          <div className="space-y-3">
            {HOW_IT_WORKS.map(h => (
              <div key={h.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">{h.step}</div>
                <div>
                  <p className="text-white font-semibold text-sm">{h.title}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-col gap-2 mb-8">
          {[
            { icon: Bell, text: 'Instant email alerts every time someone rates the driver' },
            { icon: ShieldCheck, text: 'Anonymous for the reviewer, transparent for you' },
            { icon: Zap, text: 'Ships in 3–5 days. Works immediately.' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <p className="text-zinc-300 text-sm">{text}</p>
            </div>
          ))}
        </div>

        {/* Sticker previews */}
        <div className="mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-3">Choose from 15+ designs</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {FEATURED_DESIGNS.map(d => (
              <button key={d.id} type="button" onClick={() => setLightbox({ src: DESIGN_URLS[d.id], alt: d.label })} className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 text-left hover:border-primary/50 transition-colors cursor-zoom-in">
                <img src={DESIGN_URLS[d.id]} alt={d.label} className="w-full h-16 object-cover" onError={e => e.target.style.display = 'none'} />
                <p className="text-zinc-400 text-[9px] text-center py-1 px-1 leading-tight">{d.label}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setShowDesignModal(true)} className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline w-full">
            See all designs →
          </button>
        </div>
        <DesignCatalogModal open={showDesignModal} onClose={() => setShowDesignModal(false)} />
        {lightbox && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <img src={lightbox.src} alt={lightbox.alt} className="max-w-full max-h-[90vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          </div>
        )}

        {/* Plan selector */}
        <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-3">Less than $1/week</p>
        <p className="text-center text-zinc-400 text-sm mb-4">Plans start at $49/year. 30-day money-back guarantee.</p>

        <div className="space-y-3 mb-6">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'w-full text-left rounded-2xl border-2 p-5 transition-all',
                selectedPlan === plan.id ? 'border-primary bg-primary/10' : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-500'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={cn('w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center', selectedPlan === plan.id ? 'border-primary bg-primary' : 'border-zinc-600')}>
                    {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{plan.name}</span>
                      {plan.popular && <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs px-2 py-0"><Star className="w-2.5 h-2.5 mr-1" />Popular</Badge>}
                    </div>
                    <ul className="mt-2 space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <CheckCircle className="w-3 h-3 text-primary shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-extrabold text-xl">${plan.price}</p>
                  <p className="text-zinc-400 text-xs">/yr</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-zinc-400 text-xs mb-4 italic">Real feedback from real drivers. Delivered to you.</p>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <Button
          onClick={handleContinue}
          className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-zinc-900 text-base"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : !isAuthed ? 'Create Account & Subscribe →' : 'Subscribe Now →'}
        </Button>

        {!isAuthed && (
          <p className="text-center text-zinc-500 text-sm mt-3">
            New here? You'll create your account on the next screen.{' '}
            Already have one?{' '}
            <button className="text-primary underline" onClick={() => base44.auth.redirectToLogin(window.location.href)}>Sign in</button>
          </p>
        )}

        <div className="text-center mt-10 pt-6 border-t border-zinc-800 space-y-1">
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Judge My Driving. Privacy-first feedback.</p>
          <p className="text-zinc-700 text-xs">
            <a href="/terms-of-service" className="hover:text-zinc-500 transition-colors">Terms of Service</a>
            {' | '}
            <a href="/privacy" className="hover:text-zinc-500 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}