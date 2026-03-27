import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Generates a branded PNG social card using htmlcsstoimage.com API.
 * Called when a driver hits a milestone (badge, scan count, streak, top 10).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { driver_id, card_type, achievement_data } = body;

    if (!driver_id || !card_type || !achievement_data) {
      return Response.json({ error: 'Missing driver_id, card_type, or achievement_data' }, { status: 400 });
    }

    // Get driver data
    const drivers = await base44.asServiceRole.entities.Sticker.filter({ id: driver_id });
    if (drivers.length === 0) {
      return Response.json({ error: 'Driver not found' }, { status: 404 });
    }
    const driver = drivers[0];

    // Helper: render stars
    const renderStars = (rating) => {
      const filled = Math.round(rating);
      let stars = '';
      for (let i = 0; i < 5; i++) {
        stars += `<div style="width:48px;height:48px;background:${i < filled ? '#D4A017' : '#333333'};border-radius:50%;"></div>`;
      }
      return stars;
    };

    const starsHtml = renderStars(achievement_data.avg_rating || 4.5);

    // Build HTML template based on card_type
    let html = '';
    let shareText = '';

    switch (card_type) {
      case 'badge_earned': {
        html = `
          <div style="width:1080px;height:1080px;background:#0F0F0F;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;box-sizing:border-box;font-family:'Inter',sans-serif;">
            <div style="color:#D4A017;font-size:24px;letter-spacing:4px;margin-bottom:40px;">JUDGE MY DRIVING</div>
            <div style="color:#FFFFFF;font-size:64px;font-weight:700;margin-bottom:20px;text-align:center;">${driver.driver_label || driver.unique_code}</div>
            <div style="color:#D4A017;font-size:36px;font-weight:600;margin-bottom:40px;">${achievement_data.badge_name || 'Badge'} Earned</div>
            <div style="display:flex;gap:8px;margin-bottom:40px;">${starsHtml}</div>
            <div style="color:#CCCCCC;font-size:28px;margin-bottom:16px;">${achievement_data.avg_rating || 4.5} average across ${achievement_data.scan_count || 0} ratings</div>
            <div style="border-top:2px solid #D4A017;width:200px;margin:40px 0;"></div>
            <div style="color:#666666;font-size:20px;">judgemydriving.com/get-started</div>
          </div>
        `;
        shareText = `Just earned the ${achievement_data.badge_name || 'Badge'} badge on @JudgeMyDriving! ${achievement_data.avg_rating || 4.5} average across ${achievement_data.scan_count || 0} community ratings. Think you're a better driver? Get your sticker and prove it. judgemydriving.com/get-started`;
        break;
      }

      case 'state_top10': {
        html = `
          <div style="width:1080px;height:1080px;background:#0F0F0F;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;box-sizing:border-box;font-family:'Inter',sans-serif;">
            <div style="color:#D4A017;font-size:24px;letter-spacing:4px;margin-bottom:40px;">JUDGE MY DRIVING</div>
            <div style="color:#FFFFFF;font-size:64px;font-weight:700;margin-bottom:20px;text-align:center;">${driver.driver_label || driver.unique_code}</div>
            <div style="color:#D4A017;font-size:48px;font-weight:700;margin-bottom:20px;">#${achievement_data.rank || 1}</div>
            <div style="color:#FFFFFF;font-size:32px;margin-bottom:40px;">in ${achievement_data.state || 'the state'}</div>
            <div style="display:flex;gap:8px;margin-bottom:40px;">${starsHtml}</div>
            <div style="color:#CCCCCC;font-size:28px;margin-bottom:16px;">${achievement_data.avg_rating || 4.5} average across ${achievement_data.scan_count || 0} ratings</div>
            <div style="border-top:2px solid #D4A017;width:200px;margin:40px 0;"></div>
            <div style="color:#666666;font-size:20px;">judgemydriving.com/get-started</div>
          </div>
        `;
        shareText = `I'm the #${achievement_data.rank || 1} rated driver in ${achievement_data.state || 'the state'} on @JudgeMyDriving this month. Come at me. judgemydriving.com/get-started`;
        break;
      }

      case 'scan_milestone': {
        html = `
          <div style="width:1080px;height:1080px;background:#0F0F0F;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;box-sizing:border-box;font-family:'Inter',sans-serif;">
            <div style="color:#D4A017;font-size:24px;letter-spacing:4px;margin-bottom:40px;">JUDGE MY DRIVING</div>
            <div style="color:#FFFFFF;font-size:64px;font-weight:700;margin-bottom:20px;text-align:center;">${driver.driver_label || driver.unique_code}</div>
            <div style="color:#D4A017;font-size:72px;font-weight:700;margin-bottom:20px;">${achievement_data.milestone_count || 100}</div>
            <div style="color:#FFFFFF;font-size:32px;margin-bottom:40px;">community ratings and counting</div>
            <div style="display:flex;gap:8px;margin-bottom:40px;">${starsHtml}</div>
            <div style="color:#CCCCCC;font-size:28px;margin-bottom:16px;">Still at ${achievement_data.avg_rating || 4.5} stars</div>
            <div style="border-top:2px solid #D4A017;width:200px;margin:40px 0;"></div>
            <div style="color:#666666;font-size:20px;">judgemydriving.com/get-started</div>
          </div>
        `;
        shareText = `${achievement_data.milestone_count || 100} people have rated my driving on @JudgeMyDriving and I'm still at ${achievement_data.avg_rating || 4.5} stars. Get your own sticker and see how you stack up. judgemydriving.com/get-started`;
        break;
      }

      case 'streak_milestone': {
        html = `
          <div style="width:1080px;height:1080px;background:#0F0F0F;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;box-sizing:border-box;font-family:'Inter',sans-serif;">
            <div style="color:#D4A017;font-size:24px;letter-spacing:4px;margin-bottom:40px;">JUDGE MY DRIVING</div>
            <div style="color:#FFFFFF;font-size:64px;font-weight:700;margin-bottom:20px;text-align:center;">${driver.driver_label || driver.unique_code}</div>
            <div style="color:#D4A017;font-size:72px;font-weight:700;margin-bottom:20px;">${achievement_data.streak_days || 30} Days</div>
            <div style="color:#FFFFFF;font-size:32px;margin-bottom:40px;">Zero safety flags</div>
            <div style="display:flex;gap:8px;margin-bottom:40px;">${starsHtml}</div>
            <div style="color:#CCCCCC;font-size:28px;margin-bottom:16px;">${achievement_data.avg_rating || 4.5} average rating</div>
            <div style="border-top:2px solid #D4A017;width:200px;margin:40px 0;"></div>
            <div style="color:#666666;font-size:20px;">judgemydriving.com/get-started</div>
          </div>
        `;
        shareText = `${achievement_data.streak_days || 30} days, zero safety flags. Clean streak on @JudgeMyDriving. judgemydriving.com/get-started`;
        break;
      }
    }

    // Call htmlcsstoimage API
    const userId = Deno.env.get('HCTI_API_USER_ID');
    const apiKey = Deno.env.get('HCTI_API_KEY');

    if (!userId || !apiKey) {
      console.error('[generateSocialCard] Missing HCTI credentials');
      return Response.json({ error: 'HCTI credentials not configured' }, { status: 500 });
    }

    const auth = btoa(`${userId}:${apiKey}`);
    const hctiRes = await fetch('https://hcti.io/v1/image', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html,
        css: '* { margin: 0; padding: 0; }',
        google_fonts: 'Inter',
        viewport_width: 1080,
        viewport_height: 1080
      })
    });

    if (!hctiRes.ok) {
      const error = await hctiRes.text();
      console.error('[generateSocialCard] HCTI API error:', error);
      return Response.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    const hctiData = await hctiRes.json();
    const imageUrl = hctiData.url;

    // Create SocialCard record
    await base44.asServiceRole.entities.SocialCard.create({
      driver_id,
      card_type,
      image_url: imageUrl,
      share_text: shareText,
      achievement_data,
      shared: false
    });

    console.log(`[generateSocialCard] Generated ${card_type} card for driver ${driver_id}: ${imageUrl}`);

    return Response.json({ success: true, image_url: imageUrl, share_text: shareText });
  } catch (error) {
    console.error('[generateSocialCard] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});