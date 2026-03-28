import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function generateRefCode(channelType, partnerName, location) {
  const prefixMap = {
    driving_school: 'ds',
    pta: 'pta',
    insurance: 'ins',
    dealership: 'dlr',
    event: 'evt',
    influencer: 'inf',
    other: 'ref',
  };

  const prefix = prefixMap[channelType] || 'ref';

  const skipWords = ['the', 'a', 'an'];
  const nameParts = partnerName.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const meaningfulWord = nameParts.find(w => !skipWords.includes(w)) || nameParts[0] || 'partner';
  const namePart = meaningfulWord.slice(0, 10);

  let code = `${prefix}-${namePart}`;

  if (location && location.trim()) {
    const locPart = location.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
    if (locPart) code += `-${locPart}`;
  }

  // Strip any chars that aren't lowercase letters or hyphens
  code = code.replace(/[^a-z-]/g, '').slice(0, 25);

  return code;
}

async function getUniqueRefCode(base44, channelType, partnerName, location) {
  const baseCode = generateRefCode(channelType, partnerName, location);

  const existing = await base44.asServiceRole.entities.ReferralPartner.filter({ ref_code: baseCode });
  if (existing.length === 0) return baseCode;

  // Try appending -2, -3, etc.
  for (let i = 2; i <= 20; i++) {
    const candidate = `${baseCode.slice(0, 22)}-${i}`;
    const dup = await base44.asServiceRole.entities.ReferralPartner.filter({ ref_code: candidate });
    if (dup.length === 0) return candidate;
  }

  // Fallback: append timestamp
  return `${baseCode.slice(0, 18)}-${Date.now().toString().slice(-4)}`;
}

async function generateQRCodes(base44, refCode) {
  const teenUrl = `https://app.judgemydriving.com/student-drivers?ref=${refCode}`;
  const seniorUrl = `https://app.judgemydriving.com/senior-drivers?ref=${refCode}`;

  // Use QuickChart QR code API for real, scannable QR codes
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
    // This is a public endpoint — no auth required
    const body = await req.json();

    const {
      partner_name,
      channel_type,
      location,
      contact_name,
      contact_email,
      contact_phone,
      payout_method,
      payout_details,
    } = body;

    if (!partner_name || !channel_type || !contact_name || !contact_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique ref code
    const ref_code = await getUniqueRefCode(base44, channel_type, partner_name, location);

    // Generate QR codes
    const qrCodes = await generateQRCodes(base44, ref_code);

    // Create partner record (user_id linked later when they log in via PartnerPortal)
    const partner = await base44.asServiceRole.entities.ReferralPartner.create({
      user_id: null,
      partner_name,
      channel_type,
      location: location || '',
      ref_code,
      contact_name,
      contact_email,
      contact_phone: contact_phone || '',
      payout_method: payout_method || '',
      payout_details: payout_details || '',
      status: 'active',
      teen_qr_url: qrCodes.teen_qr_url,
      senior_qr_url: qrCodes.senior_qr_url,
    });

    console.log(`[partnerSignup] Created partner ${partner_name} with ref_code ${ref_code}`);

    // Note: SendEmail only works for existing app users.
    // Welcome email is sent by admin after inviting the partner via AdminPartners.

    return Response.json({ success: true, partner, ref_code });
  } catch (error) {
    console.error('[partnerSignup] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});