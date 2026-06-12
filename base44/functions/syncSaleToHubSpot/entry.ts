import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// HubSpot Product IDs (from crm/v3/objects/products)
const HUBSPOT_PRODUCT_IDS = {
  individual:           '303135519474',
  family:               '303135519475',
  starter_fleet:        '303135519476',
  professional_fleet:   '303135519477',
  addon_sticker_family: '303108518606',
  addon_sticker_fleet:  '303108518607',
  replacement_sticker:  '303112121056',
};

const PLAN_LABEL = {
  individual:         'Individual',
  family:             'Family',
  starter_fleet:      'Starter Fleet',
  professional_fleet: 'Professional Fleet',
};

async function hubspotRequest(method, path, body, accessToken) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HubSpot ${method} ${path} => ${res.status}: ${err}`);
  }
  return res.json();
}

function buildContactProperties(sale) {
  const nameParts = (sale.full_name || '').trim().split(' ');
  return {
    email: sale.email,
    firstname: nameParts[0] || '',
    lastname: nameParts.slice(1).join(' ') || '',
    lifecyclestage: sale.status === 'active' ? 'customer' : 'lead',
    hs_marketing_contact_status: 'MARKETING_CONTACT',   // opt-in to marketing
    jmd_buying_tier: PLAN_LABEL[sale.plan_tier] || sale.plan_tier || '',
    jmd_last_purchase_date: sale.subscription_start_date || new Date().toISOString().split('T')[0],
    ...(sale.stripe_customer_id      ? { jmd_stripe_customer_id: sale.stripe_customer_id }           : {}),
    ...(sale.stripe_subscription_id  ? { jmd_stripe_subscription_id: sale.stripe_subscription_id }   : {}),
  };
}

function buildDealProperties(sale) {
  const planLabel = PLAN_LABEL[sale.plan_tier] || sale.plan_tier || '';
  const name = sale.full_name || sale.email || 'Unknown';
  return {
    dealname: `${name} — ${planLabel} Plan`,
    dealstage: sale.status === 'active' ? 'closedwon' : 'closedlost',
    amount: String(sale.total_revenue || sale.subscription_amount || 0),
    closedate: sale.subscription_start_date
      ? new Date(sale.subscription_start_date).toISOString()
      : new Date().toISOString(),
    pipeline: 'default',
    description: `Plan: ${planLabel} | Stripe customer: ${sale.stripe_customer_id || 'n/a'} | Sub: ${sale.stripe_subscription_id || 'n/a'}`,
    ...(sale.stripe_customer_id      ? { jmd_stripe_customer_id: sale.stripe_customer_id }           : {}),
    ...(sale.stripe_subscription_id  ? { jmd_stripe_subscription_id: sale.stripe_subscription_id }   : {}),
  };
}

async function upsertLineItems(accessToken, dealId, sale) {
  // Delete existing line items on this deal first
  try {
    const existingRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/line_items?associations.dealId=${dealId}&limit=50`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    if (existingRes.ok) {
      const existing = await existingRes.json();
      for (const item of (existing.results || [])) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/line_items/${item.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
      }
    }
  } catch (e) {
    console.error('Failed to clear line items:', e.message);
  }

  const lineItems = [];

  const planProductId = HUBSPOT_PRODUCT_IDS[sale.plan_tier];
  if (planProductId) {
    lineItems.push({
      name: (PLAN_LABEL[sale.plan_tier] || sale.plan_tier) + ' Plan',
      hs_product_id: planProductId,
      quantity: 1,
      price: sale.subscription_amount || 0,
      recurringbillingfrequency: 'annually',
    });
  }

  if (sale.additional_stickers_sold > 0) {
    const isFleet = sale.plan_tier?.includes('fleet');
    const addonId = isFleet ? HUBSPOT_PRODUCT_IDS.addon_sticker_fleet : HUBSPOT_PRODUCT_IDS.addon_sticker_family;
    lineItems.push({
      name: 'Additional Sticker',
      hs_product_id: addonId,
      quantity: sale.additional_stickers_sold,
      price: isFleet ? 79 : 29,
    });
  }

  if (sale.replacement_stickers_sold > 0) {
    lineItems.push({
      name: 'Replacement Sticker',
      hs_product_id: HUBSPOT_PRODUCT_IDS.replacement_sticker,
      quantity: sale.replacement_stickers_sold,
      price: 19,
    });
  }

  for (const item of lineItems) {
    const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/line_items', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: item,
        associations: [{
          to: { id: dealId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 20 }],
        }],
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json();
      console.error('Failed to create line item:', JSON.stringify(err));
    } else {
      console.log(`Created line item: ${item.name} x${item.quantity}`);
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { sale_id } = await req.json();

    if (!sale_id) {
      return Response.json({ error: 'sale_id is required' }, { status: 400 });
    }

    const sales = await base44.asServiceRole.entities.Sale.filter({ id: sale_id });
    if (sales.length === 0) {
      return Response.json({ error: 'Sale not found' }, { status: 404 });
    }
    const sale = sales[0];

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // ── CONTACT ──────────────────────────────────────────────────────────────
    let contactId = sale.hubspot_contact_id;
    const contactProps = buildContactProperties(sale);

    if (!contactId) {
      // Search by email first
      const searchData = await hubspotRequest('POST', '/crm/v3/objects/contacts/search', {
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: sale.email }] }],
        properties: ['email'],
        limit: 1,
      }, accessToken);

      if (searchData.results?.length > 0) {
        contactId = searchData.results[0].id;
        await hubspotRequest('PATCH', `/crm/v3/objects/contacts/${contactId}`, { properties: contactProps }, accessToken);
        console.log(`Updated existing HubSpot contact ${contactId} for ${sale.email}`);
      } else {
        const created = await hubspotRequest('POST', '/crm/v3/objects/contacts', { properties: contactProps }, accessToken);
        contactId = created.id;
        console.log(`Created HubSpot contact ${contactId} for ${sale.email}`);
      }
    } else {
      // Always re-sync contact properties on every sale sync
      await hubspotRequest('PATCH', `/crm/v3/objects/contacts/${contactId}`, { properties: contactProps }, accessToken);
      console.log(`Re-synced HubSpot contact ${contactId}`);
    }

    // ── DEAL ─────────────────────────────────────────────────────────────────
    let dealId = sale.hubspot_deal_id;
    const dealProps = buildDealProperties(sale);

    if (!dealId) {
      const dealData = await hubspotRequest('POST', '/crm/v3/objects/deals', {
        properties: dealProps,
        associations: [{
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
        }],
      }, accessToken);
      dealId = dealData.id;
      console.log(`Created HubSpot deal ${dealId} (closedwon) for sale ${sale_id}`);
    } else {
      await hubspotRequest('PATCH', `/crm/v3/objects/deals/${dealId}`, { properties: dealProps }, accessToken);
      console.log(`Updated HubSpot deal ${dealId} for sale ${sale_id}`);
    }

    // ── LINE ITEMS ────────────────────────────────────────────────────────────
    await upsertLineItems(accessToken, dealId, sale);

    // ── SAVE IDs BACK ─────────────────────────────────────────────────────────
    await base44.asServiceRole.entities.Sale.update(sale_id, {
      hubspot_contact_id: contactId,
      hubspot_deal_id: dealId,
      last_sync_to_hubspot: new Date().toISOString(),
    });

    return Response.json({ success: true, contactId, dealId });
  } catch (error) {
    console.error('[syncSaleToHubSpot] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});