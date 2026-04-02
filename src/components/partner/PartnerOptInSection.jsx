import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { GitMerge, Loader2, CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

function CopyText({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded text-muted-foreground hover:text-primary transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function PartnerOptInSection({ user, partner }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [payout_method, setPayoutMethod] = useState('');
  const [payout_details, setPayoutDetails] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPayout, setEditingPayout] = useState(false);
  const [newPayoutDetails, setNewPayoutDetails] = useState('');
  const [savingPayout, setSavingPayout] = useState(false);

  const isPartner = user?.is_partner;

  const payoutPlaceholder = {
    venmo: '@your-venmo-handle',
    paypal: 'your@paypal.email',
    eft: 'Routing #123456789 / Account #987654321',
  }[payout_method] || 'Payout details';

  const handleOptIn = async () => {
    if (!payout_method || !payout_details || !agreed) {
      toast.error('Please complete all fields and agree to the terms.');
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke('inAppPartnerOptIn', { payout_method, payout_details });
    if (res.data?.success) {
      await base44.auth.updateMe({ is_partner: true });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['my-partner'] });
      toast.success('Welcome to the Partner Program!');
      setShowForm(false);
    } else {
      toast.error(res.data?.error || 'Something went wrong.');
    }
    setLoading(false);
  };

  const handleSavePayout = async () => {
    if (!newPayoutDetails) return;
    setSavingPayout(true);
    await base44.auth.updateMe({ payout_details: newPayoutDetails });
    if (partner) {
      await base44.entities.ReferralPartner.update(partner.id, { payout_details: newPayoutDetails });
    }
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['my-partner'] });
    toast.success('Payout details updated.');
    setEditingPayout(false);
    setSavingPayout(false);
  };

  if (isPartner) {
    const refCode = partner?.ref_code || '';
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-primary" /> Partner Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-green-600">Active</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Your ref code</span>
              <div className="flex items-center gap-1 font-mono font-semibold text-foreground">
                {refCode}
                <CopyText text={refCode} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Consumer commission</span>
              <span className="font-medium">$10 / Individual or Family signup</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fleet commission</span>
              <span className="font-medium">$100 / Fleet deal (90-day hold)</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Payout method</span>
              <div className="text-right">
                {editingPayout ? (
                  <div className="flex gap-2 items-center">
                    <Input value={newPayoutDetails} onChange={e => setNewPayoutDetails(e.target.value)} className="h-8 text-sm w-40" />
                    <Button size="sm" className="h-8 text-xs" onClick={handleSavePayout} disabled={savingPayout}>
                      {savingPayout ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditingPayout(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="capitalize font-medium">{user?.payout_method || partner?.payout_method || '—'}</span>
                    <span className="text-muted-foreground">{user?.payout_details || partner?.payout_details || ''}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setNewPayoutDetails(user?.payout_details || partner?.payout_details || ''); setEditingPayout(true); }}>Edit</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/PartnerPortal">
            <Button variant="outline" className="rounded-xl">
              <ExternalLink className="w-4 h-4 mr-2" /> Go to Partner Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitMerge className="w-5 h-5" /> Partner Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showForm ? (
          <>
            <h3 className="font-bold text-lg text-foreground">Refer Drivers. Earn Cash.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share Judge My Driving with other drivers and fleet operators. Earn <strong>$10</strong> for every Individual or Family plan signup through your referral link. Refer a fleet and earn <strong>$100</strong> when the deal closes and stays active for 90 days.
            </p>
            <p className="text-sm text-muted-foreground">Payouts are quarterly. No cost to join. No inventory. Just share your link.</p>
            <Button className="rounded-xl" onClick={() => setShowForm(true)}>
              <GitMerge className="w-4 h-4 mr-2" /> Join the Partner Program
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Complete your partner profile</p>
            <div className="space-y-2">
              <Label>Payout Method *</Label>
              <Select value={payout_method} onValueChange={setPayoutMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payout method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="eft">EFT / Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {payout_method && (
              <div className="space-y-2">
                <Label>Payout Details *</Label>
                <Input
                  placeholder={payoutPlaceholder}
                  value={payout_details}
                  onChange={e => setPayoutDetails(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="partner-terms-agree"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1 cursor-pointer"
              />
              <label htmlFor="partner-terms-agree" className="text-sm text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <a href="/partner-terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Partner Program Terms and Conditions
                </a>
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                className="rounded-xl"
                onClick={handleOptIn}
                disabled={loading || !payout_method || !payout_details || !agreed}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Activate Partner Account
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}