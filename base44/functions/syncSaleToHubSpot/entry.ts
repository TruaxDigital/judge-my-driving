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

async function upsertLineItems(accessToken, dealId, sale) {
  // Delete existing line items on this deal first
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

  const lineItems = [];

  // Main subscription
  const planProductId = HUBSPOT_PRODUCT_IDS[sale.plan_tier];
  if (planProductId) {
    lineItems.push({
      name: sale.plan_tier.replace(/_/g, ' ') + ' Plan',
      hs_product_id: planProductId,
      quantity: 1,
      price: sale.subscription_amount || 0,
      recurringbillingfrequency: 'annually',
    });
  }

  // Additional stickers
  if (sale.additional_stickers_sold > 0) {
    const isFleet = sale.plan_tier.includes('fleet');
    const addonId = isFleet ? HUBSPOT_PRODUCT_IDS.addon_sticker_fleet : HUBSPOT_PRODUCT_IDS.addon_sticker_family;
    lineItems.push({
      name: 'Additional Sticker',
      hs_product_id: addonId,
      quantity: sale.additional_stickers_sold,
      price: isFleet ? 79 : 29,
    });
  }

  // Replacement stickers
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

    // Get the sale record
    const sales = await base44.asServiceRole.entities.Sale.filter({ id: sale_id });
    if (sales.length === 0) {
      return Response.json({ error: 'Sale not found' }, { status: 404 });
    }

    const sale = sales[0];

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Sync or create contact (upsert by email)
    let contactId = sale.hubspot_contact_id;
    if (!contactId) {
      // Search for existing contact by email first
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: sale.email }] }],
          limit: 1,
        }),
      });
      const searchData = await searchRes.json();
      if (searchData.results?.length > 0) {
        contactId = searchData.results[0].id;
        console.log(`Found existing HubSpot contact ${contactId} for ${sale.email}`);
        // Update lifecyclestage
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: { lifecyclestage: sale.status === 'active' ? 'customer' : 'lead' } }),
        });
      } else {
        const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            properties: {
              email: sale.email,
              firstname: sale.full_name?.split(' ')[0] || '',
              lastname: sale.full_name?.split(' ').slice(1).join(' ') || '',
              lifecyclestage: sale.status === 'active' ? 'customer' : 'lead',
            },
          }),
        });
        if (!contactResponse.ok) {
          throw new Error(`Failed to create HubSpot contact: ${contactResponse.statusText}`);
        }
        const contactData = await contactResponse.json();
        contactId = contactData.id;
        console.log(`Created HubSpot contact ${contactId} for sale ${sale_id}`);
      }
    }

    // Sync or create deal
    let dealId = sale.hubspot_deal_id;
    if (!dealId) {
      const dealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            dealname: `${sale.full_name} - ${sale.plan_tier.replace(/_/g, ' ')} Plan`,
            dealstage: sale.status === 'active' ? 'closedwon' : 'closedlost',
            amount: sale.total_revenue || sale.subscription_amount || 0,
            closedate: new Date().toISOString(),
            pipeline: 'default',
          },
          associations: [
            {
              to: { id: contactId },
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
            },
          ],
        }),
      });

      if (!dealResponse.ok) {
        const errBody = await dealResponse.json();
        console.error('Deal create error:', JSON.stringify(errBody));
        throw new Error(`Failed to create HubSpot deal: ${dealResponse.statusText}`);
      }

      const dealData = await dealResponse.json();
      dealId = dealData.id;
      console.log(`Created HubSpot deal ${dealId} for sale ${sale_id}`);
    } else {
      // Update existing deal
      await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            amount: sale.total_revenue || sale.subscription_amount || 0,
            dealstage: sale.status === 'active' ? 'closedwon' : 'closedlost',
          },
        }),
      });
      console.log(`Updated HubSpot deal ${dealId} for sale ${sale_id}`);
    }

    // Sync line items to deal
    await upsertLineItems(accessToken, dealId, sale);

    // Update sale record with HubSpot IDs
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