import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const { fleet_referral_id } = await req.json();
    if (!fleet_referral_id) return Response.json({ error: 'fleet_referral_id required' }, { status: 400 });

    const referrals = await base44.asServiceRole.entities.FleetReferral.filter({ id: fleet_referral_id });
    if (!referrals.length) return Response.json({ error: 'FleetReferral not found' }, { status: 404 });
    const fr = referrals[0];

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Find/create contact
    const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: fr.contact_email }] }] }),
    });
    const searchData = await searchRes.json();

    const nameParts = (fr.contact_name || '').trim().split(/\s+/);
    const contactProps = {
      firstname: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      email: fr.contact_email,
      phone: fr.contact_phone || '',
      company: fr.company_name,
      referred_by_partner: fr.partner_name || '',
      lead_source_detail: 'Partner Fleet Referral',
    };
    if (fr.estimated_fleet_size) contactProps.fleet_size = String(fr.estimated_fleet_size);

    let contactId;
    if (searchData.results?.length > 0) {
      contactId = searchData.results[0].id;
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: contactProps }),
      });
    } else {
      const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: contactProps }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(`Contact create failed: ${JSON.stringify(createData)}`);
      contactId = createData.id;
    }

    // Find pipeline stage
    const pipelinesRes = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const pipelinesData = await pipelinesRes.json();
    let stageId = null, pipelineId = null;
    for (const pipeline of (pipelinesData.results || [])) {
      for (const stage of (pipeline.stages || [])) {
        if (stage.label === 'Partner Referral Submitted') {
          stageId = stage.id; pipelineId = pipeline.id; break;
        }
      }
      if (stageId) break;
    }
    if (!stageId && pipelinesData.results?.length > 0) {
      pipelineId = pipelinesData.results[0].id;
      stageId = pipelinesData.results[0].stages?.[0]?.id;
    }

    const dealProps = {
      dealname: `${fr.company_name} - Partner Fleet Referral`,
      referred_by_partner: fr.partner_name || '',
      partner_ref_code: fr.ref_code || '',
    };
    if (pipelineId) dealProps.pipeline = pipelineId;
    if (stageId) dealProps.dealstage = stageId;

    let dealId = fr.hubspot_deal_id;
    if (!dealId) {
      const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: dealProps }),
      });
      const dealData = await dealRes.json();
      if (!dealRes.ok) throw new Error(`Deal create failed: ${JSON.stringify(dealData)}`);
      dealId = dealData.id;
    }

    // Associate deal to contact
    await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    // Update FleetReferral
    await base44.asServiceRole.entities.FleetReferral.update(fleet_referral_id, {
      hubspot_contact_id: contactId,
      hubspot_deal_id: dealId,
      hubspot_sync_status: 'synced',
    });

    console.log(`[retryFleetReferralSync] Successfully synced FleetReferral ${fleet_referral_id}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[retryFleetReferralSync] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});