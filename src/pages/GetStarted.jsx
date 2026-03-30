import React, { useState, useEffect } from 'react';
import useSEO from '@/hooks/useSEO';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Gift, User, Users, Star, ShieldCheck, Zap, Bell } from 'lucide-react';
import { cn, isInIframe } from '@/lib/utils';
import DesignCatalogModal from '@/components/GetStarted/DesignCatalogModal';

const GITHUB_BASE = 'https://github.com/TruaxDigital/judge-my-driving/raw/d29729a262739c008d997bd793d1f8f2d5f1d08d';

const FEATURED_DESIGNS = [
{ id: 'tell_my_boss', url: `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Boss.svg`, label: "Tell My Boss" },
{ id: 'new_driver', url: `${GITHUB_BASE}/New%20Driver.%20Got%20Feedback.svg`, label: "New Driver" },
{ id: 'on_the_clock', url: `${GITHUB_BASE}/On%20the%20Clock,%20On%20the%20Record.svg`, label: "On the Clock" },
{ id: 'rate_this_driver', url: `${GITHUB_BASE}/Rate%20this%20Driver.svg`, label: "Rate This Driver" }];


const PLANS = [
{
  id: 'individual',
  name: 'Individual',
  price: 49,
  icon: User,
  description: 'Perfect for personal accountability',
  features: ['1 sticker included', 'Instant email alerts', 'Feedback map & dashboard', '1 year feedback history']
},
{
  id: 'family',
  name: 'Family',
  price: 99,
  icon: Users,
  description: 'Family gamification dashboard for multiple drivers',
  features: ['3 stickers included', 'All alert types', 'Unlimited feedback history', 'Family gamification dashboard'],
  popular: true
}];


const TRUST_ITEMS = [
{ icon: Bell, text: 'Instant email alerts every time someone rates the driver' },
{ icon: ShieldCheck, text: 'Anonymous for the reviewer, transparent for you' },
{ icon: Zap, text: 'Ships in 3–5 days. Sticks to any vehicle. Works immediately.' }];

const AUDIENCE = [
  {
    emoji: '🧑‍🎓',
    label: 'Teen Drivers',
    body: "Your kid just got their license. You can't ride along every time. This sticker gives other drivers a way to tell you how they're doing.",
  },
  {
    emoji: '👴',
    label: 'Senior Drivers',
    body: "Tough conversation, simple solution. Get honest feedback on a parent's driving without awkward confrontations.",
  },
  {
    emoji: '🚚',
    label: 'Fleets',
    body: 'Real-time driver accountability without the cost of GPS tracking or dashcams. Live analytics, leaderboards, and reporting included. Bulk pricing available.',
  },
];


export default function GetStarted() {
  useSEO({
    title: 'Get Started with Judge My Driving | Driver Feedback Sticker',
    description: 'Sign up for Judge My Driving and get your QR-coded bumper sticker. Real-time public ratings, incident logs, and safety reports. Takes minutes to set up.',
    canonical: 'https://app.judgemydriving.com/get-started',
  });

  const urlParams = new URLSearchParams(window.location.search);
  const discountCode = urlParams.get('discount');
  const hasDiscount = discountCode === 'DRIVE20';

  const [selectedPlan, setSelectedPlan] = useState('individual');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
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
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setLoading(true);
    setError('');
    const storedRef = sessionStorage.getItem('jmd_ref_code');
    const res = await base44.functions.invoke('createCheckoutSession', {
      plan_tier: selectedPlan,
      mode: 'subscription',
      discount_code: hasDiscount ? discountCode : undefined,
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
      </div>);

  }

  return (
    <div className="min-h-screen bg-zinc-900 font-inter">
      <div className="max-w-lg mx-auto px-5 py-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <h2 className="text-primary font-extrabold text-xl tracking-tight">JUDGE MY DRIVING</h2>
        </div>

        {/* Hero */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Know how they're driving <span className="text-primary">before something goes wrong</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Real-time feedback from other drivers, delivered straight to your inbox. For teen drivers, senior drivers, fleets, and anyone who wants accountability on the road.
          </p>
        </div>

        {/* Sticker Previews */}
        <div className="mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-3">CHOOSE FROM 15+ DESIGNS</p>
          <div className="grid grid-cols-4 gap-2">
            {FEATURED_DESIGNS.map((d) =>
            <button key={d.id} type="button" onClick={() => setLightbox({ src: d.url, alt: d.label })} className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 text-left hover:border-primary/50 transition-colors cursor-zoom-in">
                <img
                src={d.url}
                alt={d.label}
                className="w-full h-16 object-cover"
                onError={(e) => {e.target.style.display = 'none';}} />
                <p className="text-zinc-400 text-[9px] text-center py-1 px-1 leading-tight">{d.label}</p>
              </button>
            )}
          </div>
          <button
            onClick={() => setCatalogOpen(true)}
            className="mt-3 w-full text-center text-xs text-primary underline underline-offset-2"
          >
            See all designs →
          </button>
        </div>

        <DesignCatalogModal open={catalogOpen} onClose={() => setCatalogOpen(false)} />
        {lightbox && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <img src={lightbox.src} alt={lightbox.alt} className="max-w-full max-h-[90vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          </div>
        )}

        {/* Trust signals */}
        <div className="flex flex-col gap-2 mb-8">
          {TRUST_ITEMS.map(({ icon: Icon, text }) =>
          <div key={text} className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <p className="text-zinc-300 text-sm">{text}</p>
            </div>
          )}
        </div>

        {/* Audience Section */}
        <div className="mb-8 space-y-3">
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center">Who it's for</p>
          {AUDIENCE.map(({ emoji, label, body }) => (
            <div key={label} className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl shrink-0">{emoji}</span>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Label */}
        <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-3">Simple Annual Pricing</p>

        {/* Discount Banner */}
        {hasDiscount &&
        <div className="bg-primary/15 border border-primary/40 rounded-2xl p-4 flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">You've unlocked 20% off!</p>
              <p className="text-zinc-400 text-xs mt-0.5">Discount applied automatically at checkout.</p>
            </div>
          </div>
        }

        {/* Plan Selector */}
        <div className="space-y-3 mb-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const displayPrice = hasDiscount ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  'w-full text-left rounded-2xl border-2 p-5 transition-all',
                  isSelected ?
                  'border-primary bg-primary/10' :
                  'border-zinc-700 bg-zinc-800/60 hover:border-zinc-500'
                )}>
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center',
                      isSelected ? 'border-primary bg-primary' : 'border-zinc-600'
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold">{plan.name}</span>
                        {plan.popular &&
                        <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs px-2 py-0">
                            <Star className="w-2.5 h-2.5 mr-1" />Most Popular
                          </Badge>
                        }
                      </div>
                      <p className="text-zinc-400 text-xs mt-0.5">{plan.description}</p>
                      <ul className="mt-2 space-y-1">
                        {plan.features.map((f) =>
                        <li key={f} className="flex items-center gap-1.5 text-xs text-zinc-300">
                            <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                            {f}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {hasDiscount &&
                    <p className="text-zinc-500 text-xs line-through">${plan.price}/yr</p>
                    }
                    <p className="text-white font-extrabold text-xl">${displayPrice}</p>
                    <p className="text-zinc-400 text-xs">/yr</p>
                  </div>
                </div>
              </button>);

          })}
        </div>

        {/* Fleet note */}
        <p className="text-center text-zinc-500 text-xs mb-6">
          Need a fleet plan?{' '}
          <a href="/Pricing" className="text-primary underline">View all plans →</a>
        </p>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <Button
          onClick={handleContinue}
          className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-zinc-900 text-base"
          disabled={loading}>
          
          {loading ?
          <Loader2 className="w-4 h-4 animate-spin" /> :
          !isAuthed ?
          'Create Account & Subscribe' :
          hasDiscount ?
          '🎉 Subscribe with 20% Off' :
          'Subscribe Now →'}
        </Button>

        {!isAuthed && (
          <p className="text-center text-zinc-500 text-sm mt-3">
            New here? You'll create your account on the next screen.{' '}
            Already have one?{' '}
            <button className="text-primary underline" onClick={() => base44.auth.redirectToLogin('/Pricing')}>
              Sign in
            </button>
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
    </div>);

}