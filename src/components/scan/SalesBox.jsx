import React from 'react';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function SalesBox({ discountCode, rating, sticker }) {
  const href = discountCode
    ? `/get-started?discount=${discountCode}`
    : '/get-started';

  const handleClick = () => {
    // Track CTA click with full sticker context for conversion analysis
    base44.analytics.track({
      eventName: 'post_feedback_purchase_click',
      properties: {
        discount_code: discountCode || null,
        rating: rating || null,
        sticker_id: sticker?.id || null,
        sticker_code: sticker?.unique_code || null,
        design_id: sticker?.design_id || null,
      },
    });

    // Also write a ScanEvent record for server-side K-factor / conversion tracking
    if (sticker?.id) {
      base44.functions.invoke('recordStickerScan', {
        event_type: 'cta_click',
        sticker_id: sticker.id,
        sticker_code: sticker.unique_code,
        design_id: sticker.design_id || null,
        owner_id: sticker.owner_id || null,
        rating_given: rating || null,
        discount_code: discountCode || null,
      }).catch(() => {});
    }
  };

  return (
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6 space-y-4">
      <Gift className="w-8 h-8 text-primary mx-auto" />
      <p className="text-white font-medium">Want feedback on your own driving?</p>
      {discountCode ? (
        <p className="text-zinc-400 text-sm">
          Thanks for your feedback — enjoy <span className="text-primary font-bold">20% off</span> your first order.
        </p>
      ) : (
        <p className="text-zinc-400 text-sm">Get a Judge My Driving sticker for your vehicle.</p>
      )}
      <a href={href} onClick={handleClick} className="block mt-6">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12">
          {discountCode ? 'Get 20% Off — Claim Now' : 'Get Your Sticker'}
        </Button>
      </a>
    </div>
  );
}