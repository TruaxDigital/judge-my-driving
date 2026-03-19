import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Triggered by entity automation on User create
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    // Only handle new user creation
    if (event?.type !== 'create') {
      return Response.json({ skipped: true });
    }

    const user = data;
    if (!user?.email) {
      console.log('No email on new user, skipping HubSpot sync');
      return Response.json({ skipped: true });
    }

    console.log(`Syncing new user to HubSpot: ${user.email}`);

    await base44.asServiceRole.functions.invoke('syncToHubSpot', {
      email: user.email,
      full_name: user.full_name || '',
      plan_tier: user.plan_tier || null,
      total_stickers: 0,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('syncNewUserToHubSpot error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});