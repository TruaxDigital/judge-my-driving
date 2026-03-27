import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Truck, User, Users, Star, Mail } from 'lucide-react';
import { cn, isInIframe } from '@/lib/utils';

const PLANS = [
  {
    id: 'individual',
    name: 'Individual',
    price: 49,
    stickers: 1,
    addonPrice: null,
    icon: User,
    description: 'Perfect for personal accountability',
    features: ['1 sticker included', 'Instant + daily email alerts', 'Feedback map view', '1 year feedback history', 'Personal dashboard'],
    color: 'border-border',
  },
  {
    id: 'family',
    name: 'Family',
    price: 99,
    stickers: 3,
    addonPrice: 39,
    icon: Users,
    description: 'One account, multiple drivers',
    features: ['3 stickers included', 'Instant + daily + weekly alerts', 'Feedback map view', 'Unlimited feedback history', 'Personal dashboard'],
    popular: true,
    color: 'border-primary',
  },
  {
    id: 'starter_fleet',
    name: 'Starter Fleet',
    price: 999,
    stickers: 10,
    addonPrice: 89,
    icon: Truck,
    description: 'Built for small fleets and local businesses',
    features: ['10 stickers included', 'Fleet dashboard', 'Driver leaderboard', 'Safety incident log', 'Email support', '1 admin seat'],
    color: 'border-border',
    fleet: true,
  },
  {
    id: 'professional_fleet',
    name: 'Professional Fleet',
    price: 1999,
    stickers: 25,
    addonPrice: 79,
    icon: Truck,
    description: 'Full fleet intelligence and insurance documentation',
    features: ['25 stickers included', 'Everything in Starter Fleet', 'Corrective action tracking', 'Insurance-ready safety reports (PDF)', 'Custom sticker branding', 'Priority email support', '3 admin seats'],
    popular: true,
    fleet: true,
    color: 'border-primary',
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [contactSent, setContactSent] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    enabled: isAuthed,
  });

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthed);
  }, []);

  const handleSubscribe = async (planId) => {
    if (!isAuthed) {
      base44.auth.redirectToLogin(`/get-started?plan=${planId}`);
      return;
    }
    if (isInIframe()) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setLoading(planId);
    const res = await base44.functions.invoke('createCheckoutSession', {
      plan_tier: planId,
      mode: 'subscription',
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert('Could not start checkout. Please try again.');
    }
    setLoading(null);
  };

  const handleEnterprise = async () => {
    await base44.integrations.Core.SendEmail({
      to: 'hello@judgemydriving.com',
      subject: 'Enterprise Fleet Inquiry',
      body: `<p>New enterprise inquiry from: ${user?.email || 'unknown'} (${user?.full_name || ''})</p>`,
    });
    setContactSent(true);
  };

  return (
    <div className="space-y-10">
      {!isAuthed && (
        <div className="flex items-center justify-between">
          <a href="/get-started" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            ← Back
          </a>
          <button
            className="text-sm text-primary underline"
            onClick={() => base44.auth.redirectToLogin('/Pricing')}
          >
            Sign in
          </button>
        </div>
      )}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Simple, transparent pricing</h1>
        <p className="text-muted-foreground text-lg">Annual billing. Cancel anytime.</p>
        {isAuthed && user?.subscription_status === 'active' && (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 border">
            You have an active subscription
          </Badge>
        )}
        {isAuthed && user?.subscription_status === 'past_due' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 max-w-md mx-auto">
            Your subscription payment failed. Please update your payment method.
          </div>
        )}
      </div>

      {/* B2C */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Personal Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {PLANS.filter(p => !p.fleet).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              loading={loading === plan.id}
              current={isAuthed && user?.plan_tier === plan.id}
              onSubscribe={handleSubscribe}
              isAuthed={isAuthed}
            />
          ))}
        </div>
      </div>

      {/* Fleet */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Fleet Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {PLANS.filter(p => p.fleet).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              loading={loading === plan.id}
              current={isAuthed && user?.plan_tier === plan.id}
              onSubscribe={handleSubscribe}
              isAuthed={isAuthed}
            />
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-6 bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Enterprise Fleet</h3>
              <Badge variant="outline">50+ vehicles</Badge>
            </div>
            <p className="text-muted-foreground">Starting at $3,499/year. Custom pricing, full custom branding, API access, phone support, unlimited admin seats.</p>
          </div>
          <div className="shrink-0">
            {contactSent ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5" /> Message sent! We'll be in touch.
              </div>
            ) : (
              <Button onClick={handleEnterprise} variant="outline" className="rounded-xl h-11 px-6">
                <Mail className="w-4 h-4 mr-2" /> Contact Sales
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Replacement note */}
      <p className="text-center text-sm text-muted-foreground">
        Need a replacement sticker? $19.00 flat fee. Manage from your Stickers page.
      </p>
    </div>
  );
}

function PlanCard({ plan, loading, current, onSubscribe, isAuthed }) {
  const Icon = plan.icon;
  return (
    <div className={cn(
      'bg-card border-2 rounded-2xl p-6 flex flex-col gap-5 relative',
      plan.color,
      plan.popular && 'shadow-lg'
    )}>
      {plan.popular && (
        <div className="absolute -top-3 left-6">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            <Star className="w-3 h-3 mr-1 inline" /> Most Popular
          </Badge>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-foreground">${plan.price.toLocaleString()}</span>
          <span className="text-muted-foreground text-sm">/yr</span>
        </div>
      </div>

      <ul className="space-y-2 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {plan.addonPrice && <p className="text-xs text-muted-foreground">Add a vehicle: ${plan.addonPrice}/yr each</p>}

      <Button
        className={cn('w-full h-11 rounded-xl font-semibold', plan.popular && 'bg-primary hover:bg-primary/90')}
        variant={plan.popular ? 'default' : 'outline'}
        disabled={loading || current}
        onClick={() => onSubscribe(plan.id)}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : current ? 'Current Plan' : !isAuthed ? 'Get Started' : 'Subscribe'}
      </Button>
    </div>
  );
}