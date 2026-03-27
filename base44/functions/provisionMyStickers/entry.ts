import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Called when user clicks "Claim Sticker" to create one pending sticker
 * and decrement their sticker_credits by 1.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const credits = user.sticker_credits || 0;
  if (credits <= 0) {
    return Response.json({ success: true, stickers_created: 0 });
  }

  // Create exactly one sticker
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code;
  let unique = false;
  while (!unique) {
    code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const dup = await base44.asServiceRole.entities.Sticker.filter({ unique_code: code });
    if (dup.length === 0) unique = true;
  }

  const qrUrl = `https://app.judgemydriving.com/scan/${code}`;
  await base44.entities.Sticker.create({
    unique_code: code,
    owner_id: user.id,
    owner_email: user.email,
    status: 'pending',
    is_registered: false,
    qr_url: qrUrl,
    feedback_count: 0,
    average_rating: 0,
  });

  // Decrement sticker_credits by 1
  const newCredits = Math.max(0, credits - 1);
  await base44.auth.updateMe({ sticker_credits: newCredits });

  console.log(`[provisionMyStickers] Created 1 sticker for ${user.email}, credits now at ${newCredits}`);
  return Response.json({ success: true, stickers_created: 1 });
});