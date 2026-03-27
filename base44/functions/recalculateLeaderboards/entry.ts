import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Recalculates top 10 rankings for all leaderboards (national, state, metro).
 * Runs hourly via Scheduled Automation.
 * Stores results in LeaderboardCache for instant page loads.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();

    // Get all stickers and feedback
    const stickers = await base44.asServiceRole.entities.Sticker.list('-created_date');
    const allFeedback = await base44.asServiceRole.entities.Feedback.list('-created_date');

    // Define time periods and date ranges
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

    const timePeriods = {
      monthly: { start: monthStart, minScans: 3 },
      quarterly: { start: quarterStart, minScans: 5 },
      alltime: { start: null, minScans: 10 }
    };

    // Function: check if driver is eligible for leaderboards
    const isEligible = (driver) => {
      return driver.public_scorecard === true &&
        driver.status === 'active' &&
        !driver.leaderboard_suspended;
    };

    // Function: calculate driver metrics for a time period
    const getMetricsForPeriod = (driver, feedbacks, periodStart) => {
      let scans = feedbacks.filter(f => f._stickerId === driver.id);
      if (periodStart) {
        scans = scans.filter(f => new Date(f.created_date) >= periodStart);
      }
      
      if (scans.length === 0) return null;

      const ratings = scans.map(s => s.rating).filter(r => r);
      const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b) / ratings.length) : 0;

      return {
        scan_count: scans.length,
        avg_rating: parseFloat(avgRating.toFixed(1)),
        clean_streak_days: driver.clean_streak_days || 0
      };
    };

    // Function: build ranking entry
    const makeRankingEntry = (rank, driver, metrics) => {
      return {
        rank,
        driver_id: driver.id,
        display_name: driver.driver_label || driver.unique_code,
        location: driver.home_state ? `${driver.home_state}` : 'Unknown',
        avg_rating: metrics.avg_rating,
        scan_count: metrics.scan_count,
        highest_badge: driver.highest_badge || null,
        clean_streak_days: metrics.clean_streak_days,
        profile_url: `/driver/${driver.unique_code}`,
        company_name: driver.show_company_name && driver.fleet_group ? driver.fleet_group : null
      };
    };

    // Build leaderboards for each time period
    const cacheUpdates = [];

    for (const [period, config] of Object.entries(timePeriods)) {
      // Eligible drivers with metrics
      const driverMetrics = [];
      for (const driver of stickers) {
        if (!isEligible(driver)) continue;
        const metrics = getMetricsForPeriod(driver, allFeedback.map(f => ({ ...f, _stickerId: f.sticker_id })), config.start);
        if (metrics && metrics.scan_count >= config.minScans && metrics.avg_rating >= 3.5) {
          driverMetrics.push({ driver, metrics });
        }
      }

      // Sort by rating, then scan count, then streak
      driverMetrics.sort((a, b) => {
        if (b.metrics.avg_rating !== a.metrics.avg_rating) {
          return b.metrics.avg_rating - a.metrics.avg_rating;
        }
        if (b.metrics.scan_count !== a.metrics.scan_count) {
          return b.metrics.scan_count - a.metrics.scan_count;
        }
        return b.metrics.clean_streak_days - a.metrics.clean_streak_days;
      });

      // NATIONAL TOP 10
      const nationalTop10 = driverMetrics.slice(0, 10).map((dm, idx) => makeRankingEntry(idx + 1, dm.driver, dm.metrics));
      cacheUpdates.push({
        scope: 'national',
        time_period: period,
        rankings: nationalTop10,
        calculated_at: now.toISOString()
      });

      // STATE TOP 10 (for each state)
      const stateGroups = {};
      for (const dm of driverMetrics) {
        const state = dm.driver.home_state_slug || 'unknown';
        if (!stateGroups[state]) stateGroups[state] = [];
        stateGroups[state].push(dm);
      }

      for (const [stateSlug, drivers] of Object.entries(stateGroups)) {
        const stateTop10 = drivers.slice(0, 10).map((dm, idx) => makeRankingEntry(idx + 1, dm.driver, dm.metrics));
        cacheUpdates.push({
          scope: `state:${stateSlug}`,
          time_period: period,
          rankings: stateTop10,
          calculated_at: now.toISOString()
        });
      }

      // METRO TOP 10 (for each metro)
      const metroGroups = {};
      for (const dm of driverMetrics) {
        const metro = dm.driver.home_metro_slug || 'unknown';
        if (!metroGroups[metro]) metroGroups[metro] = [];
        metroGroups[metro].push(dm);
      }

      for (const [metroSlug, drivers] of Object.entries(metroGroups)) {
        if (metroSlug === 'unknown') continue; // Skip drivers with no metro
        const metroTop10 = drivers.slice(0, 10).map((dm, idx) => makeRankingEntry(idx + 1, dm.driver, dm.metrics));
        cacheUpdates.push({
          scope: `metro:${metroSlug}`,
          time_period: period,
          rankings: metroTop10,
          calculated_at: now.toISOString()
        });
      }
    }

    // Upsert into LeaderboardCache
    for (const update of cacheUpdates) {
      const existing = await base44.asServiceRole.entities.LeaderboardCache.filter({
        scope: update.scope,
        time_period: update.time_period
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.LeaderboardCache.update(existing[0].id, update);
      } else {
        await base44.asServiceRole.entities.LeaderboardCache.create(update);
      }
    }

    console.log(`[recalculateLeaderboards] Updated ${cacheUpdates.length} leaderboard cache entries`);
    return Response.json({ success: true, entries_updated: cacheUpdates.length });
  } catch (error) {
    console.error('[recalculateLeaderboards] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});