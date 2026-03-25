import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_MAP = {
  individual:         'price_1TBiCjAJkvIkgpmwjgl60Rp8',
  family:             'price_1TBiCjAJkvIkgpmw5Ym9jacB',
  starter_fleet:      'price_1TBiCjAJkvIkgpmw5yVpaOdE',
  professional_fleet: 'price_1TBiCjAJkvIkgpmw0l1X27y9',
};

const ADDON_PRICES = {
  individual:         2900,
  family:             2900,
  starter_fleet:      8900,
  professional_fleet: 7900,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { plan_tier, mode, success_url, cancel_url, discount_code } = body;

    // Addon sticker purchase (one-time)
    if (mode === 'addon') {
      const addonPrice = ADDON_PRICES[body.plan_tier || user.plan_tier];
      if (!addonPrice) return Response.json({ error: 'Invalid plan for addon' }, { status: 400 });

      // Create or retrieve customer
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
        customerId = customer.id;
        await base44.auth.updateMe({ stripe_customer_id: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{ price_data: { currency: 'usd', unit_amount: addonPrice, product_data: { name: 'Add-on Sticker' } }, quantity: 1 }],
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

    // Replacement sticker ($29)
    if (mode === 'replacement') {
      const { sticker_id } = body;
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
        customerId = customer.id;
        await base44.auth.updateMe({ stripe_customer_id: customerId });
      }
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{ price_data: { currency: 'usd', unit_amount: 2900, product_data: { name: 'Replacement Sticker (Same QR Code)' } }, quantity: 1 }],
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

    // New subscription
    const priceId = PRICE_MAP[plan_tier];
    if (!priceId) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
      customerId = customer.id;
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    // Look up Stripe coupon for discount code
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