import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLAN_STICKER_COUNT = {
  individual:         1,
  family:             3,
  starter_fleet:      10,
  professional_fleet: 25,
};

const PLAN_TYPE = {
  individual:         'personal',
  family:             'personal',
  starter_fleet:      'fleet',
  professional_fleet: 'fleet',
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
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET'));
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Invalid signature', { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const meta = session.metadata || {};
      const userId = meta.user_id;
      const userEmail = meta.user_email;

      if (!userId) {
        console.error('No user_id in metadata');
        return Response.json({ received: true });
      }

      if (meta.type === 'new_subscription') {
        const planTier = meta.plan_tier;
        const subId = session.subscription;
        const subscription = await stripe.subscriptions.retrieve(subId);

        await base44.asServiceRole.entities.User.update(userId, {
          plan_tier: planTier,
          plan: PLAN_TYPE[planTier] || 'personal',
          stripe_subscription_id: subId,
          subscription_status: 'active',
          subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        });

        const count = PLAN_STICKER_COUNT[planTier] || 1;
        await createStickers(base44, userId, userEmail, count);

        // Sync to HubSpot
        try {
          const users = await base44.asServiceRole.entities.User.filter({ id: userId });
          const user = users[0];
          const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: userId });
          await base44.asServiceRole.functions.invoke('syncToHubSpot', {
            email: userEmail,
            full_name: user?.full_name || '',
            plan_tier: planTier,
            last_purchase_date: new Date().toISOString().split('T')[0],
            total_stickers: stickers.length,
          });
        } catch (hsErr) {
          console.error('HubSpot sync failed (new_subscription):', hsErr.message);
        }

        // Welcome email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: 'Welcome to Judge My Driving!',
          body: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #FACC15;">Welcome to Judge My Driving!</h2>
            <p>Your <strong>${planTier.replace('_', ' ')}</strong> plan is now active.</p>
            <p>We're printing your sticker(s) and will ship them shortly. When they arrive, scan the QR code on the sticker to register it and start receiving feedback.</p>
            <h3>Quick Start:</h3>
            <ol>
              <li>Receive your sticker in the mail</li>
              <li>Scan the QR code to register it</li>
              <li>Stick it on your vehicle</li>
              <li>Check your dashboard for feedback</li>
            </ol>
            <p><a href="https://app.judgemydriving.com/Dashboard" style="color: #FACC15;">Go to your dashboard →</a></p>
          </div>`,
        });
        console.log(`New subscription created for user ${userId}, plan: ${planTier}, ${count} stickers created`);
      }

      if (meta.type === 'addon_sticker') {
        await createStickers(base44, userId, userEmail, 1);
        console.log(`Add-on sticker created for user ${userId}`);
      }

      if (meta.type === 'replacement_sticker') {
        const oldStickerId = meta.sticker_id;
        if (oldStickerId) {
          await base44.asServiceRole.entities.Sticker.update(oldStickerId, { status: 'deactivated' });
        }
        await createStickers(base44, userId, userEmail, 1);
        console.log(`Replacement sticker created for user ${userId}`);
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        // Find user by stripe_customer_id
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: invoice.customer });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: 'active',
            subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
          });
          console.log(`Subscription renewed for user ${users[0].id}`);
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: invoice.customer });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, { subscription_status: 'past_due' });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: users[0].email,
          subject: 'Action needed: payment failed for Judge My Driving',
          body: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Payment Failed</h2>
            <p>We couldn't process your annual subscription payment for Judge My Driving.</p>
            <p>Please update your payment method to keep your stickers active. If payment remains failed for 30 days, your stickers will be deactivated.</p>
            <p><a href="https://app.judgemydriving.com/Settings" style="color: #FACC15;">Update payment method →</a></p>
          </div>`,
        });
        console.log(`Payment failed for user ${users[0].id}, set to past_due`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: sub.customer });
      if (users.length > 0) {
        const userId = users[0].id;
        await base44.asServiceRole.entities.User.update(userId, { subscription_status: 'canceled' });
        // Deactivate all stickers
        const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: userId });
        for (const s of stickers) {
          if (s.status === 'active') {
            await base44.asServiceRole.entities.Sticker.update(s.id, { status: 'deactivated' });
          }
        }
        console.log(`Subscription canceled for user ${userId}, ${stickers.length} stickers deactivated`);
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  return Response.json({ received: true });
});