import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Must be authenticated to claim a sticker
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sticker_id, driver_label } = await req.json();

    if (!sticker_id) {
      return Response.json({ error: 'Missing sticker_id' }, { status: 400 });
    }

    // Use service role to update the sticker
    await base44.asServiceRole.entities.Sticker.update(sticker_id, {
      owner_id: user.id,
      owner_email: user.email,
      driver_label: driver_label || 'My Vehicle',
      is_registered: true,
      status: 'active',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('claimSticker error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});