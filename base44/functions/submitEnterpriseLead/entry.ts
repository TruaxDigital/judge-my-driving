import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { firstName, lastName, company, fleetSize, industry, email, phone, inquiryType, planContext } = body;

    if (!firstName || !lastName || !email) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Look up Aaron's owner ID
    let ownerId = null;
    try {
      const ownersRes = await fetch('https://api.hubapi.com/crm/v3/owners?limit=100', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const ownersData = await ownersRes.json();
      const ownersList = ownersData.results || ownersData || [];
      const aaron = ownersList.find(
        (o) => o.email?.toLowerCase() === 'aaron@judgemydriving.com'
      );
      if (aaron) ownerId = aaron.id;
      console.log(`HubSpot owner lookup: found ${ownersList.length} owners, aaron=${ownerId}`);
    } catch (e) {
      console.error('Owner lookup failed:', e.message);
    }

    // Check if contact already exists
    let contactId = null;
    try {
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
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

    const contactProperties = {
      firstname: firstName,
      lastname: lastName,
      company,
      email,
      ...(phone ? { phone } : {}),
      ...(fleetSize ? { fleet_size: fleetSize } : {}),
      ...(industry ? { industry } : {}),
      lifecyclestage: 'lead',
      hs_lead_status: 'NEW',
      ...(ownerId ? { hubspot_owner_id: ownerId } : {}),
    };

    if (contactId) {
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: contactProperties }),
      });
      console.log(`Updated existing HubSpot contact ${contactId} for ${email}`);
    } else {
      const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: contactProperties }),
      });
      const created = await createRes.json();
      contactId = created.id;
      console.log(`Created HubSpot contact ${contactId} for ${email}`);
    }

    // Create a deal linked to the contact
    const inquiryLabel = inquiryType === 'demo' ? 'Demo Request' : 'Sales Inquiry';
    const companyLabel = company || `${firstName} ${lastName}`;
    const planLabel = planContext ? ` – ${planContext}` : '';
    const dealName = `${inquiryLabel}: ${companyLabel}${planLabel}`;

    const dealDescription = [
      `Name: ${firstName} ${lastName}`,
      company ? `Company: ${company}` : null,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      fleetSize ? `Fleet Size: ${fleetSize}` : null,
      industry ? `Industry: ${industry}` : null,
      planContext ? `Plan Interest: ${planContext}` : null,
      `Source: Fleet Landing Page`,
    ].filter(Boolean).join('\n');

    const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          dealname: dealName,
          dealstage: 'appointmentscheduled',
          pipeline: 'default',
          closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: dealDescription,
          ...(fleetSize ? { fleet_size: fleetSize } : {}),
          ...(industry ? { industry } : {}),
          ...(ownerId ? { hubspot_owner_id: ownerId } : {}),
        },
        associations: [{
          to: { id: String(contactId) },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
        }],
      }),
    });

    if (!dealRes.ok) {
      const dealErr = await dealRes.json();
      console.error('Deal create error:', JSON.stringify(dealErr));
    } else {
      const deal = await dealRes.json();
      console.log(`Created HubSpot deal ${deal.id} for ${email} (${inquiryLabel})`);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('submitEnterpriseLead error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});