import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sales = await base44.asServiceRole.entities.Sale.list('-created_date');

    // Calculate metrics
    const activeSales = sales.filter(s => s.status === 'active');
    const totalRevenue = sales.reduce((sum, s) => sum + (s.total_revenue || 0), 0);

    // Monthly revenue (sales updated in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRevenue = sales
      .filter(s => new Date(s.updated_date) >= thirtyDaysAgo)
      .reduce((sum, s) => sum + (s.subscription_amount || 0), 0);

    // New sales (created in last 30 days)
    const newSales = sales.filter(s => new Date(s.created_date) >= thirtyDaysAgo).length;

    return Response.json({
      success: true,
      data: {
        allSales: sales,
        activeSales: activeSales,
        metrics: {
          totalRevenue,
          monthlyRevenue,
          activeSalesCount: activeSales.length,
          totalSalesCount: sales.length,
          newSalesCount: newSales,
        }
      }
    });
  } catch (error) {
    console.error('[getSalesData] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});