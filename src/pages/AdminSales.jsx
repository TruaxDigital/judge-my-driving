import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, DollarSign, HandshakeIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function AdminSales() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: salesData, isLoading: salesLoading, error } = useQuery({
    queryKey: ['hubspot-deals'],
    queryFn: () => base44.functions.invoke('getHubSpotDeals', {}),
    enabled: !!user && user.role === 'admin',
  });

  const isLoading = userLoading || salesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground font-semibold">Access Denied</p>
        <p className="text-muted-foreground text-sm mt-1">This page is for admins only.</p>
      </div>
    );
  }

  if (error || !salesData?.data) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground font-semibold">Error Loading Sales Data</p>
        <p className="text-muted-foreground text-sm mt-1">{error?.message || 'Could not connect to HubSpot'}</p>
      </div>
    );
  }

  const { metrics, allDeals, openDeals, closedWonDeals } = salesData.data;

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${metrics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      label: 'Monthly Revenue (30d)',
      value: `$${metrics.monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      label: 'Open Deals',
      value: metrics.openDealsCount,
      icon: HandshakeIcon,
      color: 'text-amber-600',
    },
    {
      label: 'Closed Deals',
      value: metrics.closedDealsCount,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground mt-1">HubSpot CRM metrics and deal pipeline</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border border-border rounded-2xl px-6 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Open Deals */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Open Deals ({openDeals.length})</h2>
        {openDeals.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No open deals</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Deal Name', 'Stage', 'Amount', 'Close Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{deal.name}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{deal.stage}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      ${deal.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {deal.closeDate ? moment(deal.closeDate).format('MMM D, YYYY') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closed Deals */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Closed Deals ({closedWonDeals.length})</h2>
        {closedWonDeals.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No closed deals</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Deal Name', 'Amount', 'Closed Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {closedWonDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{deal.name}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      ${deal.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {deal.closeDate ? moment(deal.closeDate).format('MMM D, YYYY') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}