import React from 'react';
import { TrendingUp, TrendingDown, Users, Activity, Star, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function FleetStatCardsWithTrend({ metrics }) {
  const { totalDrivers, totalScans, avgRating, safetyIncidents, unresolvedIncidents, allFeedback, dateRange } = metrics;

  // Helper to calculate previous period metrics
  const getPreviousPeriodMetrics = (filteredStickers, allCorrectiveActions) => {
    if (!dateRange) return null; // All time has no trend

    const currentStart = moment().subtract(dateRange, 'days');
    const previousStart = currentStart.clone().subtract(dateRange, 'days');

    const previousFeedback = allFeedback.filter(f => {
      const d = moment(f.created_date);
      return d.isBetween(previousStart, currentStart, null, '[]');
    });

    const previousUnresolvedCount = previousFeedback
      .filter(f => f.safety_flag)
      .filter(f => {
        const action = allCorrectiveActions.find(a => a.incident_id === f.id);
        return !action || action.status !== 'Resolved';
      }).length;

    const previousReviewedCount = new Set(previousFeedback.map(f => f._stickerId)).size;
    const previousAvgRating = previousReviewedCount > 0
      ? parseFloat((previousFeedback.reduce((s, f) => s + f.rating, 0) / previousFeedback.length).toFixed(1))
      : 0;

    return { previousFeedback, previousUnresolvedCount, previousAvgRating };
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

  const prev = getPreviousPeriodMetrics(metrics.filteredStickers, metrics.allCorrectiveActions);

  // Calculate previous period metrics
  let prevMetrics = {};
  if (prev) {
    prevMetrics.scans = prev.previousFeedback.length;
    prevMetrics.incidents = prev.previousFeedback.filter(f => f.safety_flag).length;
    prevMetrics.avgRating = prev.previousAvgRating;
    prevMetrics.unresolved = prev.previousUnresolvedCount;
  }

  const statCards = [
    {
      label: 'Total Drivers',
      value: totalDrivers,
      trend: null,
      icon: Users,
    },
    {
      label: 'Total Scans',
      value: totalScans,
      trend: prev ? calculateTrend(totalScans, prevMetrics.scans) : null,
      isNegativeBetter: false,
      icon: Activity,
    },
    {
      label: 'Fleet Avg Rating',
      value: avgRating,
      trend: prev && prevMetrics.avgRating ? calculateTrend(avgRating - prevMetrics.avgRating, prevMetrics.avgRating) : null,
      isNegativeBetter: false,
      icon: Star,
    },
    {
      label: 'Safety Incidents',
      value: safetyIncidents,
      trend: prev ? calculateTrend(safetyIncidents, prevMetrics.incidents) : null,
      isNegativeBetter: true,
      icon: AlertTriangle,
    },
    {
      label: 'Unresolved Incidents',
      value: unresolvedIncidents,
      trend: prev ? calculateTrend(unresolvedIncidents, prevMetrics.unresolved) : null,
      isNegativeBetter: true,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-card border border-border rounded-2xl px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <Icon className="w-4 h-4 text-primary/60" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              {card.trend !== null && card.trend !== undefined && (
                <TrendIndicator value={card.trend} isNegativeBetter={card.isNegativeBetter} />
              )}
            </div>
            {card.trend !== null && card.trend !== undefined && (
              <p className="text-xs text-muted-foreground">vs last period</p>
            )}
          </div>
        );
      })}
    </div>
  );
}