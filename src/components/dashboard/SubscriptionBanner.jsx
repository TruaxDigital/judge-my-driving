import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { isInIframe } from '@/lib/utils';

export default function SubscriptionBanner({ status }) {
  const openPortal = async () => {
    if (isInIframe()) {
      alert('Please open the app directly to manage your subscription.');
      return;
    }
    const res = await base44.functions.invoke('createPortalSession', {});
    if (res.data?.url) window.location.href = res.data.url;
  };

  if (status === 'past_due') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Your subscription payment failed. Update your payment method to keep stickers active.</span>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 border-red-500/30 text-red-600 hover:bg-red-500/10" onClick={openPortal}>
          Update Payment
        </Button>
      </div>
    );
  }

  if (status === 'canceled') {
    return (
      <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-600">
          <XCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Your subscription has been canceled. Reactivate to receive feedback again.</span>
        </div>
        <Button size="sm" className="shrink-0" onClick={openPortal}>Reactivate</Button>
      </div>
    );
  }

  return null;
}