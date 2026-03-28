import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { period_start, period_end, quarter_label, is_manual } = await req.json();

    if (!period_start || !period_end || !quarter_label) {
      return Response.json({ error: 'period_start, period_end, and quarter_label are required' }, { status: 400 });
    }

    // Get all pending conversions in the period
    const allConversions = await base44.asServiceRole.entities.ReferralConversion.filter({ commission_status: 'pending' });
    const periodConversions = allConversions.filter(c => {
      const d = c.conversion_date || c.created_date?.slice(0, 10);
      return d >= period_start && d <= period_end;
    });

    const totalAmount = periodConversions.reduce((s, c) => s + (c.commission_amount || 10), 0);
    const partnerIds = [...new Set(periodConversions.map(c => c.partner_id))];

    const report = await base44.asServiceRole.entities.PayoutReport.create({
      quarter_label,
      period_start,
      period_end,
      generated_at: new Date().toISOString(),
      total_amount: totalAmount,
      total_partners: partnerIds.length,
      partners_paid: 0,
      status: 'open',
      is_manual: is_manual || false,
      date_range_label: `${period_start} to ${period_end}`,
    });

    console.log(`[generatePayoutReport] Generated report ${quarter_label}: ${partnerIds.length} partners, $${totalAmount}`);

    // Send email notification to admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `Your ${quarter_label} partner payout report is ready to review`,
      body: `<h2>${quarter_label} Payout Report Ready</h2><p>Your payout report for ${quarter_label} has been generated.</p><p><strong>Total partners:</strong> ${partnerIds.length}</p><p><strong>Total amount:</strong> $${totalAmount}</p><p>Log in to your admin dashboard to review and confirm payments.</p>`,
    });

    return Response.json({ success: true, report });
  } catch (error) {
    console.error('[generatePayoutReport] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});