import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { printPartnerFlyer } from './PartnerFlyerPrint';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function QRCard({ title, qrUrl, referralUrl, label, audience, partner }) {
  const handleDownload = async () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `jmd-qr-${audience}.png`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-foreground text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{label}</p>

      {/* QR Code */}
      <div className="flex justify-center">
        {qrUrl ? (
          <img src={qrUrl} alt={`${title} QR Code`} className="w-48 h-48 rounded-xl border border-border" />
        ) : (
          <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center px-4">QR code generating... Check back in a moment.</p>
          </div>
        )}
      </div>

      {qrUrl && (
        <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> Download QR Code (PNG)
        </Button>
      )}

      {/* Referral URL */}
      <div className="bg-muted rounded-xl px-3 py-2 flex items-center justify-between gap-2">
        <p className="text-xs font-mono text-foreground truncate flex-1">{referralUrl}</p>
        <CopyButton text={referralUrl} />
      </div>

      {/* Flyer buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg text-xs"
          onClick={() => printPartnerFlyer(partner, audience)}
        >
          <Printer className="w-3 h-3 mr-1" /> Print Flyer
        </Button>
        <a href={referralUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="rounded-lg text-xs w-full">
            <ExternalLink className="w-3 h-3 mr-1" /> Preview Page
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function PartnerReferralTools({ partner }) {
  if (!partner) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Partner profile not found. Please contact support.
      </div>
    );
  }

  const teenUrl = `https://app.judgemydriving.com/student-drivers?ref=${partner.ref_code}`;
  const seniorUrl = `https://app.judgemydriving.com/senior-drivers?ref=${partner.ref_code}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">My Referral Tools</h1>
        <p className="text-muted-foreground mt-1">Your unique referral QR codes and links for both audiences.</p>
      </div>

      <div className="bg-muted/30 border border-border rounded-2xl px-5 py-3 text-sm">
        Your ref code: <span className="font-mono font-semibold text-foreground">{partner.ref_code}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRCard
          title="Teen Driver Referral"
          qrUrl={partner.teen_qr_url}
          referralUrl={teenUrl}
          label="Share this with parents of teen drivers"
          audience="teen"
          partner={partner}
        />
        <QRCard
          title="Senior Driver Referral"
          qrUrl={partner.senior_qr_url}
          referralUrl={seniorUrl}
          label="Share this with families of senior drivers"
          audience="senior"
          partner={partner}
        />
      </div>
    </div>
  );
}