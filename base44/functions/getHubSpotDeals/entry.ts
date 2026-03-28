import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get HubSpot access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Fetch all deals
    const dealsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,dealstage,amount,closedate,pipeline,hubspot_owner_id', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!dealsResponse.ok) {
      throw new Error(`HubSpot API error: ${dealsResponse.statusText}`);
    }

    const dealsData = await dealsResponse.json();
    const deals = dealsData.results || [];

    // Fetch contacts to enrich deal data with subscription info
    const contactsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=email,firstname,lastname,hs_lead_status,lifecyclestage', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const contactsData = await contactsResponse.json();
    const contacts = contactsData.results || [];
    const contactMap = {};
    for (const contact of contacts) {
      contactMap[contact.id] = contact.properties;
    }

    // Transform deals
    const transformedDeals = deals.map(deal => {
      const props = deal.properties;
      const amount = parseFloat(props.amount) || 0;
      const closeDate = props.closedate ? new Date(parseInt(props.closedate)).toISOString().split('T')[0] : null;
      const stage = props.dealstage || 'unknown';

      return {
        id: deal.id,
        name: props.dealname || 'Unnamed Deal',
        stage: stage,
        amount: amount,
        closeDate: closeDate,
        pipeline: props.pipeline || 'default',
        associations: deal.associations || {},
      };
    });

    // Calculate metrics
    const closedWonDeals = transformedDeals.filter(d => d.stage === 'closedwon');
    const openDeals = transformedDeals.filter(d => d.stage === 'negotiation' || d.stage === 'presentation');
    const totalRevenue = closedWonDeals.reduce((sum, d) => sum + d.amount, 0);

    // Monthly revenue (deals closed in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRevenue = closedWonDeals
      .filter(d => d.closeDate && new Date(d.closeDate) >= thirtyDaysAgo)
      .reduce((sum, d) => sum + d.amount, 0);

    // New deals (created in last 30 days)
    const newDeals = transformedDeals
      .filter(d => {
        const created = new Date(deal.created_at || deal.createdAt || 0);
        return created >= thirtyDaysAgo;
      })
      .length;

    return Response.json({
      success: true,
      data: {
        allDeals: transformedDeals,
        totalDeals: transformedDeals.length,
        openDeals: openDeals,
        closedWonDeals: closedWonDeals,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
        newDealsLastMonth: newDeals,
        metrics: {
          totalRevenue,
          monthlyRevenue,
          openDealsCount: openDeals.length,
          closedDealsCount: closedWonDeals.length,
          newDealsCount: newDeals,
        }
      }
    });
  } catch (error) {
    console.error('[getHubSpotDeals] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});