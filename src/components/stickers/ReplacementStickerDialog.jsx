import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isInIframe } from '@/lib/utils';

export default function ReplacementStickerDialog({ sticker, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    if (isInIframe()) {
      alert('Please open the published app to complete checkout.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        mode: 'replacement',
        sticker_id: sticker.id,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || 'Failed to start checkout.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" /> Order Replacement Sticker
          </DialogTitle>
          <DialogDescription>
            We'll print and ship a brand-new sticker with the <strong>same QR code</strong> as your current one (<span className="font-mono">{sticker?.unique_code}</span>), so all your feedback history is preserved.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <div className="bg-muted rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Replacement sticker</span>
              <span className="font-semibold">$19.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">Included</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Same QR code</span>
              <span className="font-semibold text-green-600">✓ Yes</span>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePurchase} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Pay $19.00 & Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}