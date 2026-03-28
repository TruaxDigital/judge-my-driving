import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    // Sync or create contact
    let contactId = sale.hubspot_contact_id;
    if (!contactId) {
      const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationType: 'contact_to_deal' }],
              id: contactId,
            },
          ],
        }),
      });

      if (!dealResponse.ok) {
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