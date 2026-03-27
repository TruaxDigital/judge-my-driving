import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Reverse geocodes a lat/lon to US state and metro area using Nominatim API.
 * Triggered after each feedback scan submission.
 * Stores state, city, metro_name, metro_slug on the Feedback record.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { feedback_id, latitude, longitude } = body;
    
    if (!feedback_id || latitude === undefined || longitude === undefined) {
      return Response.json({ error: 'Missing feedback_id, latitude, or longitude' }, { status: 400 });
    }

    // Call Nominatim API for reverse geocoding
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const nominatimRes = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'JudgeMyDriving/1.0 (support@judgemydriving.com)'
      }
    });

    if (!nominatimRes.ok) {
      console.warn(`[geocodeScanLocation] Nominatim API error: ${nominatimRes.status}`);
      return Response.json({ success: true, warning: 'Nominatim API failed, storing null for location' });
    }

    const nominatimData = await nominatimRes.json();
    const address = nominatimData.address || {};
    
    // Validate US location
    if (address.country_code !== 'us') {
      console.log(`[geocodeScanLocation] Non-US location detected for feedback ${feedback_id}`);
      return Response.json({ success: true, location: 'non-us' });
    }

    const state = address.state || null;
    const city = address.city || address.county || null;

    // Look up metro area
    let metro_name = null;
    let metro_slug = null;

    if (state && city) {
      const metros = await base44.asServiceRole.entities.MetroAreaMapping.filter({});
      for (const metro of metros) {
        const stateMatch = metro.states.some(s => s.toLowerCase() === state.toLowerCase());
        const cityMatch = metro.cities_include.some(c => c.toLowerCase() === city.toLowerCase());
        if (stateMatch && cityMatch) {
          metro_name = metro.metro_name;
          metro_slug = metro.metro_slug;
          break;
        }
      }
    }

    // Update feedback record with location data
    await base44.asServiceRole.entities.Feedback.update(feedback_id, {
      state,
      city,
      metro_name,
      metro_slug
    });

    console.log(`[geocodeScanLocation] Feedback ${feedback_id}: ${state}, ${city}, metro: ${metro_slug || 'none'}`);

    return Response.json({ success: true, state, city, metro_slug });
  } catch (error) {
    console.error('[geocodeScanLocation] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});