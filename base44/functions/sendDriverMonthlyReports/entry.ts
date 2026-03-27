import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import moment from 'npm:moment@2.30.1';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow both scheduled (no user) and manual admin invocations
  let user = null;
  try { user = await base44.auth.me(); } catch (_) {}
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get all stickers that have monthly reports enabled and a driver email
  const stickers = await base44.asServiceRole.entities.Sticker.filter({
    send_monthly_report: true,
  });

  const eligible = stickers.filter(s => s.driver_email && s.driver_email.trim());
  console.log(`Sending monthly reports to ${eligible.length} drivers`);

  const cutoff = moment().subtract(30, 'days').toISOString();
  let sent = 0;

  for (const sticker of eligible) {
    const allFeedback = await base44.asServiceRole.entities.Feedback.filter({ sticker_id: sticker.id });
    const recentFeedback = allFeedback.filter(f => f.created_date >= cutoff);

    const totalReviews = recentFeedback.length;
    const avgRating = totalReviews > 0
      ? (recentFeedback.reduce((s, f) => s + f.rating, 0) / totalReviews).toFixed(1)
      : 'N/A';
    const safetyFlags = recentFeedback.filter(f => f.safety_flag).length;
    const recentComments = recentFeedback
      .filter(f => f.comment && f.comment.trim())
      .slice(-5)
      .map(f => `<li style="margin-bottom:6px"><em>"${f.comment}"</em> — ${'⭐'.repeat(Math.round(f.rating))}</li>`)
      .join('');

    const driverName = sticker.driver_name || sticker.driver_label || 'Driver';
    const vehicleLabel = sticker.driver_label || sticker.vehicle_id || sticker.unique_code;

    const subject = `Your Monthly Driving Report — ${moment().format('MMMM YYYY')}`;
    const body = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#111">Hi ${driverName},</h2>
        <p>Here's your driving performance summary for <strong>${moment().subtract(30,'days').format('MMM D')} – ${moment().format('MMM D, YYYY')}</strong>.</p>
        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Vehicle:</strong> ${vehicleLabel}</p>
          <p style="margin:0 0 8px"><strong>Average Rating:</strong> ${avgRating} ⭐</p>
          <p style="margin:0 0 8px"><strong>Total Reviews:</strong> ${totalReviews}</p>
          ${safetyFlags > 0 ? `<p style="margin:0;color:#dc2626"><strong>Safety Flags:</strong> ${safetyFlags} ⚠️</p>` : `<p style="margin:0;color:#16a34a"><strong>Safety Flags:</strong> 0 ✅</p>`}
        </div>
        ${recentComments ? `<h3>Recent Feedback</h3><ul style="padding-left:16px">${recentComments}</ul>` : ''}
        <p style="color:#888;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
          Sent by <a href="https://judgemydriving.com" style="color:#f5c000;text-decoration:none;font-weight:600">Judge My Driving</a> — Real feedback from real drivers on the road.
        </p>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: sticker.driver_email.trim(),
      subject,
      body,
    });
    sent++;
  }

  return Response.json({ sent, total: eligible.length });
});