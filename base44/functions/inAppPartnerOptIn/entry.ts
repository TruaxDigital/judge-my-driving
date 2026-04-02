import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function generateRefCode(name, email) {
  const skipWords = ['the', 'a', 'an'];
  const nameParts = (name || '').toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const meaningfulWord = nameParts.find(w => !skipWords.includes(w) && w.length > 0) || 'user';
  const namePart = meaningfulWord.slice(0, 10);
  const emailPart = (email || '').split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 8);
  let code = `ref-${namePart}-${emailPart}`;
  code = code.replace(/[^a-z0-9-]/g, '').slice(0, 25);
  return code;
}

async function getUniqueRefCode(base44, name, email) {
  const baseCode = generateRefCode(name, email);
  const existing = await base44.asServiceRole.entities.ReferralPartner.filter({ ref_code: baseCode });
  if (existing.length === 0) return baseCode;
  for (let i = 2; i <= 20; i++) {
    const candidate = `${baseCode.slice(0, 22)}-${i}`;
    const dup = await base44.asServiceRole.entities.ReferralPartner.filter({ ref_code: candidate });
    if (dup.length === 0) return candidate;
  }
  return `${baseCode.slice(0, 18)}-${Date.now().toString().slice(-4)}`;
}

async function generateQRCodes(base44, refCode) {
  const teenUrl = `https://app.judgemydriving.com/student-drivers?ref=${refCode}`;
  const seniorUrl = `https://app.judgemydriving.com/senior-drivers?ref=${refCode}`;
  const makeQrApiUrl = (url) =>
    `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=400&margin=2&format=png`;

  const [teenRes, seniorRes] = await Promise.all([
    fetch(makeQrApiUrl(teenUrl)),
    fetch(makeQrApiUrl(seniorUrl)),
  ]);
  const [teenBlob, seniorBlob] = await Promise.all([teenRes.blob(), seniorRes.blob()]);
  const toFile = (blob, name) => new File([blob], name, { type: 'image/png' });

  const [teenUpload, seniorUpload] = await Promise.all([
    base44.asServiceRole.integrations.Core.UploadFile({ file: toFile(teenBlob, 'teen-qr.png') }),
    base44.asServiceRole.integrations.Core.UploadFile({ file: toFile(seniorBlob, 'senior-qr.png') }),
  ]);

  return {
    teen_qr_url: teenUpload?.file_url || null,
    senior_qr_url: seniorUpload?.file_url || null,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { payout_method, payout_details } = body;

    if (!payout_method || !payout_details) {
      return Response.json({ error: 'payout_method and payout_details are required' }, { status: 400 });
    }

    // Check if already a partner
    const existing = await base44.asServiceRole.entities.ReferralPartner.filter({ user_id: user.id });
    if (existing.length > 0) {
      // Already has a partner record — just ensure is_partner flag is set
      await base44.auth.updateMe({ is_partner: true, payout_method, payout_details });
      return Response.json({ success: true, partner: existing[0], already_existed: true });
    }

    // Generate unique ref code
    const ref_code = await getUniqueRefCode(base44, user.full_name, user.email);

    // Generate QR codes
    const qrCodes = await generateQRCodes(base44, ref_code);

    // Create ReferralPartner record
    const nameParts = (user.full_name || '').trim().split(/\s+/);
    const partner = await base44.asServiceRole.entities.ReferralPartner.create({
      user_id: user.id,
      partner_name: user.full_name || user.email,
      channel_type: 'other',
      location: '',
      ref_code,
      contact_name: user.full_name || '',
      contact_email: user.email,
      contact_phone: '',
      payout_method,
      payout_details,
      status: 'active',
      teen_qr_url: qrCodes.teen_qr_url,
      senior_qr_url: qrCodes.senior_qr_url,
    });

    // Set is_partner = true on user record + store payout info
    await base44.auth.updateMe({ is_partner: true, payout_method, payout_details });

    console.log(`[inAppPartnerOptIn] Partner created for user ${user.id} with ref_code ${ref_code}`);

    // Sync to HubSpot
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: user.email }] }] }),
      });
      const searchData = await searchRes.json();
      const contactProps = {
        email: user.email,
        firstname: nameParts[0] || '',
        lastname: nameParts.slice(1).join(' ') || '',
        client_tier: 'Partner',
        company: user.full_name || user.email,
      };
      if (searchData.results && searchData.results.length > 0) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${searchData.results[0].id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: contactProps }),
        });
      } else {
        await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: contactProps }),
        });
      }
    } catch (hubspotErr) {
      console.error('[inAppPartnerOptIn] HubSpot sync failed (non-blocking):', hubspotErr.message);
    }

    return Response.json({ success: true, partner, ref_code });
  } catch (error) {
    console.error('[inAppPartnerOptIn] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});