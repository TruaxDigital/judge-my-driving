import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { target_user_id, plan_tier, subscription_status } = await req.json();

    if (!target_user_id) {
      return Response.json({ error: 'target_user_id is required' }, { status: 400 });
    }

    const updateData = {};
    if (plan_tier !== undefined) updateData.plan_tier = plan_tier;
    if (subscription_status !== undefined) updateData.subscription_status = subscription_status;

    await base44.asServiceRole.entities.User.update(target_user_id, updateData);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[adminUpdateUser] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});