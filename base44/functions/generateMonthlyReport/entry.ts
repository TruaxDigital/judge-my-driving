import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Support both authenticated user calls and scheduled automation calls
  let userEmail, userName;
  try {
    const user = await base44.auth.me();
    userEmail = user.email;
    userName = user.full_name;
  } catch {
    // Called from automation (no user session) — use service role, iterate all owners
    return await runForAllOwners(base44);
  }

  const result = await generateAndSendReport(base44.asServiceRole, userEmail, userName);
  return Response.json(result);
});

async function runForAllOwners(base44) {
  // Get all registered sticker owners
  const stickers = await base44.asServiceRole.entities.Sticker.filter({ is_registered: true });
  const ownerEmails = [...new Set(stickers.map(s => s.owner_email).filter(Boolean))];

  const results = [];
  for (const email of ownerEmails) {
    const r = await generateAndSendReport(base44.asServiceRole, email, null);
    results.push({ email, ...r });
  }

  return Response.json({ success: true, processed: results.length });
}

async function generateAndSendReport(serviceBase44, ownerEmail, ownerName) {
  const stickers = await serviceBase44.entities.Sticker.filter({ owner_email: ownerEmail });

  if (stickers.length === 0) {
    return { success: false, error: 'No stickers found for this account.' };
  }

  // Gather all feedback
  const stickerData = [];
  for (const sticker of stickers) {
    const feedback = await serviceBase44.entities.Feedback.filter({ sticker_id: sticker.id });
    stickerData.push({ sticker, feedback });
  }

  const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Build PDF
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  let y = 20;

  const addText = (text, x, size = 11, style = 'normal', color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    doc.text(text, x, y);
  };

  const newLine = (gap = 7) => { y += gap; };

  // Header
  doc.setFillColor(250, 204, 21);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text('Judge My Driving', 15, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Driving Report — ${monthLabel}`, 15, 22);

  y = 40;

  addText(`Report for: ${ownerName || ownerEmail}`, 15, 10, 'normal', [80, 80, 80]);
  newLine(5);
  addText(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 10, 'normal', [80, 80, 80]);
  newLine(10);

  // Summary totals
  const totalFeedback = stickerData.reduce((sum, d) => sum + d.feedback.length, 0);
  const allFeedback = stickerData.flatMap(d => d.feedback);
  const overallAvg = totalFeedback > 0
    ? (allFeedback.reduce((s, f) => s + f.rating, 0) / totalFeedback).toFixed(1)
    : 'N/A';
  const totalSafety = allFeedback.filter(f => f.safety_flag).length;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, y, pageW - 30, 22, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`Total Feedback: ${totalFeedback}`, 25, y + 8);
  doc.text(`Overall Avg Rating: ${overallAvg}/5`, 90, y + 8);
  doc.text(`Safety Incidents: ${totalSafety}`, 160, y + 8);
  y += 30;

  // Per-sticker breakdown
  for (const { sticker, feedback } of stickerData) {
    if (y > 240) { doc.addPage(); y = 20; }

    const count = feedback.length;
    const avg = count > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / count).toFixed(1) : 'N/A';
    const safety = feedback.filter(f => f.safety_flag).length;
    const topPositive = feedback.filter(f => f.rating >= 4 && f.comment).slice(0, 3);

    // Sticker header bar
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageW - 30, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(sticker.driver_label || 'Unnamed Vehicle', 18, y + 5.5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Code: ${sticker.unique_code}`, pageW - 50, y + 5.5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`Feedback: ${count}   |   Avg Rating: ${avg}/5   |   Safety Flags: ${safety}`, 18, y);
    y += 8;

    if (topPositive.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text('Top Positive Feedback:', 18, y);
      y += 5;

      for (const f of topPositive) {
        if (y > 265) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`"${f.comment}"`, pageW - 46);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(60, 60, 60);
        doc.text(lines, 22, y);
        y += lines.length * 5 + 2;
      }
    }

    if (count === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No feedback received this period.', 18, y);
      y += 6;
    }

    y += 8;
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text('Judge My Driving — Privacy-first driving feedback platform — judgemydriving.com', 15, 285);

  const pdfBase64 = doc.output('datauristring');

  // Send email with PDF attached (embedded as base64 in body since SendEmail is HTML)
  await serviceBase44.integrations.Core.SendEmail({
    to: ownerEmail,
    subject: `Your Judge My Driving Monthly Report — ${monthLabel}`,
    body: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #FACC15; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <img src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg" alt="Judge My Driving" style="height:50px;width:auto;display:block;margin-bottom:6px;" />
          <p style="margin: 4px 0 0; font-size: 14px; color: #333;">Monthly Driving Report — ${monthLabel}</p>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; border-top: none;">
          <p style="font-size: 15px;">Hi${ownerName ? ` ${ownerName.split(' ')[0]}` : ''},</p>
          <p style="font-size: 14px; color: #555;">Your monthly driving feedback report is ready. Here's a quick summary:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5;">
            <tr style="background: #f3f3f3;">
              <th style="padding: 12px 16px; text-align: left; font-size: 13px;">Metric</th>
              <th style="padding: 12px 16px; text-align: right; font-size: 13px;">Value</th>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; border-top: 1px solid #eee;">Total Feedback Received</td>
              <td style="padding: 12px 16px; font-size: 13px; text-align: right; border-top: 1px solid #eee; font-weight: 600;">${totalFeedback}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; border-top: 1px solid #eee;">Overall Average Rating</td>
              <td style="padding: 12px 16px; font-size: 13px; text-align: right; border-top: 1px solid #eee; font-weight: 600;">${overallAvg} / 5</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; border-top: 1px solid #eee;">Safety Incidents Reported</td>
              <td style="padding: 12px 16px; font-size: 13px; text-align: right; border-top: 1px solid #eee; font-weight: 600; color: ${totalSafety > 0 ? '#ef4444' : '#1a1a1a'};">${totalSafety}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; border-top: 1px solid #eee;">Active Stickers</td>
              <td style="padding: 12px 16px; font-size: 13px; text-align: right; border-top: 1px solid #eee; font-weight: 600;">${stickers.filter(s => s.status === 'active').length}</td>
            </tr>
          </table>

          ${stickerData.map(({ sticker, feedback: fb }) => {
            const c = fb.length;
            const a = c > 0 ? (fb.reduce((s, f) => s + f.rating, 0) / c).toFixed(1) : 'N/A';
            const top = fb.filter(f => f.rating >= 4 && f.comment).slice(0, 2);
            return `
              <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <p style="font-weight: 700; font-size: 14px; margin: 0 0 8px;">${sticker.driver_label || 'Unnamed Vehicle'} <span style="font-weight: 400; color: #999; font-size: 12px; font-family: monospace;">#${sticker.unique_code}</span></p>
                <p style="font-size: 13px; color: #555; margin: 0 0 8px;">${c} feedback · Avg ${a}/5 · ${fb.filter(f => f.safety_flag).length} safety flag(s)</p>
                ${top.length > 0 ? top.map(f => `<p style="font-size: 13px; color: #333; font-style: italic; border-left: 3px solid #FACC15; padding-left: 10px; margin: 4px 0;">"${f.comment}"</p>`).join('') : ''}
              </div>
            `;
          }).join('')}

          <p style="font-size: 13px; color: #888; margin-top: 24px;">You'll receive this report automatically on the 1st of each month. Log in to your dashboard for full details.</p>
          <a href="https://app.judgemydriving.com" style="display: inline-block; background: #FACC15; color: #111; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; margin-top: 8px;">View Dashboard</a>
        </div>
      </div>
    `,
  });

  return { success: true };
}