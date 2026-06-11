import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PLAN_STICKER_COUNT = {
  individual: 1,
  family:     3,
};

const PLAN_TYPE = {
  individual: 'personal',
  family:     'personal',
};

function generateCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createStickers(base44, userId, userEmail, count) {
  for (let i = 0; i < count; i++) {
    let code;
    let unique = false;
    while (!unique) {
      code = generateCode();
      const existing = await base44.asServiceRole.entities.Sticker.filter({ unique_code: code });
      if (existing.length === 0) unique = true;
    }
    const qrUrl = `https://app.judgemydriving.com/scan/${code}`;
    await base44.asServiceRole.entities.Sticker.create({
      unique_code: code,
      owner_id: userId,
      owner_email: userEmail,
      status: 'pending',
      is_registered: false,
      qr_url: qrUrl,
      feedback_count: 0,
      average_rating: 0,
    });
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find pending purchases matching this user's email (case-insensitive)
    const allPending = await base44.asServiceRole.entities.PendingPurchase.filter({ status: 'pending' });
    const matches = allPending.filter(p => p.buyer_email?.toLowerCase() === user.email?.toLowerCase());

    if (matches.length === 0) {
      return Response.json({ claimed: false });
    }

    for (const purchase of matches) {
      const planTier = purchase.plan_tier;
      const count = PLAN_STICKER_COUNT[planTier] || 1;

      // Mark claimed
      await base44.asServiceRole.entities.PendingPurchase.update(purchase.id, {
        status: 'claimed',
        claimed_by_user_id: user.id,
      });

      // Update user record
      await base44.asServiceRole.entities.User.update(user.id, {
        plan_tier: planTier,
        plan: PLAN_TYPE[planTier] || 'personal',
        role: 'user',
        stripe_subscription_id: purchase.stripe_subscription_id,
        stripe_customer_id: purchase.stripe_customer_id,
        subscription_status: 'active',
        sticker_credits: count,
      });

      // Create stickers
      await createStickers(base44, user.id, user.email, count);

      console.log(`Claimed purchase ${purchase.id} for user ${user.id}, plan: ${planTier}, ${count} stickers created`);
    }

    return Response.json({ claimed: true });
  } catch (err) {
    console.error('claimPurchase error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});