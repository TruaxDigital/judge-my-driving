import React from 'react';
import { MessageSquare, Star, HelpCircle, Zap, Link as LinkIcon } from 'lucide-react';

const HOW_IT_WORKS = [
  'Share your referral link or print your flyer from the My Referral Tools tab. You have separate links for teen drivers and senior drivers.',
  'The parent signs up through your link. The referral is tracked automatically.',
  'You earn $10 for every paid signup. Payouts quarterly.',
];

const WHY_PARENTS_SAY_YES = [
  '30-day money-back guarantee. Zero risk to try it.',
  'No hardware, no installation. It\'s a sticker. Takes 10 seconds.',
  'Real-time alerts every time someone rates the driver.',
  'Full driver dashboard, reporting, maps, and community leaderboards through the iPhone and Android app.',
  '$49/year for individuals. $99/year for families (up to 3 vehicles).',
  'Works on any vehicle. Car, truck, minivan, golf cart.',
];

const FAQ = [
  {
    q: 'How does the sticker work?',
    a: 'Someone near the vehicle scans the QR code with their phone camera. They land on a short feedback form, rate the driver 1-5 stars, and leave an optional comment. The vehicle owner gets an alert within minutes.',
  },
  {
    q: 'Is it safe for other drivers to scan while driving?',
    a: 'The sticker is designed for passengers or for drivers when the vehicle is parked or stopped. The QR code is readable from several feet away and doesn\'t require getting close to the vehicle.',
  },
  {
    q: 'What if someone leaves fake or mean reviews?',
    a: 'Each device is limited in how often it can submit feedback. The system flags suspicious patterns (rapid-fire submissions, identical comments, same device). Flagged reviews are held for moderation before they reach the vehicle owner. Abuse is rare, but the system is built to catch it.',
  },
  {
    q: 'Is there an app?',
    a: 'Yes. Judge My Driving has a free app on iPhone and Android. The app gives you your driver dashboard, feedback reports, maps showing where ratings came from, and community leaderboards. You don\'t need the app though — you\'ll get real-time email alerts automatically every time someone rates the driver. Feedback scanners don\'t need the app either. They just scan the QR code with their phone camera.',
  },
  {
    q: 'What if the parent wants to cover multiple vehicles?',
    a: 'The Family plan covers up to 3 vehicles for $99/year. Additional vehicles can be added for $39/year each.',
  },
];

const REFERRAL_TOOLS = [
  'Your unique QR codes and referral links for teen drivers and senior drivers (see My Referral Tools tab)',
  'Printable flyers for each audience, ready to post or hand out',
  'Access to all 15 bumper sticker designs to share with parents so they can preview what goes on the car',
];

export default function PartnerPitchScripts() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Pitch Scripts & Selling Tools</h1>
        <p className="text-muted-foreground mt-1">Everything you need to refer parents to Judge My Driving and earn $10 per signup.</p>
      </div>

      {/* How It Works */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground text-lg">How It Works for You</h2>
        <ol className="space-y-3">
          {HOW_IT_WORKS.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold shrink-0">{i + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      {/* Teen Script */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-foreground text-lg">Quick Pitch - Teen Drivers (30 seconds)</h2>
        <blockquote className="border-l-4 border-primary pl-4 text-foreground italic leading-relaxed bg-muted/30 py-4">
          "Before your new driver hits the road alone, put a Judge My Driving sticker on the car. Other drivers scan the QR code and rate how your teen is driving. You get real-time alerts, a driver dashboard, maps, and reporting through the app on iPhone or Android. It's like having eyes on the road even when you're not in the car. $49 a year with a 30-day money-back guarantee."
        </blockquote>
      </div>

      {/* Senior Script */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-foreground text-lg">Quick Pitch - Senior Drivers (30 seconds)</h2>
        <blockquote className="border-l-4 border-primary pl-4 text-foreground italic leading-relaxed bg-muted/30 py-4">
          "Worried about mom or dad behind the wheel? Judge My Driving gives you a way to know how they're doing on the road without the awkward conversation. A QR-coded sticker goes on the car, other drivers rate their driving, and you get the feedback in real time. Track everything through the app, including a driver dashboard, feedback maps, and reports. $49 a year with a 30-day money-back guarantee."
        </blockquote>
      </div>

      {/* Why Parents Say Yes */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground text-lg">Why Parents Say Yes</h2>
        <ul className="space-y-2">
          {WHY_PARENTS_SAY_YES.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-primary mt-0.5">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground text-lg">Handling Common Questions</h2>
        <div className="space-y-5">
          {FAQ.map(item => (
            <div key={item.q} className="space-y-2">
              <p className="font-semibold text-foreground text-sm">{item.q}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your Referral Tools */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground text-lg">Your Referral Tools</h2>
        </div>
        <ul className="space-y-2">
          {REFERRAL_TOOLS.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-primary mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}