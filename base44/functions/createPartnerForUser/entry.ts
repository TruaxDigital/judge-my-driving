import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Admin-only function to manually create a partner record for a user by email
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, partner_name, channel_type, contact_name, location } = await req.json();
    
    if (!email || !partner_name || !channel_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const targetUser = users[0];

    // Create ref code
    const baseCode = channel_type.slice(0, 3).toLowerCase() + '-' + partner_name.toLowerCase().slice(0, 8).replace(/[^a-z]/g, '');
    let refCode = baseCode;
    let counter = 2;
    while (true) {
      const existing = await base44.asServiceRole.entities.ReferralPartner.filter({ ref_code: refCode });
      if (existing.length === 0) break;
      refCode = baseCode.slice(0, 20) + '-' + counter;
      counter++;
    }

    // Create partner record
    const partner = await base44.asServiceRole.entities.ReferralPartner.create({
      user_id: targetUser.id,
      partner_name,
      channel_type,
      contact_name: contact_name || partner_name,
      contact_email: email,
      ref_code: refCode,
      location: location || '',
      payout_method: 'venmo',
      payout_details: '',
      status: 'active',
    });

    console.log(`[createPartnerForUser] Created partner ${partner_name} for ${email} with ref_code ${refCode}`);
    return Response.json({ success: true, partner, ref_code: refCode });
  } catch (error) {
    console.error('[createPartnerForUser] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});