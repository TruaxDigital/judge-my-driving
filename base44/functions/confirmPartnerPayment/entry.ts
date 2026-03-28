import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { partner_id, period_start, period_end, quarter_label, report_id } = await req.json();

    if (!partner_id || !period_start || !period_end) {
      return Response.json({ error: 'partner_id, period_start, period_end required' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Get all pending conversions for this partner in the period
    const allConversions = await base44.asServiceRole.entities.ReferralConversion.filter({
      partner_id,
      commission_status: 'pending',
    });

    const periodConversions = allConversions.filter(c => {
      const d = c.conversion_date || c.created_date?.slice(0, 10);
      return d >= period_start && d <= period_end;
    });

    // Mark all as paid
    await Promise.all(
      periodConversions.map(c =>
        base44.asServiceRole.entities.ReferralConversion.update(c.id, {
          commission_status: 'paid',
          paid_date: today,
          payout_period: quarter_label || '',
        })
      )
    );

    console.log(`[confirmPartnerPayment] Marked ${periodConversions.length} conversions as paid for partner ${partner_id}`);

    // Update report partners_paid count
    if (report_id) {
      const reports = await base44.asServiceRole.entities.PayoutReport.filter({ id: report_id });
      if (reports.length > 0) {
        const report = reports[0];
        await base44.asServiceRole.entities.PayoutReport.update(report_id, {
          partners_paid: (report.partners_paid || 0) + 1,
        });
      }
    }

    return Response.json({ success: true, conversions_updated: periodConversions.length });
  } catch (error) {
    console.error('[confirmPartnerPayment] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});