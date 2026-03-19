import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const HUBSPOT_API = 'https://api.hubapi.com';

const PLAN_LABEL = {
  individual: 'Individual',
  family: 'Family',
  starter_fleet: 'Starter Fleet',
  professional_fleet: 'Professional Fleet',
};

async function hubspotRequest(method, path, body, accessToken) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function findContactByEmail(email, accessToken) {
  const result = await hubspotRequest('POST', '/crm/v3/objects/contacts/search', {
    filterGroups: [{
      filters: [{ propertyName: 'email', operator: 'EQ', value: email }]
    }],
    properties: ['email', 'firstname', 'lastname', 'jmd_buying_tier', 'jmd_last_purchase_date', 'jmd_total_stickers'],
    limit: 1,
  }, accessToken);
  return result.results?.[0] || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    const { email, full_name, plan_tier, last_purchase_date, total_stickers } = await req.json();

    if (!email) {
      return Response.json({ error: 'email is required' }, { status: 400 });
    }

    // Split full name into first/last
    const nameParts = (full_name || '').trim().split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    // Build contact properties
    const properties = {
      email,
      firstname,
      lastname,
    };

    if (plan_tier) {
      properties.jmd_buying_tier = PLAN_LABEL[plan_tier] || plan_tier;
    }
    if (last_purchase_date) {
      properties.jmd_last_purchase_date = last_purchase_date;
    }
    if (total_stickers !== undefined) {
      properties.jmd_total_stickers = String(total_stickers);
    }

    // Search for existing contact
    const existing = await findContactByEmail(email, accessToken);

    if (existing) {
      // Update existing contact
      await hubspotRequest('PATCH', `/crm/v3/objects/contacts/${existing.id}`, { properties }, accessToken);
      console.log(`HubSpot: Updated contact for ${email} (id: ${existing.id})`);
      return Response.json({ success: true, action: 'updated', hubspot_id: existing.id });
    } else {
      // Create new contact
      const created = await hubspotRequest('POST', '/crm/v3/objects/contacts', { properties }, accessToken);
      console.log(`HubSpot: Created contact for ${email} (id: ${created.id})`);
      return Response.json({ success: true, action: 'created', hubspot_id: created.id });
    }

  } catch (err) {
    console.error('syncToHubSpot error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});