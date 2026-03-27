import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Main subscription plan prices
const PRICE_MAP = {
  individual:         'price_1TEytxPRtZZpxDXapf6My9d1',
  family:             'price_1TEytwPRtZZpxDXaABsJ4zGy',
  starter_fleet:      'price_1TEytwPRtZZpxDXavnYLui15',
  professional_fleet: 'price_1TEytvPRtZZpxDXaUKUtslV0',
};

// Additional sticker subscription prices (per year)
const ADDON_PRICE_MAP = {
  family:             'price_1TFb5aPRtZZpxDXa1rhuMy6h', // $29/year
  starter_fleet:      'price_1TFb5aPRtZZpxDXal5tdqzv5', // $79/year
  professional_fleet: 'price_1TFb5aPRtZZpxDXal5tdqzv5', // $79/year
};

// Replacement sticker one-time price
const REPLACEMENT_PRICE_ID = 'price_1TFb5aPRtZZpxDXa2dYghLsC'; // $19 one-time

async function getOrCreateCustomer(stripe, base44, user) {
  if (user.stripe_customer_id) return user.stripe_customer_id;
  const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
  await base44.auth.updateMe({ stripe_customer_id: customer.id });
  return customer.id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mode, success_url, cancel_url, discount_code } = body;

    // Additional sticker subscription (family or fleet only)
    if (mode === 'addon') {
      const planTier = user.plan_tier;
      const priceId = ADDON_PRICE_MAP[planTier];
      if (!priceId) {
        return Response.json({ error: 'Additional stickers are not available for your plan.' }, { status: 400 });
      }

      const customerId = await getOrCreateCustomer(stripe, base44, user);
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: success_url || `${req.headers.get('origin')}/Stickers?addon_success=true`,
        cancel_url: cancel_url || `${req.headers.get('origin')}/Stickers`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_id: user.id,
          user_email: user.email,
          type: 'addon_sticker',
        },
      });
      return Response.json({ url: session.url });
    }

    // Replacement sticker ($19 one-time, same QR code)
    if (mode === 'replacement') {
      const { sticker_id } = body;
      const customerId = await getOrCreateCustomer(stripe, base44, user);
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{ price: REPLACEMENT_PRICE_ID, quantity: 1 }],
        success_url: success_url || `${req.headers.get('origin')}/Stickers?replacement_success=true`,
        cancel_url: cancel_url || `${req.headers.get('origin')}/Stickers`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_id: user.id,
          user_email: user.email,
          type: 'replacement_sticker',
          sticker_id: sticker_id || '',
        },
      });
      return Response.json({ url: session.url });
    }

    // Upgrade individual → family (direct subscription update, no new checkout)
    if (mode === 'upgrade') {
      const subId = user.stripe_subscription_id;
      if (!subId) return Response.json({ error: 'No active subscription found.' }, { status: 400 });

      const sub = await stripe.subscriptions.retrieve(subId);
      const currentItemId = sub.items.data[0]?.id;
      if (!currentItemId) return Response.json({ error: 'Could not find subscription item.' }, { status: 400 });

      const newPriceId = PRICE_MAP['family'];

      await stripe.subscriptions.update(subId, {
        items: [{ id: currentItemId, price: newPriceId }],
        proration_behavior: 'always_invoice',
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_id: user.id,
          user_email: user.email,
          upgrade_to: 'family',
          type: 'upgrade',
        },
      });

      console.log(`Upgraded user ${user.id} subscription ${subId} to family plan`);
      return Response.json({ success: true });
    }

    // New subscription
    const { plan_tier } = body;
    const priceId = PRICE_MAP[plan_tier];
    if (!priceId) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    const customerId = await getOrCreateCustomer(stripe, base44, user);

    let discounts = undefined;
    if (discount_code) {
      try {
        const coupons = await stripe.promotionCodes.list({ code: discount_code, active: true, limit: 1 });
        if (coupons.data.length > 0) {
          discounts = [{ promotion_code: coupons.data[0].id }];
          console.log(`Applying promotion code: ${discount_code}`);
        } else {
          console.log(`Promotion code not found or inactive: ${discount_code}`);
        }
      } catch (e) {
        console.error('Error looking up promotion code:', e.message);
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${req.headers.get('origin')}/Stickers?sub_success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/get-started`,
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id,
        user_email: user.email,
        plan_tier,
        type: 'new_subscription',
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});