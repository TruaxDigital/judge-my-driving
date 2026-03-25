import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Gift, User, Users, Star } from 'lucide-react';
import { cn, isInIframe } from '@/lib/utils';

const PLANS = [
  {
    id: 'individual',
    name: 'Individual',
    price: 49,
    icon: User,
    description: 'Perfect for personal accountability',
    features: ['1 sticker included', 'Instant email alerts', 'Feedback map & dashboard', '1 year feedback history'],
  },
  {
    id: 'family',
    name: 'Family',
    price: 99,
    icon: Users,
    description: 'Great for households with multiple drivers',
    features: ['3 stickers included', 'All alert types', 'Unlimited feedback history', 'Personal dashboard'],
    popular: true,
  },
];

export default function GetStarted() {
  const urlParams = new URLSearchParams(window.location.search);
  const discountCode = urlParams.get('discount');
  const hasDiscount = discountCode === 'DRIVE20';

  const [selectedPlan, setSelectedPlan] = useState('individual');
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
      // Redirect to login, then come back here
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (isInIframe()) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('createCheckoutSession', {
      plan_tier: selectedPlan,
      mode: 'subscription',
      discount_code: hasDiscount ? discountCode : undefined,
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
        <div className="text-center mb-8">
          <h2 className="text-primary font-extrabold text-xl tracking-tight">JUDGE MY DRIVING</h2>
        </div>

        {/* Discount Banner */}
        {hasDiscount && (
          <div className="bg-primary/15 border border-primary/40 rounded-2xl p-4 flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">You've unlocked 20% off!</p>
              <p className="text-zinc-400 text-xs mt-0.5">Thanks for leaving feedback. Your discount will be automatically applied at checkout.</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">Get your own sticker</h1>
            <p className="text-zinc-400 text-sm">
              Pick a plan, create your account, and we'll ship your sticker.
            </p>
          </div>

          {/* Plan Selector */}
          <div className="space-y-3">
            {PLANS.map(plan => {
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
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-500'
                  )}
                >
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
                          {plan.popular && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs px-2 py-0">
                              <Star className="w-2.5 h-2.5 mr-1" />Most Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-zinc-400 text-xs mt-0.5">{plan.description}</p>
                        <ul className="mt-2 space-y-1">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-center gap-1.5 text-xs text-zinc-300">
                              <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {hasDiscount && (
                        <p className="text-zinc-500 text-xs line-through">${plan.price}/yr</p>
                      )}
                      <p className="text-white font-extrabold text-xl">${displayPrice}</p>
                      <p className="text-zinc-400 text-xs">/yr</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Need fleet plans note */}
          <p className="text-center text-zinc-500 text-xs">
            Need a fleet plan?{' '}
            <a href="/Pricing" className="text-primary underline">View all plans →</a>
          </p>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button
            onClick={handleContinue}
            className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-zinc-900 text-base"
            disabled={loading}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : !isAuthed
                ? 'Create Account & Subscribe'
                : hasDiscount
                  ? '🎉 Subscribe with 20% Off'
                  : 'Subscribe Now'}
          </Button>

          {!isAuthed && (
            <p className="text-center text-zinc-500 text-sm">
              Already have an account?{' '}
              <button
                className="text-primary underline"
                onClick={() => base44.auth.redirectToLogin('/Pricing')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <div className="text-center mt-10 pt-6 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Judge My Driving. Privacy-first feedback.</p>
        </div>
      </div>
    </div>
  );
}