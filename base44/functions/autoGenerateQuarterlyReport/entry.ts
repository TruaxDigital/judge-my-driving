import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Determine which quarter just ended
    let quarterLabel, periodStart, periodEnd;
    if (month === 4) {
      quarterLabel = `Q1 ${year}`;
      periodStart = `${year}-01-01`;
      periodEnd = `${year}-03-31`;
    } else if (month === 7) {
      quarterLabel = `Q2 ${year}`;
      periodStart = `${year}-04-01`;
      periodEnd = `${year}-06-30`;
    } else if (month === 10) {
      quarterLabel = `Q3 ${year}`;
      periodStart = `${year}-07-01`;
      periodEnd = `${year}-09-30`;
    } else if (month === 1) {
      quarterLabel = `Q4 ${year - 1}`;
      periodStart = `${year - 1}-10-01`;
      periodEnd = `${year - 1}-12-31`;
    } else {
      return Response.json({ message: 'Not a quarter start month, skipping.' });
    }

    // Check if report already exists for this quarter
    const existing = await base44.asServiceRole.entities.PayoutReport.filter({ quarter_label: quarterLabel });
    if (existing.length > 0) {
      return Response.json({ message: `Report for ${quarterLabel} already exists.` });
    }

    // Get all pending conversions in the period
    const allConversions = await base44.asServiceRole.entities.ReferralConversion.filter({ commission_status: 'pending' });
    const periodConversions = allConversions.filter(c => {
      const d = c.conversion_date || c.created_date?.slice(0, 10);
      return d >= periodStart && d <= periodEnd;
    });

    const totalAmount = periodConversions.reduce((s, c) => s + (c.commission_amount || 10), 0);
    const partnerIds = [...new Set(periodConversions.map(c => c.partner_id))];

    await base44.asServiceRole.entities.PayoutReport.create({
      quarter_label: quarterLabel,
      period_start: periodStart,
      period_end: periodEnd,
      generated_at: now.toISOString(),
      total_amount: totalAmount,
      total_partners: partnerIds.length,
      partners_paid: 0,
      status: 'open',
      is_manual: false,
      date_range_label: `${periodStart} to ${periodEnd}`,
    });

    // Notify all admin users
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    await Promise.all(
      admins.map(admin =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `Your ${quarterLabel} partner payout report is ready to review`,
          body: `<h2>${quarterLabel} Payout Report Ready</h2><p>Your payout report has been auto-generated.</p><p><strong>Partners:</strong> ${partnerIds.length}</p><p><strong>Total amount:</strong> $${totalAmount}</p><p>Log in to review and confirm payments.</p>`,
        })
      )
    );

    console.log(`[autoGenerateQuarterlyReport] Generated ${quarterLabel}: ${partnerIds.length} partners, $${totalAmount}`);
    return Response.json({ success: true, quarter_label: quarterLabel, total_amount: totalAmount });
  } catch (error) {
    console.error('[autoGenerateQuarterlyReport] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});