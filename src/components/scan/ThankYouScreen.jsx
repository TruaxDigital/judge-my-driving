import React from 'react';
import { ThumbsUp, Gift, Phone, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6 space-y-4">
          <Gift className="w-8 h-8 text-primary mx-auto" />
          <p className="text-white font-medium">Want feedback on your own driving?</p>
          <p className="text-zinc-400 text-sm">Get a Judge My Driving sticker for your vehicle.</p>
          <a
            href="https://judgemydriving.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12">
              Get Your Sticker
            </Button>
          </a>
        </div>
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
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6 space-y-4">
          <p className="text-white font-medium">Want your own sticker?</p>
          <p className="text-zinc-400 text-sm">Use code <span className="text-primary font-bold">DRIVE20</span> for 20% off.</p>
          <a
            href="https://judgemydriving.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12">
              Shop Now — 20% Off
            </Button>
          </a>
        </div>
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
    </div>
  );
}