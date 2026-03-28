import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { partner_id, ref_code } = await req.json();

    if (!partner_id || !ref_code) {
      return Response.json({ error: 'partner_id and ref_code required' }, { status: 400 });
    }

    const teenUrl = `https://app.judgemydriving.com/student-drivers?ref=${ref_code}`;
    const seniorUrl = `https://app.judgemydriving.com/senior-drivers?ref=${ref_code}`;

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

    await base44.asServiceRole.entities.ReferralPartner.update(partner_id, {
      ref_code,
      teen_qr_url: teenUpload?.file_url || null,
      senior_qr_url: seniorUpload?.file_url || null,
    });

    console.log(`[regeneratePartnerQR] Regenerated QR for partner ${partner_id} with ref_code ${ref_code}`);

    return Response.json({ success: true, teen_qr_url: teenResult?.url, senior_qr_url: seniorResult?.url });
  } catch (error) {
    console.error('[regeneratePartnerQR] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});