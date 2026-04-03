import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const GA4_PROPERTY_ID = '14307164108';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');

    const body = {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
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
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'BEGINS_WITH',
            value: '/scan/',
          },
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    };

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
      console.error('[getAnalyticsTrafficSources] GA4 API error:', err);
      return Response.json({ error: `GA4 API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();

    // Also fetch overall top pages
    const pagesBody = {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'BEGINS_WITH', value: '/scan/' },
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    };

    const pagesResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagesBody),
      }
    );

    const pagesData = pagesResponse.ok ? await pagesResponse.json() : null;

    // Parse traffic sources
    const sources = (data.rows || []).map((row) => ({
      channel: row.dimensionValues[0].value,
      source: row.dimensionValues[1].value,
      medium: row.dimensionValues[2].value,
      sessions: parseInt(row.metricValues[0].value),
      activeUsers: parseInt(row.metricValues[1].value),
      pageViews: parseInt(row.metricValues[2].value),
      bounceRate: parseFloat(row.metricValues[3].value),
    }));

    // Parse top pages
    const topPages = (pagesData?.rows || []).map((row) => ({
      path: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      pageViews: parseInt(row.metricValues[1].value),
    }));

    return Response.json({ sources, topPages });
  } catch (error) {
    console.error('[getAnalyticsTrafficSources] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});