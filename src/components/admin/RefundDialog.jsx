import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle2, Ban, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLAN_PRICES = { individual: 49, family: 99, starter_fleet: 999, professional_fleet: 1999 };

function calcLocalRefundInfo(planTier, subscriptionStartDate, stickerCount) {
  const isFleet = planTier === 'starter_fleet' || planTier === 'professional_fleet';
  const planPrice = PLAN_PRICES[planTier] || 0;
  const now = new Date();
  const start = new Date(subscriptionStartDate || now);
  const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  if (isFleet) {
    if (daysSinceStart <= 30) {
      return { amount: planPrice, type: 'full', eligible: true, daysSinceStart };
    } else if (daysSinceStart <= 90) {
      const remainingDays = Math.max(0, 365 - daysSinceStart);
      const prorated = Math.round((remainingDays / 365) * planPrice);
      const deduction = stickerCount * 19;
      return { amount: Math.max(0, prorated - deduction), type: 'prorated', eligible: true, prorated, deduction, daysSinceStart };
    } else {
      return { amount: 0, type: 'none', eligible: false, reason: 'Past 90-day window for fleet plans.', daysSinceStart };
    }
  } else {
    if (daysSinceStart <= 30) {
      return { amount: planPrice, type: 'full', eligible: true, daysSinceStart };
    } else if (daysSinceStart <= 365) {
      const deduction = stickerCount * 19;
      return { amount: Math.max(0, planPrice - deduction), type: 'partial', eligible: true, deduction, daysSinceStart };
    } else {
      return { amount: 0, type: 'none', eligible: false, reason: 'Past 365-day refund window.', daysSinceStart };
    }
  }
}

export default function RefundDialog({ user, open, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Load the Sale record for this user
  const { data: sales = [], isLoading: loadingSale } = useQuery({
    queryKey: ['user-sale', user?.id],
    queryFn: () => base44.entities.Sale.filter({ user_id: user?.id }),
    enabled: !!user && open,
  });

  // Load stickers to get count
  const { data: stickers = [], isLoading: loadingStickers } = useQuery({
    queryKey: ['user-stickers-refund', user?.id],
    queryFn: () => base44.entities.Sticker.filter({ owner_id: user?.id }),
    enabled: !!user && open,
  });

  const sale = sales[0];
  const activeStickers = stickers.filter(s => s.status !== 'deactivated').length;
  const refundInfo = sale
    ? calcLocalRefundInfo(sale.plan_tier, sale.subscription_start_date, activeStickers)
    : null;

  const isLoading = loadingSale || loadingStickers;

  const handleRefund = async () => {
    if (!sale || !refundInfo?.eligible) return;
    setProcessing(true);
    const res = await base44.functions.invoke('processRefund', {
      target_user_id: user.id,
      sale_id: sale.id,
      refund_amount_cents: Math.round(refundInfo.amount * 100),
      sticker_count: activeStickers,
    });
    setProcessing(false);

    if (res.data?.success) {
      toast.success(`Refund of $${refundInfo.amount.toFixed(2)} processed. ${res.data.stickers_deactivated} sticker(s) deactivated. Refund email sent.`);
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      onClose();
    } else {
      toast.error(res.data?.error || 'Refund failed');
    }
  };

  // Reset confirmation when dialog opens
  useEffect(() => { if (open) setConfirmed(false); }, [open]);

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            {user?.full_name || user?.email} · {sale?.plan_tier?.replace(/_/g, ' ') || '—'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !sale ? (
          <div className="py-6 text-center text-muted-foreground text-sm">No sale record found for this user.</div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Policy summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan price</span>
                <span className="font-semibold">${PLAN_PRICES[sale.plan_tier] || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days since start</span>
                <span className="font-semibold">{refundInfo?.daysSinceStart ?? '—'} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active stickers</span>
                <span className="font-semibold">{activeStickers}</span>
              </div>
              {refundInfo?.deduction > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Sticker deduction ({activeStickers} × $19)</span>
                  <span>−${refundInfo.deduction}</span>
                </div>
              )}
              {refundInfo?.prorated != null && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Pro-rated base</span>
                  <span>${refundInfo.prorated}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                <span>Refund amount</span>
                <span className={refundInfo?.eligible ? 'text-green-600' : 'text-muted-foreground'}>
                  ${refundInfo?.amount?.toFixed(2) ?? '0.00'}
                </span>
              </div>
            </div>

            {/* Status banner */}
            {!refundInfo?.eligible ? (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600">
                <Ban className="w-4 h-4 shrink-0" />
                <span>{refundInfo?.reason}</span>
              </div>
            ) : refundInfo.type === 'full' ? (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Full refund — within 30-day window. Zero friction.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {refundInfo.type === 'prorated' ? 'Pro-rated refund (fleet plan, 31–90 days).' : 'Partial refund — sticker cost deducted.'}
                </span>
              </div>
            )}

            {/* What will happen */}
            {refundInfo?.eligible && (
              <div className="text-xs text-muted-foreground space-y-1 border border-border rounded-xl p-3">
                <p className="font-semibold text-foreground mb-1">This will automatically:</p>
                <p>• Issue Stripe refund of <strong>${refundInfo.amount.toFixed(2)}</strong> & cancel subscription</p>
                <p>• Deactivate all {activeStickers} active sticker QR code(s)</p>
                <p>• Tag contact in HubSpot as "Churned - Refunded"</p>
                <p>• Send "You're all set" email with Google review link</p>
              </div>
            )}

            {/* Confirmation checkbox */}
            {refundInfo?.eligible && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  className="w-4 h-4 accent-yellow-400"
                />
                <span className="text-sm">I confirm this refund is correct and irreversible.</span>
              </label>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {refundInfo?.eligible && (
            <Button
              onClick={handleRefund}
              disabled={processing || !confirmed}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refund ${refundInfo?.amount?.toFixed(2)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}