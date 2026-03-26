import React from 'react';
import { ThumbsUp, Phone, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SalesBox from './SalesBox';

export default function ThankYouScreen({ rating, safetyFlag }) {
  if (rating >= 4) {
    return (
      <div className="text-center space-y-8 py-8">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <ThumbsUp className="w-12 h-12 text-green-400" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Great Driver!</h1>
          <p className="text-zinc-400 text-lg">Thanks for the positive feedback.</p>
        </div>
        <SalesBox />
      </div>
    );
  }

  if (rating === 3) {
    return (
      <div className="text-center space-y-8 py-8">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <ThumbsUp className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Thanks!</h1>
          <p className="text-zinc-400 text-lg">Your feedback has been submitted.</p>
        </div>
        <SalesBox discountCode="DRIVE20" />
      </div>
    );
  }

  // Rating 1-2
  return (
    <div className="text-center space-y-8 py-8">
      <div className="w-24 h-24 bg-zinc-700/50 rounded-full flex items-center justify-center mx-auto">
        <ThumbsUp className="w-12 h-12 text-zinc-400" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Thank You</h1>
        <p className="text-zinc-400 text-lg">Your feedback has been recorded.</p>
      </div>
      {safetyFlag && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 space-y-4">
          <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-red-300 font-medium">If this is an emergency, contact local authorities.</p>
          <a href="tel:911">
            <Button variant="destructive" className="w-full rounded-xl h-12 font-semibold">
              <Phone className="w-5 h-5 mr-2" /> Call 911
            </Button>
          </a>
        </div>
      )}
      <SalesBox />
    </div>
  );
}