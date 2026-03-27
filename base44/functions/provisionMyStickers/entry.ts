import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Called by any authenticated user to convert their sticker_credits
 * into actual Sticker records (pending, unshipped).
 * Idempotent: only creates records for credits that don't yet have a sticker.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const credits = user.sticker_credits || 0;
  if (credits <= 0) {
    return Response.json({ success: true, stickers_created: 0 });
  }

  // Count existing stickers not yet sent to Printful
  const existing = await base44.entities.Sticker.filter({ owner_id: user.id });
  const unclaimed = existing.filter(s => !s.printful_order_id);
  const toCreate = Math.max(0, credits - unclaimed.length);

  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let stickersCreated = 0;

  for (let i = 0; i < toCreate; i++) {
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
    stickersCreated++;
  }

  // Decrement sticker_credits by the number created
  if (stickersCreated > 0) {
    const newCredits = Math.max(0, credits - stickersCreated);
    await base44.auth.updateMe({ sticker_credits: newCredits });
  }

  console.log(`[provisionMyStickers] Created ${stickersCreated} sticker(s) for ${user.email}`);
  return Response.json({ success: true, stickers_created: stickersCreated });
});