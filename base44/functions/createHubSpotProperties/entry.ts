import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// One-time utility: creates fleet_size and industry dropdown properties on both
// HubSpot Contact and Deal objects. Safe to re-run (skips if already exists).

async function createProperty(accessToken, objectType, definition) {
  const res = await fetch(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(definition),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.category === 'VALIDATION_ERROR' && data.message?.includes('already exists')) {
      console.log(`Property "${definition.name}" already exists on ${objectType} — skipping.`);
      return { skipped: true };
    }
    console.error(`Failed to create ${definition.name} on ${objectType}:`, JSON.stringify(data));
    return { error: data };
  }
  console.log(`Created property "${definition.name}" on ${objectType}`);
  return { created: true };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    const fleetSizeDef = {
      name: 'fleet_size',
      label: 'Fleet Size',
      type: 'enumeration',
      fieldType: 'select',
      groupName: 'contactinformation',
      options: [
        { label: '1-9 vehicles', value: '1-9', displayOrder: 0, hidden: false },
        { label: '10-24 vehicles', value: '10-24', displayOrder: 1, hidden: false },
        { label: '25-49 vehicles', value: '25-49', displayOrder: 2, hidden: false },
        { label: '50+ vehicles', value: '50+', displayOrder: 3, hidden: false },
      ],
    };

    const industryDef = {
      name: 'industry',
      label: 'Industry',
      type: 'enumeration',
      fieldType: 'select',
      groupName: 'contactinformation',
      options: [
        { label: 'HVAC', value: 'hvac', displayOrder: 0, hidden: false },
        { label: 'Plumbing', value: 'plumbing', displayOrder: 1, hidden: false },
        { label: 'Electrical', value: 'electrical', displayOrder: 2, hidden: false },
        { label: 'Landscaping', value: 'landscaping', displayOrder: 3, hidden: false },
        { label: 'Delivery / Courier', value: 'delivery', displayOrder: 4, hidden: false },
        { label: 'Property Management', value: 'property-mgmt', displayOrder: 5, hidden: false },
        { label: 'Pest Control', value: 'pest-control', displayOrder: 6, hidden: false },
        { label: 'Cleaning Services', value: 'cleaning', displayOrder: 7, hidden: false },
        { label: 'Construction', value: 'construction', displayOrder: 8, hidden: false },
        { label: 'Towing', value: 'towing', displayOrder: 9, hidden: false },
        { label: 'Mobile Healthcare', value: 'healthcare', displayOrder: 10, hidden: false },
        { label: 'Waste Management', value: 'waste-mgmt', displayOrder: 11, hidden: false },
        { label: 'Other', value: 'other', displayOrder: 12, hidden: false },
      ],
    };

    const results = {};

    // Contacts
    results.contact_fleet_size = await createProperty(accessToken, 'contacts', fleetSizeDef);
    results.contact_industry = await createProperty(accessToken, 'contacts', {
      ...industryDef,
      groupName: 'contactinformation',
    });

    // Deals — use dealinformation group
    results.deal_fleet_size = await createProperty(accessToken, 'deals', {
      ...fleetSizeDef,
      groupName: 'dealinformation',
    });
    results.deal_industry = await createProperty(accessToken, 'deals', {
      ...industryDef,
      groupName: 'dealinformation',
    });

    // Partner-specific properties on Contacts
    results.contact_referred_by_partner = await createProperty(accessToken, 'contacts', {
      name: 'referred_by_partner',
      label: 'Referred By Partner',
      type: 'string',
      fieldType: 'text',
      groupName: 'contactinformation',
      description: 'Name of the JMD partner who referred this fleet contact',
    });
    results.contact_lead_source_detail = await createProperty(accessToken, 'contacts', {
      name: 'lead_source_detail',
      label: 'Lead Source Detail',
      type: 'string',
      fieldType: 'text',
      groupName: 'contactinformation',
      description: 'Detailed source of this lead',
    });

    // Partner-specific properties on Deals
    results.deal_referred_by_partner = await createProperty(accessToken, 'deals', {
      name: 'referred_by_partner',
      label: 'Referred By Partner',
      type: 'string',
      fieldType: 'text',
      groupName: 'dealinformation',
      description: 'Name of the JMD partner who referred this fleet deal',
    });
    results.deal_partner_ref_code = await createProperty(accessToken, 'deals', {
      name: 'partner_ref_code',
      label: 'Partner Ref Code',
      type: 'string',
      fieldType: 'text',
      groupName: 'dealinformation',
      description: 'Ref code of the referring partner, for cross-reference back to Base44',
    });

    return Response.json({ success: true, results });
  } catch (err) {
    console.error('createHubSpotProperties error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});