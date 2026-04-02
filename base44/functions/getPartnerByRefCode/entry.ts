import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ref_code } = await req.json();

    if (!ref_code) {
      return Response.json({ partner: null });
    }

    const records = await base44.asServiceRole.entities.ReferralPartner.filter({ ref_code });
    if (records.length === 0) {
      return Response.json({ partner: null });
    }

    const { partner_name, ref_code: code, status } = records[0];
    return Response.json({ partner: { partner_name, ref_code: code, status } });
  } catch (error) {
    console.error('[getPartnerByRefCode] Error:', error.message);
    return Response.json({ partner: null });
  }
});