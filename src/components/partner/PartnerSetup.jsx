import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
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

export default function PartnerSetup({ user, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({
    partner_name: '',
    channel_type: '',
    location: '',
    payout_method: 'venmo',
    payout_details: '',
  });

  // On mount, check if a partner record already exists (e.g. signed up via public form)
  useEffect(() => {
    base44.functions.invoke('getMyPartnerRecord', {}).then(res => {
      if (res.data?.partner) {
        // Already has a record — ensure is_partner is set and complete
        base44.auth.updateMe({ is_partner: true }).then(() => onComplete());
      } else {
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, []);

  const payoutOption = PAYOUT_OPTIONS.find(p => p.value === form.payout_method);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if a partner record already exists for this user (e.g. signed up via public form)
    const existing = await base44.functions.invoke('getMyPartnerRecord', {});
    if (existing.data?.partner) {
      // Already exists — just update payout info and mark as partner
      await base44.auth.updateMe({
        is_partner: true,
        payout_method: form.payout_method || existing.data.partner.payout_method,
        payout_details: form.payout_details || existing.data.partner.payout_details,
      });
      setLoading(false);
      onComplete();
      return;
    }

    const res = await base44.functions.invoke('partnerSignup', {
      user_id: user.id,
      partner_name: form.partner_name,
      channel_type: form.channel_type,
      location: form.location,
      contact_name: user.full_name,
      contact_email: user.email,
      payout_method: form.payout_method,
      payout_details: form.payout_details,
    });

    setLoading(false);

    if (!res.data?.success) {
      setError(res.data?.error || 'Failed to create partner profile.');
      return;
    }

    await base44.auth.updateMe({
      is_partner: true,
      payout_method: form.payout_method,
      payout_details: form.payout_details,
    });

    onComplete();
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Finish Setting Up Your Partner Profile</h1>
          <p className="text-muted-foreground text-sm mt-2">We need a few more details to generate your referral code and QR codes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Partner / Business Name *</Label>
            <Input
              required
              placeholder="e.g. ABC Driving School"
              value={form.partner_name}
              onChange={e => setForm(p => ({ ...p, partner_name: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <Label>Channel Type *</Label>
            <select
              required
              value={form.channel_type}
              onChange={e => setForm(p => ({ ...p, channel_type: e.target.value }))}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select type...</option>
              {CHANNEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Location (city or area)</Label>
            <Input
              placeholder="e.g. Arlington, VA"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Payout Method</Label>
            <div className="flex gap-2">
              {PAYOUT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, payout_method: o.value }))}
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-sm font-medium transition-all',
                    form.payout_method === o.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {payoutOption && (
            <div className="space-y-1">
              <Label>{payoutOption.detailLabel}</Label>
              <Input
                placeholder={payoutOption.detailLabel}
                value={form.payout_details}
                onChange={e => setForm(p => ({ ...p, payout_details: e.target.value }))}
              />
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create My Partner Profile
          </Button>
        </form>
      </div>
    </div>
  );
}