import Stripe from 'npm:stripe@14.21.0';

const PRICE_MAP = {
  individual: 'price_1TEytxPRtZZpxDXapf6My9d1',
  family:     'price_1TEytwPRtZZpxDXaABsJ4zGy',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { plan_tier } = body;

    if (!plan_tier || !PRICE_MAP[plan_tier]) {
      return Response.json({ error: 'Invalid plan_tier. Must be "individual" or "family".' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://app.judgemydriving.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_MAP[plan_tier], quantity: 1 }],
      success_url: `${origin}/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/get-started#pricing`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        type: 'guest_subscription',
        plan_tier,
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('createGuestCheckoutSession error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});