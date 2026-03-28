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

    // Send welcome email via Resend
    const teenLink = `https://app.judgemydriving.com/student-drivers?ref=${ref_code}`;
    const seniorLink = `https://app.judgemydriving.com/senior-drivers?ref=${ref_code}`;
    const portalLink = `https://app.judgemydriving.com/PartnerPortal`;

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <div style="background: #18181b; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #facc15; margin: 0; font-size: 22px; letter-spacing: 2px;">JUDGE MY DRIVING</h1>
    <p style="color: #a1a1aa; margin: 4px 0 0; font-size: 13px;">Partner Program</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
    <h2 style="margin-top: 0;">Welcome, ${contact_name}! 🎉</h2>
    <p>We're excited to have <strong>${partner_name}</strong> as a referral partner. Here's everything you need to get started.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <h3 style="color: #18181b;">Your Referral Code</h3>
    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #18181b;">
      ${ref_code}
    </div>

    <h3 style="color: #18181b; margin-top: 24px;">Your Referral Links</h3>
    <p style="margin: 0 0 8px;"><strong>👦 Teen / Student Drivers:</strong><br/>
      <a href="${teenLink}" style="color: #facc15;">${teenLink}</a>
    </p>
    <p style="margin: 0 0 8px;"><strong>👴 Senior Drivers:</strong><br/>
      <a href="${seniorLink}" style="color: #facc15;">${seniorLink}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <h3 style="color: #18181b;">How You Earn</h3>
    <p>You earn <strong>$10</strong> for every Individual or Family plan subscription that comes through your referral link. Payouts are processed quarterly (minimum $25 balance).</p>

    <h3 style="color: #18181b;">What to Share</h3>
    <p>Judge My Driving puts a QR sticker on a car. When other drivers scan it, they rate the driver — and the family gets real-time alerts. Parents use it to monitor teen drivers. Adult children use it to keep tabs on aging parents. Plans start at $49/year with a 30-day money-back guarantee.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <div style="text-align: center;">
      <a href="${portalLink}" style="display: inline-block; background: #facc15; color: #18181b; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">Go to My Partner Dashboard →</a>
      <p style="color: #a1a1aa; font-size: 12px; margin-top: 12px;">Log in with this email address to access your dashboard.</p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="color: #6b7280; font-size: 13px; text-align: center;">Questions? <a href="mailto:hello@judgemydriving.com" style="color: #facc15;">hello@judgemydriving.com</a></p>
  </div>
</div>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Judge My Driving <partners@mail.judgemydriving.com>',
        to: contact_email,
        subject: `Welcome to the JMD Partner Program — your code is ${ref_code}`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      console.error('[partnerSignup] Resend email failed:', resendError);
    } else {
      console.log(`[partnerSignup] Welcome email sent to ${contact_email}`);
    }

    return Response.json({ success: true, partner, ref_code });
  } catch (error) {
    console.error('[partnerSignup] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});