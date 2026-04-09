import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = base44.asServiceRole;
  const partners = await service.entities.ReferralPartner.filter({ status: 'active' });

  const now = new Date();
  const weekEnding = now.toISOString().split('T')[0];

  const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

  const snapshots = [];

  for (const partner of partners) {
    const allConversions = await service.entities.ReferralConversion.filter({ partner_id: partner.id });

    const conv30 = allConversions.filter(c => c.created_date >= daysAgo(30));
    const conv7 = allConversions.filter(c => c.created_date >= daysAgo(7));

    const commissionLifetime = allConversions
      .filter(c => c.commission_status === 'paid')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

    const commissionPending = allConversions
      .filter(c => c.commission_status === 'pending')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

    const commission7d = conv7
      .filter(c => c.commission_status === 'paid')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

    const sorted = [...allConversions].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const lastConversionDate = sorted[0]?.created_date?.split('T')[0] || null;
    const daysSince = lastConversionDate
      ? Math.floor((now - new Date(lastConversionDate)) / 86400000)
      : 999;

    let tier = 'cold';
    if (conv7.length >= 3) tier = 'top';
    else if (conv7.length >= 1) tier = 'hot';
    else if (conv30.length >= 1) tier = 'warm';

    const snapshot = {
      partner_id: partner.id,
      week_ending: weekEnding,
      conversions_7d: conv7.length,
      conversions_30d: conv30.length,
      commission_earned_7d: commission7d,
      commission_earned_lifetime: commissionLifetime,
      commission_pending: commissionPending,
      total_conversions_lifetime: allConversions.length,
      last_conversion_date: lastConversionDate,
      days_since_last_conversion: daysSince,
      tier,
    };

    await service.entities.PartnerActivitySnapshot.create(snapshot);
    snapshots.push({ ...snapshot, partner_name: partner.partner_name, contact_email: partner.contact_email });
  }

  console.log(`Built ${snapshots.length} partner activity snapshots for week ending ${weekEnding}`);
  return Response.json({ success: true, snapshots });
});