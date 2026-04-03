import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLANS = [
  { value: 'individual', label: 'Individual', price: '$49/yr' },
  { value: 'family', label: 'Family', price: '$99/yr' },
  { value: 'starter_fleet', label: 'Starter Fleet', price: '$999/yr' },
  { value: 'professional_fleet', label: 'Professional Fleet', price: '$1,999/yr' },
];

const STATUSES = [
  { value: 'active', label: 'Active', color: 'text-green-600' },
  { value: 'past_due', label: 'Past Due', color: 'text-red-500' },
  { value: 'canceled', label: 'Canceled', color: 'text-muted-foreground' },
];

export default function ManageSubscriptionDialog({ user, open, onClose }) {
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState(user?.plan_tier || '');
  const [status, setStatus] = useState(user?.subscription_status || 'active');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await base44.functions.invoke('adminUpdateUser', {
      target_user_id: user.id,
      plan_tier: plan,
      subscription_status: status,
    });
    setSaving(false);
    if (res.data?.success) {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('Subscription updated successfully');
      onClose();
    } else {
      toast.error(res.data?.error || 'Failed to update subscription');
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            Update plan and billing status for <strong>{user?.full_name || user?.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="grid grid-cols-2 gap-2">
              {PLANS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPlan(p.value)}
                  className={cn(
                    'p-3 rounded-xl border text-left text-sm transition-all',
                    plan === p.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  )}
                >
                  <p className="font-medium text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.price}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPlan('')}
              className={cn(
                'w-full p-2 rounded-xl border text-sm transition-all text-center',
                !plan ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:bg-muted/50'
              )}
            >
              No Plan
            </button>
          </div>

          <div className="space-y-2">
            <Label>Subscription Status</Label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-sm font-medium transition-all',
                    status === s.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  )}
                >
                  <span className={status === s.value ? s.color : 'text-muted-foreground'}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {user?.stripe_customer_id && (
            <a
              href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-primary underline underline-offset-2"
            >
              View in Stripe Dashboard →
            </a>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}