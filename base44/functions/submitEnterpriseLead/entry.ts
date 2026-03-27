import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Aaron's HubSpot owner ID — looked up via HubSpot owners API
// We'll resolve it dynamically from the authorized connector
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { firstName, lastName, company, fleetSize, email, phone } = body;

    if (!firstName || !lastName || !email || !company) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Look up Aaron's owner ID by email
    let ownerId = null;
    try {
      const ownersRes = await fetch('https://api.hubapi.com/crm/v3/owners?limit=100', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const ownersData = await ownersRes.json();
      const aaron = (ownersData.results || []).find(
        (o) => o.email?.toLowerCase() === 'aaron@judgemydriving.com'
      );
      if (aaron) ownerId = aaron.id;
      console.log(`HubSpot owner lookup: found ${ownersData.results?.length} owners, aaron=${ownerId}`);
    } catch (e) {
      console.error('Owner lookup failed:', e.message);
    }

    // Check if contact already exists
    let contactId = null;
    try {
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
          limit: 1,
        }),
      });
      const searchData = await searchRes.json();
      if (searchData.total > 0) contactId = searchData.results[0].id;
    } catch (e) {
      console.error('Contact search failed:', e.message);
    }

    const properties = {
      firstname: firstName,
      lastname: lastName,
      company,
      email,
      ...(phone ? { phone } : {}),
      ...(fleetSize ? { fleet_size: fleetSize } : {}),
      lifecyclestage: 'lead',
      hs_lead_status: 'NEW',
      ...(ownerId ? { hubspot_owner_id: ownerId } : {}),
    };

    if (contactId) {
      // Update existing contact
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
      console.log(`Updated existing HubSpot contact ${contactId} for ${email}`);
    } else {
      // Create new contact
      const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
      const created = await createRes.json();
      contactId = created.id;
      console.log(`Created HubSpot contact ${contactId} for ${email}`);
    }

    // Notify Aaron by email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'aaron@judgemydriving.com',
      subject: `New Enterprise Lead: ${firstName} ${lastName} — ${company}`,
      body: `<div style="font-family: Inter, sans-serif; max-width: 500px;">
        <h2 style="color: #FACC15;">New Enterprise Fleet Inquiry</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#888;width:120px">Name</td><td style="padding:6px 0;font-weight:600">${firstName} ${lastName}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Company</td><td style="padding:6px 0;font-weight:600">${company}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Fleet Size</td><td style="padding:6px 0;font-weight:600">${fleetSize || 'Not specified'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#888">Phone</td><td style="padding:6px 0">${phone || 'Not provided'}</td></tr>
        </table>
        ${contactId ? `<p style="margin-top:16px"><a href="https://app.hubspot.com/contacts/${contactId}" style="color:#FACC15">View in HubSpot →</a></p>` : ''}
      </div>`,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('submitEnterpriseLead error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});