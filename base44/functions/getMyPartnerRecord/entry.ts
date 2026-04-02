import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Finds and links the partner record for the authenticated user.
// Uses service role to bypass RLS (needed when user_id is null on the record).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First try by user_id
    let records = await base44.asServiceRole.entities.ReferralPartner.filter({ user_id: user.id });
    if (records.length > 0) {
      return Response.json({ partner: records[0] });
    }

    // Fallback: match by contact_email (signed up via public form before logging in)
    records = await base44.asServiceRole.entities.ReferralPartner.filter({ contact_email: user.email });
    if (records.length > 0) {
      // Link user_id and ensure role is set to partner
      const updated = await base44.asServiceRole.entities.ReferralPartner.update(records[0].id, { user_id: user.id });
      await base44.asServiceRole.entities.User.update(user.id, { role: 'partner', is_partner: true });
      console.log(`[getMyPartnerRecord] Linked partner record to user ${user.email} and set role=partner`);
      return Response.json({ partner: { ...records[0], ...updated, user_id: user.id } });
    }

    return Response.json({ partner: null });
  } catch (error) {
    console.error('[getMyPartnerRecord] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});