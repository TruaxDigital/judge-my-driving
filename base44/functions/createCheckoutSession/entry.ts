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
    const { mode, success_url, cancel_url, discount_code, ref_code } = body;

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
          ref_code: ref_code || '',
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
          ref_code: ref_code || '',
        },
      });
      return Response.json({ url: session.url });
    }

    // Upgrade individual → family via Stripe Customer Portal (handles prorations automatically)
    if (mode === 'upgrade') {
      const customerId = await getOrCreateCustomer(stripe, base44, user);
      const origin = req.headers.get('origin') || 'https://app.judgemydriving.com';

      // Try a direct upgrade flow first; fall back to general portal if subscription ID is missing/invalid
      let flowData = undefined;
      if (user.stripe_subscription_id) {
        try {
          const sub = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
          const itemId = sub.items.data[0]?.id;
          if (itemId) {
            flowData = {
              type: 'subscription_update_confirm',
              subscription_update_confirm: {
                subscription: user.stripe_subscription_id,
                items: [{ id: itemId, price: PRICE_MAP['family'], quantity: 1 }],
              },
            };
          }
        } catch (e) {
          console.warn(`Could not retrieve subscription ${user.stripe_subscription_id}, falling back to general portal: ${e.message}`);
        }
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/Stickers`,
        ...(flowData ? { flow_data: flowData } : {}),
      });

      console.log(`Redirecting user ${user.id} to portal for family upgrade`);
      return Response.json({ url: portalSession.url });
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
        ref_code: ref_code || '',
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});