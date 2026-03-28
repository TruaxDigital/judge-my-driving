import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function FleetStatCardsWithTrend({ metrics }) {
  const { totalDrivers, totalScans, avgRating, safetyIncidents, unresolvedIncidents, allFeedback, dateRange } = metrics;

  // Helper to calculate previous period metrics
  const getPreviousPeriodMetrics = () => {
    if (!dateRange) return null; // All time has no trend

    const currentStart = moment().subtract(dateRange, 'days');
    const previousStart = currentStart.clone().subtract(dateRange, 'days');

    const previousFeedback = allFeedback.filter(f => {
      const d = moment(f.created_date);
      return d.isBetween(previousStart, currentStart, null, '[]');
    });

    return { previousFeedback };
  };

  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return parseFloat(change.toFixed(1));
  };

  const TrendIndicator = ({ value, isNegativeBetter = false }) => {
    const isPositive = value > 0;
    const shouldBeGood = isNegativeBetter ? !isPositive : isPositive;

    return (
      <div className={cn('flex items-center gap-1 text-xs font-medium', shouldBeGood ? 'text-green-600' : 'text-red-600')}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(value)}%
      </div>
    );
  };

  const prev = getPreviousPeriodMetrics();

  // Calculate previous period metrics
  let prevMetrics = {};
  if (prev) {
    prevMetrics.scans = prev.previousFeedback.length;
    prevMetrics.incidents = prev.previousFeedback.filter(f => f.safety_flag).length;
  }

  const statCards = [
    {
      label: 'Total Drivers',
      value: totalDrivers,
      trend: null, // Drivers don't change much in 30 days
    },
    {
      label: 'Total Scans',
      value: totalScans,
      trend: prev ? calculateTrend(totalScans, prevMetrics.scans) : null,
      isNegativeBetter: false,
    },
    {
      label: 'Fleet Avg Rating',
      value: avgRating,
      trend: null, // Rating average is harder to trend
    },
    {
      label: 'Safety Incidents',
      value: safetyIncidents,
      trend: prev ? calculateTrend(safetyIncidents, prevMetrics.incidents) : null,
      isNegativeBetter: true, // Lower is better
    },
    {
      label: 'Unresolved Incidents',
      value: unresolvedIncidents,
      trend: null, // Harder to calculate without historical corrective actions
      isNegativeBetter: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card) => (
        <div key={card.label} className="bg-card border border-border rounded-2xl px-6 py-5 space-y-1">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            {card.trend !== null && card.trend !== undefined && (
              <TrendIndicator value={card.trend} isNegativeBetter={card.isNegativeBetter} />
            )}
          </div>
          {card.trend !== null && card.trend !== undefined && (
            <p className="text-xs text-muted-foreground">vs last {card.label === 'Fleet Avg Rating' ? '30d' : 'period'}</p>
          )}
        </div>
      ))}
    </div>
  );
}