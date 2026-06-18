import Stripe from 'npm:stripe@14.21.0';

const STRIPE_PLAN_TO_PRODUCT = {
  individual:         'Individual',
  family:             'Family',
  starter_fleet:      'Starter Fleet',
  professional_fleet: 'Professional Fleet',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return Response.json({ error: 'session_id is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const meta = session.metadata || {};
    const planTier = meta.plan_tier;
    const planName = STRIPE_PLAN_TO_PRODUCT[planTier] || planTier || 'Unknown';

    return Response.json({
      amount_total: session.amount_total,
      currency: session.currency,
      plan_name: planName,
      plan_tier: planTier,
      customer_email: session.customer_details?.email || '',
    });
  } catch (err) {
    console.error('getStripeSession error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});