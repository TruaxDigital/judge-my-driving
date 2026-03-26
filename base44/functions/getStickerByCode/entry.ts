import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code } = await req.json();

    if (!code) {
      return Response.json({ error: 'No code provided' }, { status: 400 });
    }

    // Use service role to allow public (unauthenticated) lookups for sticker scanning
    const stickers = await base44.asServiceRole.entities.Sticker.filter({ unique_code: code.toUpperCase() });

    if (stickers.length === 0) {
      return Response.json({ error: 'Sticker not found' }, { status: 404 });
    }

    const sticker = stickers[0];

    // Only return the fields needed for the public scan page
    return Response.json({
      sticker: {
        id: sticker.id,
        unique_code: sticker.unique_code,
        status: sticker.status,
        is_registered: sticker.is_registered,
        driver_label: sticker.driver_label,
        owner_email: sticker.owner_email,
        owner_id: sticker.owner_id,
        feedback_count: sticker.feedback_count,
        average_rating: sticker.average_rating,
      }
    });
  } catch (error) {
    console.error('getStickerByCode error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});