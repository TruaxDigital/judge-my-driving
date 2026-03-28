/**
 * Opens a clean print window with the partner flyer and real QR code embedded.
 * Call printPartnerFlyer(partner, 'teen' | 'senior') from anywhere.
 */

const FLYERS = {
  teen: {
    headline: "You Can't Ride Shotgun Forever.",
    subhead: "But you can still know.",
    hook: "Other drivers scan a QR sticker on your teen's car and rate how they drive. You get the feedback. They drive knowing someone's watching.",
    audience: "Parents of Teen Drivers",
    stats: [
      { number: "3x", label: "higher fatal crash risk for 16-19 year-olds vs. drivers 20+", source: "IIHS, 2023" },
      { number: "6M+", label: "teen driver crashes per year in the U.S.", source: "NHTSA, 2023" },
    ],
    steps: [
      { num: "1", title: "Get your sticker", desc: "Pick a design. Ships to your door." },
      { num: "2", title: "Stick it on the car", desc: "10 seconds. No hardware, no app, no wiring." },
      { num: "3", title: "Know how they drive when you're not there", desc: "Other drivers rate your teen. You get alerts by email, in real time." },
    ],
    cta: "Less than $1/week",
    ctaSub: "Plans start at $49/year. 30-day money-back guarantee.",
    trustLine: "Backed by real community feedback. Founded in Virginia.",
    color: {
      primary: "#B45309",
      primaryLight: "#F59E0B",
      primaryBg: "#FEF3C7",
      bg: "#FFFFFF",
      card: "#FAFAF9",
      cardBorder: "#E5E5E4",
      accent: "#78350F",
      text: "#1C1917",
      textMuted: "#57534E",
      stepCircleBg: "#FEF3C7",
      stepCircleBorder: "#B45309",
      sourceText: "#A8A29E",
    }
  },
  senior: {
    headline: "You Worry Every Time They Drive.",
    subhead: "Now you'll know.",
    hook: "Other drivers scan a QR sticker on your parent's car and rate how they drive. You get the feedback, delivered in real time. No awkward conversation required.",
    audience: "Adult Children of Senior Drivers",
    stats: [
      { number: "#1", label: "highest crash death rate per mile: drivers 75+", source: "IIHS, 2023" },
      { number: "83%", label: "of adult children avoid the driving conversation with aging parents", source: "AAA Foundation, 2022" },
    ],
    steps: [
      { num: "1", title: "Get your sticker", desc: "Choose a tasteful design. Delivered to your door." },
      { num: "2", title: "Place it on their car", desc: "Simple. No tech, no GPS, no confrontation." },
      { num: "3", title: "See how they're doing on the road", desc: "Other drivers provide honest ratings. You see everything in real time." },
    ],
    cta: "Less than $1/week",
    ctaSub: "Plans start at $49/year. 30-day money-back guarantee.",
    trustLine: "Backed by real community feedback. Founded in Virginia.",
    color: {
      primary: "#1D4ED8",
      primaryLight: "#60A5FA",
      primaryBg: "#DBEAFE",
      bg: "#FFFFFF",
      card: "#F8FAFC",
      cardBorder: "#E2E8F0",
      accent: "#1E3A5F",
      text: "#0F172A",
      textMuted: "#64748B",
      stepCircleBg: "#DBEAFE",
      stepCircleBorder: "#1D4ED8",
      sourceText: "#94A3B8",
    }
  }
};

function buildFlyerHTML(f, c, qrImageUrl, referralUrl) {
  const stepsHTML = f.steps.map(step => `
    <div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="width:30px;height:30px;min-width:30px;border-radius:50%;background:${c.stepCircleBg};border:2px solid ${c.stepCircleBorder};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${c.primary};flex-shrink:0;line-height:30px;text-align:center;">
        ${step.num}
      </div>
      <div>
        <div style="font-size:14px;font-weight:700;color:${c.text};">${step.title}</div>
        <div style="font-size:12.5px;color:${c.textMuted};margin-top:2px;line-height:1.5;">${step.desc}</div>
      </div>
    </div>
  `).join('');

  const statsHTML = f.stats.map(s => `
    <div style="flex:1;background:${c.card};border:1px solid ${c.cardBorder};border-radius:8px;padding:14px 12px;">
      <div style="font-size:26px;font-weight:900;color:${c.primary};">${s.number}</div>
      <div style="font-size:11px;line-height:1.5;color:${c.textMuted};margin-top:3px;">${s.label}</div>
      <div style="font-size:9px;color:${c.sourceText};margin-top:6px;font-style:italic;">${s.source}</div>
    </div>
  `).join('');

  const qrSection = qrImageUrl
    ? `<img src="${qrImageUrl}" style="width:120px;height:120px;display:block;margin:0 auto 14px;" />`
    : `<div style="width:120px;height:120px;margin:0 auto 14px;background:#f3f4f6;border-radius:6px;border:1.5px solid ${c.cardBorder};display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;text-align:center;padding:8px;">QR Code</div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Judge My Driving — Partner Flyer</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;0,900;1,700&family=Source+Sans+3:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #F3F4F6;
      font-family: 'Source Sans 3', 'Source Sans Pro', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page {
      size: 5.5in 8.5in;
      margin: 0;
    }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
    }
    .flyer {
      width: 5.5in;
      min-height: 8.5in;
      margin: 0 auto;
      background: ${c.bg};
      font-family: 'Source Sans 3', sans-serif;
      color: ${c.text};
    }
    .print-btn {
      display: block;
      margin: 20px auto;
      padding: 10px 28px;
      background: ${c.primary};
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Source Sans 3', sans-serif;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="flyer">
    <!-- Top Badge -->
    <div style="background:${c.primary};color:#fff;text-align:center;padding:9px 16px;font-size:10.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">
      For ${f.audience}
    </div>

    <!-- Hero -->
    <div style="padding:36px 40px 20px;">
      <h1 style="font-family:'Merriweather',Georgia,serif;font-size:27px;font-weight:900;line-height:1.2;color:${c.text};">
        ${f.headline}
      </h1>
      <p style="font-family:'Merriweather',Georgia,serif;font-size:21px;font-weight:700;color:${c.primary};margin:6px 0 0;font-style:italic;">
        ${f.subhead}
      </p>
      <p style="font-size:14px;line-height:1.65;color:${c.textMuted};margin-top:18px;">
        ${f.hook}
      </p>
    </div>

    <!-- Stats -->
    <div style="display:flex;gap:10px;padding:0 40px 24px;">
      ${statsHTML}
    </div>

    <!-- Divider -->
    <div style="height:1px;background:${c.cardBorder};margin:0 40px;"></div>

    <!-- How It Works -->
    <div style="padding:24px 40px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${c.primary};margin:0 0 18px;">
        How It Works
      </p>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${stepsHTML}
      </div>
    </div>

    <!-- QR Section -->
    <div style="margin:0 40px;background:${c.card};border:1.5px solid ${c.cardBorder};border-radius:10px;padding:22px;text-align:center;">
      ${qrSection}
      <p style="font-size:15px;font-weight:800;color:${c.text};margin:0 0 3px;">Scan to get started</p>
      <p style="font-size:11px;color:${c.textMuted};margin:0 0 4px;">judgemydriving.com</p>
      ${referralUrl ? `<p style="font-size:9px;color:${c.sourceText};font-family:monospace;">${referralUrl}</p>` : ''}
    </div>

    <!-- CTA -->
    <div style="padding:22px 40px 8px;text-align:center;">
      <div style="display:inline-block;background:${c.primary};color:#fff;padding:13px 30px;border-radius:8px;font-size:17px;font-weight:800;letter-spacing:0.3px;">
        ${f.cta}
      </div>
      <p style="font-size:12px;color:${c.textMuted};margin-top:8px;">${f.ctaSub}</p>
    </div>

    <!-- Footer -->
    <div style="padding:14px 40px 18px;text-align:center;border-top:1px solid ${c.cardBorder};margin-top:4px;">
      <p style="font-size:17px;font-weight:900;color:${c.text};margin:0 0 2px;letter-spacing:-0.3px;">Judge My Driving</p>
      <p style="font-size:10.5px;color:${c.textMuted};margin:0 0 3px;letter-spacing:0.3px;">Real feedback from real drivers. Delivered to you.</p>
      <p style="font-size:9.5px;color:${c.sourceText || c.textMuted};margin:0;font-style:italic;">${f.trustLine}</p>
    </div>
  </div>
</body>
</html>`;
}

export function printPartnerFlyer(partner, type) {
  const f = FLYERS[type];
  const c = f.color;
  const qrImageUrl = type === 'teen' ? partner.teen_qr_url : partner.senior_qr_url;
  const referralUrl = type === 'teen'
    ? `https://app.judgemydriving.com/student-drivers?ref=${partner.ref_code}`
    : `https://app.judgemydriving.com/senior-drivers?ref=${partner.ref_code}`;

  const html = buildFlyerHTML(f, c, qrImageUrl, referralUrl);
  const win = window.open('', '_blank', 'width=700,height=900');
  win.document.write(html);
  win.document.close();
}