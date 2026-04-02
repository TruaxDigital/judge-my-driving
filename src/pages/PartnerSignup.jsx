import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CHANNEL_OPTIONS = [
  { value: 'driving_school', label: 'Driving School' },
  { value: 'pta', label: 'PTA / Parent Organization' },
  { value: 'insurance', label: 'Insurance Agency' },
  { value: 'dealership', label: 'Dealership' },
  { value: 'event', label: 'Event / Conference' },
  { value: 'influencer', label: 'Content Creator / Influencer' },
  { value: 'other', label: 'Other' },
];

const PAYOUT_OPTIONS = [
  { value: 'venmo', label: 'Venmo', detailLabel: 'Venmo username' },
  { value: 'paypal', label: 'PayPal', detailLabel: 'PayPal email' },
  { value: 'eft', label: 'EFT (Bank Transfer)', detailLabel: 'Bank routing and account number' },
];

export default function PartnerSignup() {
  const [step, setStep] = useState(1); // 1=form, 2=done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    partner_name: '',
    channel_type: '',
    location: '',
    payout_method: 'venmo',
    payout_details: '',
  });

  const payoutOption = PAYOUT_OPTIONS.find(p => p.value === form.payout_method);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await base44.functions.invoke('partnerSignup', {
        partner_name: form.partner_name,
        channel_type: form.channel_type,
        location: form.location,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        payout_method: form.payout_method,
        payout_details: form.payout_details,
      });

      if (!res.data?.success) {
        setError(res.data?.error || 'Failed to create partner profile.');
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep(2);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-zinc-900 font-inter flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Thank you for joining us as a referral partner!</h1>
            <p className="text-zinc-400 mt-3 text-sm leading-relaxed">
              Check your inbox — we've sent your welcome email with your referral code and links.
            </p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 text-sm text-zinc-400 text-left space-y-3">
            <p className="font-semibold text-zinc-200">Next steps:</p>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-primary/20 text-primary rounded-full text-xs font-bold shrink-0">1</span>
              <p>Check your inbox for your welcome email with your referral code and QR codes.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-primary/20 text-primary rounded-full text-xs font-bold shrink-0">2</span>
              <p>Create your account using <strong className="text-zinc-300">{form.contact_email}</strong> — look for an invitation email from Judge My Driving.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-primary/20 text-primary rounded-full text-xs font-bold shrink-0">3</span>
              <p>Log in to your Partner Dashboard to track conversions and earnings.</p>
            </div>
          </div>
          <p className="text-zinc-600 text-xs">Questions? <a href="mailto:hello@judgemydriving.com" className="text-zinc-400 hover:text-primary transition-colors">hello@judgemydriving.com</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 font-inter">
      <div className="max-w-lg mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
            alt="Judge My Driving"
            className="h-28 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-extrabold text-white mt-2">Sign Up as a Referral Partner</h1>
          <p className="text-zinc-400 text-sm mt-2">Earn $10 for every individual or family plan signup through your link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Contact Name *</Label>
            <Input
              required
              placeholder="Your full name"
              value={form.contact_name}
              onChange={e => handleChange('contact_name', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Contact Email * (this becomes your login)</Label>
            <Input
              required
              type="email"
              placeholder="you@example.com"
              value={form.contact_email}
              onChange={e => handleChange('contact_email', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Contact Phone</Label>
            <Input
              placeholder="(optional)"
              value={form.contact_phone}
              onChange={e => handleChange('contact_phone', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Partner / Business Name *</Label>
            <Input
              required
              placeholder="e.g. ABC Driving School"
              value={form.partner_name}
              onChange={e => handleChange('partner_name', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Channel Type *</Label>
            <select
              required
              value={form.channel_type}
              onChange={e => handleChange('channel_type', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select type...</option>
              {CHANNEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Location (city or area)</Label>
            <Input
              placeholder="e.g. Arlington, VA"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Payout Method *</Label>
            <div className="flex gap-2">
              {PAYOUT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleChange('payout_method', o.value)}
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-sm font-medium transition-all',
                    form.payout_method === o.value
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {payoutOption && (
            <div className="space-y-1">
              <Label className="text-zinc-300 text-sm">{payoutOption.detailLabel}</Label>
              <Input
                placeholder={payoutOption.detailLabel}
                value={form.payout_details}
                onChange={e => handleChange('payout_details', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-zinc-900 text-base"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Partner Account →'}
          </Button>

          <p className="text-center text-zinc-500 text-sm">
            Already have an account?{' '}
            <button className="text-primary underline" onClick={() => base44.auth.redirectToLogin('/PartnerPortal')}>
              Sign in
            </button>
          </p>
        </form>

        <div className="text-center mt-10 pt-6 border-t border-zinc-800 space-y-1">
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Judge My Driving. Questions? hello@judgemydriving.com</p>
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