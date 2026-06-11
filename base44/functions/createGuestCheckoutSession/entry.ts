import Stripe from 'npm:stripe@14.21.0';

async function sendMetaInitiateCheckout(sessionId) {
  try {
    const pixelId = Deno.env.get('META_PIXEL_ID');
    const token = Deno.env.get('META_CAPI_TOKEN');
    if (!pixelId || !token) return;
    const payload = {
      data: [{
        event_name: 'InitiateCheckout',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: sessionId,
        user_data: {},
      }],
    };
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    console.log('META_CAPI InitiateCheckout (guest):', JSON.stringify(json));
  } catch (err) {
    console.error('META_CAPI InitiateCheckout failed (non-fatal):', err.message);
  }
}

const PRICE_MAP = {
  individual:         'price_1TEytxPRtZZpxDXapf6My9d1',
  family:             'price_1TEytwPRtZZpxDXaABsJ4zGy',
  starter_fleet:      'price_1TEytwPRtZZpxDXavnYLui15',
  professional_fleet: 'price_1TEytvPRtZZpxDXaUKUtslV0',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { plan_tier, utm_source, utm_medium, utm_campaign, utm_content, utm_term, ref } = body;

    if (!plan_tier || !PRICE_MAP[plan_tier]) {
      return Response.json({ error: 'Invalid plan_tier.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://app.judgemydriving.com';

    const metadata = {
      base44_app_id: Deno.env.get('BASE44_APP_ID'),
      type: 'guest_subscription',
      plan_tier,
      ...(utm_source   ? { utm_source }   : {}),
      ...(utm_medium   ? { utm_medium }   : {}),
      ...(utm_campaign ? { utm_campaign } : {}),
      ...(utm_content  ? { utm_content }  : {}),
      ...(utm_term     ? { utm_term }     : {}),
      ...(ref          ? { ref }          : {}),
    };

    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: PRICE_MAP[plan_tier], quantity: 1 }],
      success_url: `${origin}/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/get-started#pricing`,
      metadata,
    };

    if (ref) {
      sessionParams.client_reference_id = ref;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    await sendMetaInitiateCheckout(session.id);
    return Response.json({ url: session.url });
  } catch (err) {
    console.error('createGuestCheckoutSession error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});