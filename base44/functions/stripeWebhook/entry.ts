import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// How many stickers each plan gets on signup
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
        const count = PLAN_STICKER_COUNT[planTier] || 1;

        const isFleetPlan = ['starter_fleet', 'professional_fleet', 'enterprise_fleet'].includes(planTier);
        await base44.asServiceRole.entities.User.update(userId, {
          plan_tier: planTier,
          plan: PLAN_TYPE[planTier] || 'personal',
          role: isFleetPlan ? 'fleet_admin' : 'user',
          stripe_subscription_id: subId,
          subscription_status: 'active',
          sticker_credits: count,
          subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        });

        await createStickers(base44, userId, userEmail, count);

        // Create or update sale record
        const user = users.length > 0 ? users[0] : null;
        await base44.asServiceRole.functions.invoke('createOrUpdateSale', {
          user_id: userId,
          email: userEmail,
          full_name: user?.full_name || '',
          plan_tier: planTier,
          subscription_amount: session.amount_total ? session.amount_total / 100 : 0,
          stripe_subscription_id: subId,
          stripe_customer_id: session.customer,
          subscription_start_date: new Date().toISOString().split('T')[0],
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        });

        // Create referral conversion if ref_code provided
        if (meta.ref_code) {
          try {
            const partners = await base44.asServiceRole.entities.ReferralPartner.filter({ ref_code: meta.ref_code });
            if (partners.length > 0) {
              const partner = partners[0];
              const subscription_type = planTier.includes('fleet') ? 'fleet' : 'individual';
              await base44.asServiceRole.entities.ReferralConversion.create({
                ref_code: meta.ref_code,
                partner_id: partner.id,
                customer_name: user?.full_name || '',
                customer_email: userEmail,
                subscription_type,
                commission_amount: 10,
                commission_status: 'pending',
                stripe_subscription_id: subId,
                conversion_date: new Date().toISOString().split('T')[0],
              });
              console.log(`Created referral conversion for partner ${partner.id}, customer ${userEmail}`);
            }
          } catch (refErr) {
            console.error('Failed to create referral conversion:', refErr.message);
          }
        }

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
          subject: 'Welcome to Judge My Driving! Your sticker(s) are ready',
          body: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #FACC15;">Welcome to Judge My Driving!</h2>
            <p>Your <strong>${planTier.replace(/_/g, ' ')}</strong> plan is now active.</p>
            <p>Your sticker${count > 1 ? 's are' : ' is'} ready! Visit your Stickers page to choose a design and enter your shipping address — we'll print and ship ${count > 1 ? 'them' : 'it'} to you right away.</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="https://app.judgemydriving.com/Stickers" style="background: #FACC15; color: #111; font-weight: bold; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
                Get Your Sticker${count > 1 ? 's' : ''} →
              </a>
            </p>
            <h3>After your sticker arrives:</h3>
            <ol>
              <li>Peel and stick it on your vehicle</li>
              <li>Scan the QR code to activate it</li>
              <li>Check your dashboard for feedback</li>
            </ol>
          </div>`,
        });
        console.log(`New subscription for user ${userId}, plan: ${planTier}, ${count} stickers created`);
      }

      if (meta.type === 'addon_sticker') {
        // Add 1 sticker credit and create the sticker record
        const users = await base44.asServiceRole.entities.User.filter({ id: userId });
        const user = users[0];
        const currentCredits = user?.sticker_credits || 0;
        await base44.asServiceRole.entities.User.update(userId, { sticker_credits: currentCredits + 1 });
        await createStickers(base44, userId, userEmail, 1);

        // Update sale record with additional stickers
        const sales = await base44.asServiceRole.entities.Sale.filter({ user_id: userId });
        if (sales.length > 0) {
          const sale = sales[0];
          const newTotal = (sale.total_revenue || 0) + (session.amount_total ? session.amount_total / 100 : 0);
          await base44.asServiceRole.entities.Sale.update(sale.id, {
            additional_stickers_sold: (sale.additional_stickers_sold || 0) + 1,
            total_revenue: newTotal,
          });
          // Sync updated sale to HubSpot
          await base44.asServiceRole.functions.invoke('syncSaleToHubSpot', { sale_id: sale.id });
        }
        console.log(`Add-on sticker created for user ${userId}`);

        // Sync to HubSpot
        try {
          const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: userId });
          await base44.asServiceRole.functions.invoke('syncToHubSpot', {
            email: userEmail,
            full_name: user?.full_name || '',
            plan_tier: user?.plan_tier,
            last_purchase_date: new Date().toISOString().split('T')[0],
            total_stickers: stickers.length,
          });
        } catch (hsErr) {
          console.error('HubSpot sync failed (addon_sticker):', hsErr.message);
        }
      }

      if (meta.type === 'replacement_sticker') {
        // Replacement: same QR code, just needs a new physical sticker printed
        // We don't create a new sticker record — the existing one stays active
        
        // Update sale record with replacement sticker count
        const sales = await base44.asServiceRole.entities.Sale.filter({ user_id: userId });
        if (sales.length > 0) {
          const sale = sales[0];
          const newTotal = (sale.total_revenue || 0) + (session.amount_total ? session.amount_total / 100 : 0);
          await base44.asServiceRole.entities.Sale.update(sale.id, {
            replacement_stickers_sold: (sale.replacement_stickers_sold || 0) + 1,
            total_revenue: newTotal,
          });
          // Sync updated sale to HubSpot
          await base44.asServiceRole.functions.invoke('syncSaleToHubSpot', { sale_id: sale.id });
        }
        console.log(`Replacement sticker purchased for user ${userId}, sticker_id: ${meta.sticker_id}`);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const meta = sub.metadata || {};
      // Only handle upgrades we triggered
      if (meta.type === 'upgrade' && meta.upgrade_to === 'family' && meta.user_id) {
        const userId = meta.user_id;
        const userEmail = meta.user_email;
        const users = await base44.asServiceRole.entities.User.filter({ id: userId });
        const user = users[0];
        const currentTier = user?.plan_tier;

        if (currentTier !== 'family') {
          // Family = 3 stickers total. Individual already had 1. Provision 2 more.
          await base44.asServiceRole.entities.User.update(userId, {
            plan_tier: 'family',
            plan: 'personal',
            sticker_credits: (user?.sticker_credits || 0) + 2,
          });
          await createStickers(base44, userId, userEmail, 2);
          console.log(`Upgraded user ${userId} to family, provisioned 2 additional stickers`);

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: userEmail,
            subject: 'You\'ve upgraded to the Family plan!',
            body: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #FACC15;">Welcome to the Family Plan!</h2>
              <p>Your plan has been upgraded successfully. We've added 2 more sticker slots to your account (3 total).</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="https://app.judgemydriving.com/Stickers" style="background: #FACC15; color: #111; font-weight: bold; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
                  View Your Stickers →
                </a>
              </p>
            </div>`,
          });

          try {
            const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: userId });
            await base44.asServiceRole.functions.invoke('syncToHubSpot', {
              email: userEmail,
              full_name: user?.full_name || '',
              plan_tier: 'family',
              last_purchase_date: new Date().toISOString().split('T')[0],
              total_stickers: stickers.length,
            });
          } catch (hsErr) {
            console.error('HubSpot sync failed (upgrade):', hsErr.message);
          }
        }
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: invoice.customer });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: 'active',
            subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
          });
          console.log(`Subscription renewed for user ${users[0].id}`);
          try {
            const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: users[0].id });
            await base44.asServiceRole.functions.invoke('syncToHubSpot', {
              email: users[0].email,
              full_name: users[0].full_name || '',
              plan_tier: users[0].plan_tier,
              last_purchase_date: new Date().toISOString().split('T')[0],
              total_stickers: stickers.length,
            });
          } catch (hsErr) {
            console.error('HubSpot sync failed (renewal):', hsErr.message);
          }
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: invoice.customer });
      if (users.length > 0) {
        const userId = users[0].id;
        await base44.asServiceRole.entities.User.update(userId, { subscription_status: 'past_due' });
        
        // Mark conversions as canceled for this subscription
        if (invoice.subscription) {
          const conversions = await base44.asServiceRole.entities.ReferralConversion.filter({ stripe_subscription_id: invoice.subscription });
          for (const c of conversions) {
            if (c.commission_status === 'pending') {
              await base44.asServiceRole.entities.ReferralConversion.update(c.id, { commission_status: 'canceled' });
            }
          }
          console.log(`Marked ${conversions.length} referral conversions as canceled for subscription ${invoice.subscription}`);
        }
        
        // Deactivate stickers
        const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: userId });
        for (const s of stickers) {
          if (s.status === 'active') {
            await base44.asServiceRole.entities.Sticker.update(s.id, { status: 'deactivated' });
          }
        }
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: users[0].email,
          subject: 'Action needed: payment failed for Judge My Driving',
          body: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Payment Failed</h2>
            <p>We couldn't process your annual subscription payment for Judge My Driving.</p>
            <p>Please update your payment method to keep your stickers active.</p>
            <p><a href="https://app.judgemydriving.com/Settings" style="color: #FACC15;">Update payment method →</a></p>
          </div>`,
        });
        console.log(`Payment failed for user ${userId}, set to past_due, ${stickers.length} stickers deactivated`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: sub.customer });
      if (users.length > 0) {
        const userId = users[0].id;
        await base44.asServiceRole.entities.User.update(userId, { subscription_status: 'canceled' });
        
        // Mark conversions as canceled
        const conversions = await base44.asServiceRole.entities.ReferralConversion.filter({ stripe_subscription_id: sub.id });
        for (const c of conversions) {
          if (c.commission_status === 'pending') {
            await base44.asServiceRole.entities.ReferralConversion.update(c.id, { commission_status: 'canceled' });
          }
        }
        
        // Deactivate stickers
        const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: userId });
        for (const s of stickers) {
          if (s.status === 'active') {
            await base44.asServiceRole.entities.Sticker.update(s.id, { status: 'deactivated' });
          }
        }
        console.log(`Subscription canceled for user ${userId}, ${conversions.length} conversions marked canceled, ${stickers.length} stickers deactivated`);
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  return Response.json({ received: true });
});