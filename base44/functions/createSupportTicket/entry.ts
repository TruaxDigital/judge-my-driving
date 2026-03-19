import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, planType, issueType, message } = await req.json();

  const ticketName = `Support Request - ${issueType} - ${email}`;
  const description = `Name: ${name}
Email: ${email}
Plan Type: ${planType}
Issue Type: ${issueType}

Message:
${message}`;

  // Try HubSpot ticket creation
  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');

    // Find or create contact by email
    let contactId = null;
    try {
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
          properties: ['email'],
          limit: 1,
        }),
      });
      const searchData = await searchRes.json();
      if (searchData.results && searchData.results.length > 0) {
        contactId = searchData.results[0].id;
      }
    } catch (e) {
      console.warn('Could not find HubSpot contact:', e.message);
    }

    // Create the ticket
    const ticketRes = await fetch('https://api.hubapi.com/crm/v3/objects/tickets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          subject: ticketName,
          content: description,
          hs_pipeline: '0',
          hs_pipeline_stage: '1',
          hs_ticket_priority: 'MEDIUM',
        },
      }),
    });

    if (!ticketRes.ok) {
      const err = await ticketRes.text();
      console.error('HubSpot ticket creation failed:', err);
      throw new Error('HubSpot ticket creation failed');
    }

    const ticket = await ticketRes.json();
    console.log('HubSpot ticket created:', ticket.id);

    // Associate ticket with contact if found
    if (contactId) {
      try {
        await fetch(`https://api.hubapi.com/crm/v3/objects/tickets/${ticket.id}/associations/contacts/${contactId}/ticket_to_contact`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        console.log('Associated ticket with contact:', contactId);
      } catch (e) {
        console.warn('Could not associate ticket with contact:', e.message);
      }
    }

    return Response.json({ success: true, method: 'hubspot' });

  } catch (hubspotErr) {
    console.error('HubSpot failed, falling back to email:', hubspotErr.message);

    // Fallback: send email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'support@judgemydriving.com',
        subject: ticketName,
        body: `<pre style="font-family: sans-serif; font-size: 14px;">${description}</pre>`,
      });
      console.log('Fallback email sent successfully');
      return Response.json({ success: true, method: 'email' });
    } catch (emailErr) {
      console.error('Email fallback also failed:', emailErr.message);
      return Response.json({ success: false, error: 'All submission methods failed' }, { status: 500 });
    }
  }
});