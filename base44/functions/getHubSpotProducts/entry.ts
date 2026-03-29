import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    const res = await fetch('https://api.hubapi.com/crm/v3/objects/products?limit=50&properties=name,price', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const data = await res.json();
    console.log('HubSpot products raw:', JSON.stringify(data));
    return Response.json({ products: data.results, raw: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});