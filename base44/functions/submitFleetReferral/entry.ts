import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { contact_name, company_name, contact_email, contact_phone, estimated_fleet_size, notes } = body;

    if (!contact_name || !company_name || !contact_email) {
      return Response.json({ error: 'contact_name, company_name, and contact_email are required' }, { status: 400 });
    }

    // Find the partner's ReferralPartner record to get ref_code
    let partnerRecord = null;
    const partnerRecords = await base44.asServiceRole.entities.ReferralPartner.filter({ user_id: user.id });
    if (partnerRecords.length > 0) partnerRecord = partnerRecords[0];

    const today = new Date().toISOString().slice(0, 10);

    // Step 1: Save FleetReferral record
    const fleetReferral = await base44.asServiceRole.entities.FleetReferral.create({
      partner_id: user.id,
      partner_name: user.full_name,
      contact_name,
      company_name,
      contact_email,
      contact_phone: contact_phone || '',
      estimated_fleet_size: estimated_fleet_size || null,
      notes: notes || '',
      status: 'Submitted',
      commission_amount: 100,
      hubspot_sync_status: 'pending',
      submitted_date: today,
      status_updated_date: today,
      ref_code: partnerRecord?.ref_code || '',
    });

    console.log(`[submitFleetReferral] Created FleetReferral ${fleetReferral.id} for partner ${user.id}`);

    // Step 2-6: HubSpot sync
    let hubspotContactId = null;
    let hubspotDealId = null;
    let syncStatus = 'synced';

    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

      // Step 2: Create/update HubSpot contact
      const nameParts = contact_name.trim().split(/\s+/);
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: contact_email }] }]
        }),
      });
      const searchData = await searchRes.json();

      const contactProps = {
        firstname,
        lastname,
        email: contact_email,
        phone: contact_phone || '',
        company: company_name,
        referred_by_partner: user.full_name,
        lead_source_detail: 'Partner Fleet Referral',
      };
      if (estimated_fleet_size) contactProps.fleet_size = String(estimated_fleet_size);

      let contactId;
      if (searchData.results && searchData.results.length > 0) {
        contactId = searchData.results[0].id;
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: contactProps }),
        });
        console.log(`[submitFleetReferral] Updated HubSpot contact ${contactId}`);
      } else {
        const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: contactProps }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(`HubSpot contact create failed: ${JSON.stringify(createData)}`);
        contactId = createData.id;
        console.log(`[submitFleetReferral] Created HubSpot contact ${contactId}`);
      }
      hubspotContactId = contactId;

      // Step 3: Find "Partner Referral Submitted" pipeline stage
      const pipelinesRes = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const pipelinesData = await pipelinesRes.json();
      let stageId = null;
      let pipelineId = null;
      for (const pipeline of (pipelinesData.results || [])) {
        for (const stage of (pipeline.stages || [])) {
          if (stage.label === 'Partner Referral Submitted') {
            stageId = stage.id;
            pipelineId = pipeline.id;
            break;
          }
        }
        if (stageId) break;
      }
      // Fallback to first stage of first pipeline if not found
      if (!stageId && pipelinesData.results?.length > 0) {
        pipelineId = pipelinesData.results[0].id;
        stageId = pipelinesData.results[0].stages?.[0]?.id;
      }

      // Find Aaron Truax's owner ID
      const ownersRes = await fetch('https://api.hubapi.com/crm/v3/owners?limit=100', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const ownersData = await ownersRes.json();
      let ownerId = null;
      for (const owner of (ownersData.results || [])) {
        if ((owner.firstName + ' ' + owner.lastName).toLowerCase().includes('aaron truax') ||
            owner.email?.toLowerCase().includes('aaron')) {
          ownerId = owner.id;
          break;
        }
      }

      // Step 4: Create HubSpot deal
      const dealProps = {
        dealname: `${company_name} - Partner Fleet Referral`,
        referred_by_partner: user.full_name,
        partner_ref_code: partnerRecord?.ref_code || '',
      };
      if (pipelineId) dealProps.pipeline = pipelineId;
      if (stageId) dealProps.dealstage = stageId;
      if (ownerId) dealProps.hubspot_owner_id = ownerId;

      const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: dealProps }),
      });
      const dealData = await dealRes.json();
      if (!dealRes.ok) throw new Error(`HubSpot deal create failed: ${JSON.stringify(dealData)}`);
      hubspotDealId = dealData.id;
      console.log(`[submitFleetReferral] Created HubSpot deal ${hubspotDealId}`);

      // Step 5: Associate deal to contact
      await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${hubspotDealId}/associations/contacts/${hubspotContactId}/deal_to_contact`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

    } catch (hubspotErr) {
      console.error('[submitFleetReferral] HubSpot sync failed:', hubspotErr.message);
      syncStatus = 'failed';
    }

    // Step 6: Update FleetReferral with HubSpot IDs and sync status
    await base44.asServiceRole.entities.FleetReferral.update(fleetReferral.id, {
      hubspot_contact_id: hubspotContactId || '',
      hubspot_deal_id: hubspotDealId || '',
      hubspot_sync_status: syncStatus,
    });

    return Response.json({ success: true, fleet_referral_id: fleetReferral.id, hubspot_sync_status: syncStatus });
  } catch (error) {
    console.error('[submitFleetReferral] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});