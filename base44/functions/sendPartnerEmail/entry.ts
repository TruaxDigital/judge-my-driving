import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const service = base44.asServiceRole;

  // This function is called by the agent — no user auth needed, but validate the payload
  const { partner_id, subject, body, message_type, agent_reasoning } = await req.json();

  if (!partner_id || !subject || !body || !message_type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const partner = await service.entities.ReferralPartner.filter({ id: partner_id });
  const p = partner[0];
  if (!p) return Response.json({ error: 'Partner not found' }, { status: 404 });

  // Honor opt-out
  if (p.agent_messages_enabled === false) {
    return Response.json({ skipped: true, reason: 'opt_out' });
  }

  // Anti-spam: no same message_type to this partner in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const recentLogs = await service.entities.PartnerMessageLog.filter({ partner_id, message_type });
  const recentSent = recentLogs.filter(l => l.sent_at >= weekAgo);
  if (recentSent.length > 0) {
    return Response.json({ skipped: true, reason: 'recent_message', last_sent: recentSent[0].sent_at });
  }

  // Frequency cap: max 2 messages per week across all types
  const allRecentLogs = await service.entities.PartnerMessageLog.filter({ partner_id });
  const allThisWeek = allRecentLogs.filter(l => l.sent_at >= weekAgo);
  if (allThisWeek.length >= 2) {
    return Response.json({ skipped: true, reason: 'weekly_cap_reached' });
  }

  // Human review queue flag — set HUMAN_REVIEW_MODE=true in secrets to hold messages for approval
  const humanReview = Deno.env.get('PARTNER_AGENT_HUMAN_REVIEW') === 'true';
  if (humanReview) {
    // Log as pending and notify admin instead of sending
    await service.entities.PartnerMessageLog.create({
      partner_id,
      message_type,
      channel: 'email',
      subject: `[PENDING REVIEW] ${subject}`,
      body,
      sent_at: new Date().toISOString(),
      agent_reasoning: agent_reasoning || '',
      partner_responded: false,
    });

    // Notify admin
    await service.integrations.Core.SendEmail({
      to: 'partners@judgemydriving.com',
      subject: `[Review Required] Agent message for ${p.contact_name}`,
      body: `
        <p><strong>Partner:</strong> ${p.contact_name} (${p.contact_email})</p>
        <p><strong>Type:</strong> ${message_type}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Agent Reasoning:</strong> ${agent_reasoning || 'N/A'}</p>
        <hr />
        <p>${body.replace(/\n/g, '<br>')}</p>
        <hr />
        <p><em>Human review mode is ON. This message was NOT sent to the partner. Review in AdminPartners and send manually if approved.</em></p>
      `,
    });

    console.log(`[REVIEW QUEUED] ${message_type} for partner ${p.contact_name}`);
    return Response.json({ queued_for_review: true, partner: p.contact_name });
  }

  // Send the email
  await service.integrations.Core.SendEmail({
    to: p.contact_email,
    from_name: 'Judge My Driving Partner Team',
    subject,
    body: `<div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
      ${body.replace(/\n/g, '<br>')}
      <br><br>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">
        You're receiving this as a Judge My Driving referral partner.<br>
        Questions? Reply to this email or visit your <a href="https://app.judgemydriving.com/PartnerPortal">partner portal</a>.
      </p>
    </div>`,
  });

  // Log it
  await service.entities.PartnerMessageLog.create({
    partner_id,
    message_type,
    channel: 'email',
    subject,
    body,
    sent_at: new Date().toISOString(),
    agent_reasoning: agent_reasoning || '',
    partner_responded: false,
  });

  console.log(`[SENT] ${message_type} email to ${p.contact_name} (${p.contact_email})`);
  return Response.json({ sent: true, to: p.contact_email });
});