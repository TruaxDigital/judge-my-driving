import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Returns ISO week string e.g. "2026-W14"
function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event_type, sticker_id, sticker_code, design_id, owner_id, rating_given, discount_code } = body;

    if (!event_type || !sticker_id || !sticker_code) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const week_key = getWeekKey(new Date());

    // Write the scan event
    await base44.asServiceRole.entities.ScanEvent.create({
      event_type,
      sticker_id,
      sticker_code,
      design_id: design_id || null,
      owner_id: owner_id || null,
      rating_given: rating_given ?? null,
      discount_code: discount_code || null,
      week_key,
    });

    // On raw scans, increment total_scans on the Sticker record
    if (event_type === 'scan') {
      const stickers = await base44.asServiceRole.entities.Sticker.filter({ id: sticker_id });
      if (stickers.length > 0) {
        const sticker = stickers[0];
        await base44.asServiceRole.entities.Sticker.update(sticker_id, {
          total_scans: (sticker.total_scans || 0) + 1,
          last_scan_date: new Date().toISOString(),
        });
      }
    }

    console.log(`[recordStickerScan] ${event_type} recorded for sticker ${sticker_code}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[recordStickerScan] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});