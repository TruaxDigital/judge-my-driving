import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GITHUB_BASE = 'https://cdn.jsdelivr.net/gh/TruaxDigital/judge-my-driving@d29729a262739c008d997bd793d1f8f2d5f1d08d';

const DESIGNS = [
  { id: 'tell_my_boss', label: 'Tell My Boss', url: `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Boss.svg` },
  { id: 'new_driver', label: 'New Driver', url: `${GITHUB_BASE}/New%20Driver.%20Got%20Feedback.svg` },
  { id: 'on_the_clock', label: 'On the Clock', url: `${GITHUB_BASE}/On%20the%20Clock,%20On%20the%20Record.svg` },
  { id: 'rate_this_driver', label: 'Rate This Driver', url: `${GITHUB_BASE}/Rate%20this%20Driver.svg` },
  { id: 'student_driver', label: 'Student Driver', url: null },
  { id: 'tell_my_dad', label: 'Tell My Dad', url: null },
  { id: 'tell_my_kids', label: 'Tell My Kids', url: null },
  { id: 'tell_my_mom', label: 'Tell My Mom', url: null },
  { id: 'still_got_it', label: 'Still Got It', url: null },
  { id: 'experienced_driver', label: 'Experienced Driver', url: null },
  { id: 'decades_behind_wheel', label: 'Decades Behind the Wheel', url: null },
  { id: 'company_vehicle', label: 'Company Vehicle', url: null },
];

function CopyLinkButton({ url, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex-1 text-xs py-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-1"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export default function PartnerDesigns({ partner }) {
  const teenUrl = partner ? `https://app.judgemydriving.com/student-drivers?ref=${partner.ref_code}` : '';
  const seniorUrl = partner ? `https://app.judgemydriving.com/senior-drivers?ref=${partner.ref_code}` : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Sticker Designs</h1>
        <p className="text-muted-foreground mt-1">Preview all available designs. Share your referral link for any design.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DESIGNS.map(design => (
          <div key={design.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* 16:5 ratio preview */}
            <div className="w-full bg-muted flex items-center justify-center" style={{ aspectRatio: '16/5' }}>
              {design.url ? (
                <img
                  src={design.url}
                  alt={design.label}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <p className="text-xs text-muted-foreground">[Design Preview]</p>
              )}
            </div>
            <div className="p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">{design.label}</p>
              <div className="flex gap-2">
                <CopyLinkButton url={teenUrl} label="Share for Teens" />
                <CopyLinkButton url={seniorUrl} label="Share for Seniors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}