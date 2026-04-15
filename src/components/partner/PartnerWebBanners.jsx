import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO_URL = 'https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg';

const AUDIENCES = [
  {
    id: 'teen',
    label: 'Teen / Student Drivers',
    sub: 'Parents of teen drivers',
    path: 'student-drivers',
    emoji: '🚗',
  },
  {
    id: 'senior',
    label: 'Senior Drivers',
    sub: 'Families of senior drivers',
    path: 'senior-drivers',
    emoji: '👴',
  },
  {
    id: 'general',
    label: 'General',
    sub: 'All drivers',
    path: 'get-started',
    emoji: '🌐',
  },
];

const SIZES = [
  { id: 'leaderboard', label: 'Leaderboard', dims: '728 × 90', w: 728, h: 90 },
  { id: 'medium', label: 'Medium Rectangle', dims: '300 × 250', w: 300, h: 250 },
  { id: 'skyscraper', label: 'Wide Skyscraper', dims: '160 × 600', w: 160, h: 600 },
];

function generateBannerHtml(refCode, path, w, h) {
  const url = `https://app.judgemydriving.com/${path}?ref=${refCode}`;
  const isLeaderboard = w > h && h < 150;
  const isSkyscraper = h > w;

  if (isLeaderboard) {
    // 728x90 — row layout: logo | divider | headline (2 lines) | btn
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;width:728px;height:90px;">
  <div style="width:728px;height:90px;background:#0F0F0F;display:flex;flex-direction:row;align-items:center;justify-content:space-between;padding:0 24px;box-sizing:border-box;font-family:Arial,sans-serif;gap:16px;overflow:hidden;">
    <img src="${LOGO_URL}" alt="Judge My Driving" style="height:38px;width:auto;flex-shrink:0;" />
    <div style="width:1px;height:40px;background:#333;flex-shrink:0;"></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:2px;">
      <div style="color:#FFFFFF;font-size:15px;font-weight:700;line-height:1.2;letter-spacing:-0.2px;">Real-Time Driver Feedback Starts Here</div>
      <div style="color:#888;font-size:11px;line-height:1.3;">See what drivers say — and improve your score.</div>
    </div>
    <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#D4A017;color:#0F0F0F;font-size:13px;font-weight:700;padding:10px 18px;border-radius:6px;text-decoration:none;white-space:nowrap;flex-shrink:0;">Get Started →</a>
  </div>
</a>`;
  }

  if (isSkyscraper) {
    // 160x600 — column layout stacked tightly, logo bigger, headline wraps naturally
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;width:160px;height:600px;">
  <div style="width:160px;height:600px;background:#0F0F0F;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 14px;box-sizing:border-box;font-family:Arial,sans-serif;gap:18px;overflow:hidden;">
    <img src="${LOGO_URL}" alt="Judge My Driving" style="height:36px;width:auto;" />
    <div style="width:40px;height:2px;background:#D4A017;border-radius:2px;"></div>
    <div style="color:#FFFFFF;font-size:17px;font-weight:700;line-height:1.3;text-align:center;letter-spacing:-0.3px;">Real-Time Driver Feedback Starts Here</div>
    <div style="color:#888;font-size:12px;line-height:1.5;text-align:center;">See what other drivers say — and improve your score.</div>
    <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#D4A017;color:#0F0F0F;font-size:13px;font-weight:700;padding:11px 16px;border-radius:6px;text-decoration:none;text-align:center;width:100%;box-sizing:border-box;">Get Started →</a>
  </div>
</a>`;
  }

  // 300x250 — medium rectangle
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;width:300px;height:250px;">
  <div style="width:300px;height:250px;background:#0F0F0F;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px;box-sizing:border-box;font-family:Arial,sans-serif;gap:14px;overflow:hidden;">
    <img src="${LOGO_URL}" alt="Judge My Driving" style="height:40px;width:auto;" />
    <div style="width:40px;height:2px;background:#D4A017;border-radius:2px;"></div>
    <div style="color:#FFFFFF;font-size:19px;font-weight:700;line-height:1.25;text-align:center;letter-spacing:-0.3px;">Real-Time Driver Feedback Starts Here</div>
    <div style="color:#888;font-size:12px;line-height:1.4;text-align:center;">See what other drivers say — and improve your score.</div>
    <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#D4A017;color:#0F0F0F;font-size:13px;font-weight:700;padding:11px 24px;border-radius:6px;text-decoration:none;white-space:nowrap;">Get Started →</a>
  </div>
</a>`;
}

function CopyCodeButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:text-primary transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy Code'}
    </button>
  );
}

export default function PartnerWebBanners({ partner }) {
  const [selectedAudience, setSelectedAudience] = useState('teen');
  const [selectedSize, setSelectedSize] = useState('medium');

  if (!partner?.ref_code) return null;

  const audience = AUDIENCES.find(a => a.id === selectedAudience);
  const size = SIZES.find(s => s.id === selectedSize);
  const html = generateBannerHtml(partner.ref_code, audience.path, size.w, size.h);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Website Banner Snippets</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Copy and paste the HTML below into your website to display a referral banner with your unique link pre-built in.
        </p>
      </div>

      {/* Audience selector */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audience</p>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAudience(a.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                selectedAudience === a.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              <span>{a.emoji}</span> {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banner Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSize(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                selectedSize === s.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {s.label}
              <span className="text-xs opacity-60">{s.dims}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</p>
        <div className="bg-muted/40 border border-border rounded-2xl p-6 flex items-center justify-center overflow-auto min-h-[120px]">
          <div
            style={{ maxWidth: '100%', overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Preview is live — clicking opens your referral page.</p>
      </div>

      {/* Code block */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">HTML Snippet</p>
          <CopyCodeButton text={html} />
        </div>
        <div className="relative bg-[#0F0F0F] rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
            <span className="ml-2 text-xs text-white/30 font-mono">banner-snippet.html</span>
          </div>
          <pre className="text-xs text-green-400 font-mono p-4 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-64 overflow-y-auto">
            {html}
          </pre>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste this anywhere in your website's HTML. Your ref code <span className="font-mono font-semibold text-foreground">{partner.ref_code}</span> is already embedded.
        </p>
      </div>
    </div>
  );
}