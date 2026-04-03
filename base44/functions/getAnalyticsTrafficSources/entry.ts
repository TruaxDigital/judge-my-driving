import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const GA4_PROPERTY_ID = '531197101';

async function runReport(accessToken, body) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GA4 API error: ${err}`);
  }
  return response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');

    const dateRange = { startDate: '30daysAgo', endDate: 'today' };
    const scanFilter = {
      filter: {
        fieldName: 'pagePath',
        stringFilter: { matchType: 'BEGINS_WITH', value: '/scan/' },
      },
    };

    // Run all 4 reports in parallel
    const [sourcesData, pagesData, conversionData, deviceData] = await Promise.all([
      // Traffic sources
      runReport(accessToken, {
        dateRanges: [dateRange],
        dimensions: [
          { name: 'sessionDefaultChannelGroup' },
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
        ],
        dimensionFilter: scanFilter,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 20,
      }),

      // Top pages with engagement metrics
      runReport(accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
        dimensionFilter: scanFilter,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 25,
      }),

      // Key events (conversions) — site-wide
      runReport(accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 20,
      }),

      // Device breakdown for scan pages
      runReport(accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        dimensionFilter: scanFilter,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
    ]);

    // Parse traffic sources
    const sources = (sourcesData.rows || []).map((row) => ({
      channel: row.dimensionValues[0].value,
      source: row.dimensionValues[1].value,
      medium: row.dimensionValues[2].value,
      sessions: parseInt(row.metricValues[0].value),
      activeUsers: parseInt(row.metricValues[1].value),
      pageViews: parseInt(row.metricValues[2].value),
      bounceRate: parseFloat(row.metricValues[3].value),
    }));

    // Parse top pages
    const topPages = (pagesData.rows || []).map((row) => ({
      path: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      pageViews: parseInt(row.metricValues[1].value),
      activeUsers: parseInt(row.metricValues[2].value),
      avgDuration: parseFloat(row.metricValues[3].value),
      bounceRate: parseFloat(row.metricValues[4].value),
    }));

    // Parse events/conversions
    const events = (conversionData.rows || []).map((row) => ({
      eventName: row.dimensionValues[0].value,
      eventCount: parseInt(row.metricValues[0].value),
      sessions: parseInt(row.metricValues[1].value),
    }));

    // Parse device breakdown
    const devices = (deviceData.rows || []).map((row) => ({
      device: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      activeUsers: parseInt(row.metricValues[1].value),
    }));

    return Response.json({ sources, topPages, events, devices });
  } catch (error) {
    console.error('[getAnalyticsTrafficSources] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});