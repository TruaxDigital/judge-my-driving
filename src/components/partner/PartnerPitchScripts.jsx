import React from 'react';
import { MessageSquare, Star, HelpCircle, DollarSign } from 'lucide-react';

const SELLING_POINTS = [
  'No hardware, no GPS, no installation. It\'s a sticker.',
  'Real-time email alerts when someone rates the driver.',
  'Plans start at $49/year for individuals, $99/year for families (up to 3 vehicles).',
  '30-day money-back guarantee.',
  'Takes 10 seconds to set up.',
  'Works on any vehicle.',
];

const FAQ = [
  {
    q: 'How does the sticker work?',
    a: 'Other drivers scan the QR code on the sticker using their phone camera. They\'re taken to a quick feedback form where they rate the driver and leave optional comments. The vehicle owner gets an email alert.',
  },
  {
    q: 'Is it safe for other drivers to scan while driving?',
    a: 'The sticker is designed to be scanned by passengers or by drivers when the vehicle is parked or stopped. The QR code is readable from a reasonable distance and doesn\'t require tailgating.',
  },
  {
    q: 'What if someone leaves fake or mean reviews?',
    a: 'The platform has abuse prevention measures. Feedback is moderated and users are limited in how frequently they can submit reviews.',
  },
  {
    q: 'Do I need to install an app?',
    a: 'No app required. Everything works through the web browser and email.',
  },
  {
    q: 'What if I want to cover multiple vehicles?',
    a: 'The Family plan covers up to 3 vehicles for $99/year. Additional vehicles can be added.',
  },
];

export default function PartnerPitchScripts() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Pitch Scripts & Benefits</h1>
        <p className="text-muted-foreground mt-1">Everything you need to explain Judge My Driving to your audience.</p>
      </div>

      {/* Teen Script */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Quick Pitch — Teen Drivers (30 seconds)</h2>
        </div>
        <blockquote className="border-l-4 border-primary pl-4 text-foreground italic leading-relaxed">
          "Before your new driver hits the road alone, put a Judge My Driving sticker on the car. Other drivers can scan the QR code and rate how your teen is driving. You get real-time alerts straight to your email. It's like having eyes on the road even when you're not in the car. Plans start at $49 a year."
        </blockquote>
      </div>

      {/* Senior Script */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Quick Pitch — Senior Drivers (30 seconds)</h2>
        </div>
        <blockquote className="border-l-4 border-primary pl-4 text-foreground italic leading-relaxed">
          "Worried about mom or dad behind the wheel? Judge My Driving gives you a way to know how they're doing on the road without the awkward conversation. A QR-coded sticker goes on the car, other drivers rate their driving, and you get the feedback in real time. Plans start at $49 a year."
        </blockquote>
      </div>

      {/* Key Selling Points */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Key Selling Points</h2>
        </div>
        <ul className="space-y-2">
          {SELLING_POINTS.map(point => (
            <li key={point} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-primary mt-0.5">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Handling Common Questions</h2>
        </div>
        <div className="space-y-4">
          {FAQ.map(item => (
            <div key={item.q} className="space-y-1">
              <p className="font-medium text-foreground text-sm">"{item.q}"</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Commission */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Your Commission</h2>
        </div>
        <p className="text-sm text-foreground">
          You earn <strong>$10</strong> for every individual or family plan signup that comes through your referral link. Payouts are processed quarterly with a $25 minimum.
        </p>
      </div>
    </div>
  );
}