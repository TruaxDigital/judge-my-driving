import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      user_id,
      email,
      full_name,
      plan_tier,
      subscription_amount,
      stripe_subscription_id,
      stripe_customer_id,
      subscription_start_date,
      subscription_end_date,
    } = await req.json();

    if (!user_id || !email || !plan_tier) {
      return Response.json({ error: 'user_id, email, and plan_tier are required' }, { status: 400 });
    }

    // Check if sale already exists for this user
    const existingSales = await base44.asServiceRole.entities.Sale.filter({ user_id });
    const existingSale = existingSales[0];

    let saleId;
    if (existingSale) {
      // Update existing sale
      await base44.asServiceRole.entities.Sale.update(existingSale.id, {
        email,
        full_name,
        plan_tier,
        subscription_amount,
        stripe_subscription_id,
        stripe_customer_id,
        status: 'active',
        subscription_start_date,
        subscription_end_date,
      });
      saleId = existingSale.id;
      console.log(`[createOrUpdateSale] Updated sale ${saleId} for user ${user_id}`);
    } else {
      // Create new sale
      const newSale = await base44.asServiceRole.entities.Sale.create({
        user_id,
        email,
        full_name,
        plan_tier,
        subscription_amount,
        total_revenue: subscription_amount || 0,
        stripe_subscription_id,
        stripe_customer_id,
        status: 'active',
        subscription_start_date,
        subscription_end_date,
      });
      saleId = newSale.id;
      console.log(`[createOrUpdateSale] Created sale ${saleId} for user ${user_id}`);
    }

    // Sync to HubSpot
    try {
      await base44.asServiceRole.functions.invoke('syncSaleToHubSpot', { sale_id: saleId });
    } catch (syncErr) {
      console.error('[createOrUpdateSale] HubSpot sync failed:', syncErr.message);
      // Don't fail the whole request if HubSpot sync fails
    }

    return Response.json({ success: true, sale_id: saleId });
  } catch (error) {
    console.error('[createOrUpdateSale] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});