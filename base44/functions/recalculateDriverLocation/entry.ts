import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Recalculates each driver's home_state and home_metro based on scan locations.
 * Can be called by nightly automation OR after a driver hits milestones (5, 10, 25, 50 scans).
 * 
 * If called via automation, reads all drivers. If called directly, accepts optional driver_id for milestone recalc.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { driver_id } = body; // Optional: if provided, only recalc this driver

    let drivers = [];
    if (driver_id) {
      // Milestone recalc for single driver
      const driver = await base44.asServiceRole.entities.Sticker.filter({ id: driver_id });
      drivers = driver;
    } else {
      // Nightly recalc: get all drivers with at least 5 scans
      drivers = await base44.asServiceRole.entities.Sticker.list();
    }

    let updated_count = 0;

    for (const driver of drivers) {
      // Get all feedback/scans for this driver
      const feedbacks = await base44.asServiceRole.entities.Feedback.filter({ sticker_id: driver.id });
      
      if (feedbacks.length < 5 && !driver_id) continue; // Skip if not enough scans (unless single-driver recalc)

      // Count scans by state
      const stateCounts = {};
      const metroCounts = {};

      for (const fb of feedbacks) {
        if (fb.state) {
          stateCounts[fb.state] = (stateCounts[fb.state] || 0) + 1;
        }
        if (fb.metro_slug) {
          metroCounts[fb.metro_slug] = (metroCounts[fb.metro_slug] || 0) + 1;
        }
      }

      // Find most common state and metro
      const home_state = Object.keys(stateCounts).length > 0
        ? Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;
      
      const home_metro_slug = Object.keys(metroCounts).length > 0
        ? Object.entries(metroCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

      // Get metro name from MetroAreaMapping
      let home_metro_name = null;
      if (home_metro_slug) {
        const metros = await base44.asServiceRole.entities.MetroAreaMapping.filter({ metro_slug: home_metro_slug });
        if (metros.length > 0) {
          home_metro_name = metros[0].metro_name;
        }
      }

      // Generate state slug (lowercase, spaces to hyphens)
      const home_state_slug = home_state ? home_state.toLowerCase().replace(/\s+/g, '-') : null;

      // Update driver record
      await base44.asServiceRole.entities.Sticker.update(driver.id, {
        home_state,
        home_state_slug,
        home_metro: home_metro_name,
        home_metro_slug
      });

      updated_count++;
      console.log(`[recalculateDriverLocation] Driver ${driver.id}: ${home_state_slug || 'none'}, ${home_metro_slug || 'none'}`);
    }

    console.log(`[recalculateDriverLocation] Updated ${updated_count} drivers`);
    return Response.json({ success: true, updated_count });
  } catch (error) {
    console.error('[recalculateDriverLocation] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});