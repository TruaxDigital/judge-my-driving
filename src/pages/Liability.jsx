import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Liability() {
  return (
    <div className="min-h-screen bg-zinc-900 font-inter px-5 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-primary shrink-0" />
          <h1 className="text-2xl font-extrabold text-white">Safety Notice & Disclaimer</h1>
        </div>

        <p className="text-zinc-300 text-sm leading-relaxed">
          Do not use this service while operating a vehicle. Texting, browsing, or interacting with a mobile device while driving is illegal in most U.S. states and jurisdictions. If you wish to leave feedback, pull over to a safe, legal stopping location before using your device, or ask a passenger to submit the review on your behalf.
        </p>

        <p className="text-zinc-300 text-sm leading-relaxed">
          Judge My Driving is committed to road safety. By using this platform, you acknowledge and agree that:
        </p>

        <ul className="space-y-4 text-zinc-300 text-sm leading-relaxed list-none">
          {[
            'You will not access, browse, or submit feedback on this site while actively operating a motor vehicle.',
            'You are solely responsible for complying with all applicable federal, state, and local laws regarding mobile device use while driving.',
            'Judge My Driving, its owners, officers, employees, and affiliates assume no liability for any accidents, injuries, property damage, traffic violations, or legal consequences arising from a user\'s decision to access this platform while driving or while otherwise in control of a vehicle.',
            'This platform is intended to promote safer driving. Any misuse of this service that compromises road safety is strictly prohibited.',
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-primary font-bold shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="text-zinc-300 text-sm leading-relaxed">
          If you witness a genuine emergency or dangerous driving situation, contact local law enforcement or call 911 immediately. Do not attempt to use this platform as a substitute for emergency services.
        </p>

        <p className="text-primary font-semibold text-sm">Driver safety is our number one priority.</p>

        <div className="pt-4 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Judge My Driving</p>
        </div>
      </div>
    </div>
  );
}