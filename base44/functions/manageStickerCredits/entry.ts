import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Admin-only function to adjust sticker credits for a user.
 * Also optionally creates the actual sticker records immediately.
 *
 * Payload:
 *   target_user_id: string  — ID of the user to adjust
 *   delta: number           — positive = add credits, negative = remove credits
 *   note: string (optional) — reason for the adjustment (for logging)
 *   create_stickers: bool   — if true, immediately create sticker records for added credits
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { target_user_id, delta, note, create_stickers } = await req.json();

  if (!target_user_id || delta === undefined || delta === 0) {
    return Response.json({ error: 'target_user_id and a non-zero delta are required' }, { status: 400 });
  }

  // Load target user
  const users = await base44.asServiceRole.entities.User.filter({ id: target_user_id });
  if (users.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  const targetUser = users[0];

  const currentCredits = targetUser.sticker_credits || 0;
  const newCredits = Math.max(0, currentCredits + delta);

  await base44.asServiceRole.entities.User.update(target_user_id, {
    sticker_credits: newCredits,
  });

  console.log(`[manageStickerCredits] Admin ${user.email} adjusted credits for ${targetUser.email}: ${currentCredits} → ${newCredits} (delta: ${delta}${note ? ', note: ' + note : ''})`);

  // Optionally create sticker records for positive deltas
  let stickersCreated = 0;
  if (create_stickers && delta > 0) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < delta; i++) {
      let code;
      let unique = false;
      while (!unique) {
        code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const existing = await base44.asServiceRole.entities.Sticker.filter({ unique_code: code });
        if (existing.length === 0) unique = true;
      }
      const qrUrl = `https://app.judgemydriving.com/scan/${code}`;
      await base44.asServiceRole.entities.Sticker.create({
        unique_code: code,
        owner_id: target_user_id,
        owner_email: targetUser.email,
        status: 'pending',
        is_registered: false,
        qr_url: qrUrl,
        feedback_count: 0,
        average_rating: 0,
      });
      stickersCreated++;
    }
    console.log(`[manageStickerCredits] Created ${stickersCreated} sticker(s) for user ${targetUser.email}`);
  }

  return Response.json({
    success: true,
    previous_credits: currentCredits,
    new_credits: newCredits,
    stickers_created: stickersCreated,
  });
});