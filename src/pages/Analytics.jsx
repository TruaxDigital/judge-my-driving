import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, BarChart2, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import moment from 'moment';

export default function Analytics() {
  const [groupFilter, setGroupFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stickers = [] } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id });
    },
  });

  const isFleet = ['fleet_admin', 'admin'].includes(user?.role) || user?.plan === 'fleet';

  const fleetGroups = useMemo(() => {
    const groups = [...new Set(stickers.map(s => s.fleet_group).filter(Boolean))];
    return groups;
  }, [stickers]);

  const filteredStickers = useMemo(() => {
    if (!isFleet || groupFilter === 'all') return stickers;
    return stickers.filter(s => s.fleet_group === groupFilter);
  }, [stickers, groupFilter, isFleet]);

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['all-feedback', stickers],
    queryFn: async () => {
      if (stickers.length === 0) return [];
      const all = [];
      for (const s of stickers) {
        const fb = await base44.entities.Feedback.filter({ sticker_id: s.id });
        all.push(...fb.map(f => ({ ...f, _stickerId: s.id })));
      }
      return all.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: stickers.length > 0,
  });

  const filteredFeedback = useMemo(() => {
    if (!isFleet || groupFilter === 'all') return feedback;
    const ids = new Set(filteredStickers.map(s => s.id));
    return feedback.filter(f => ids.has(f._stickerId));
  }, [feedback, filteredStickers, groupFilter, isFleet]);

  // Feedback frequency over last 30 days
  const frequencyData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const day = moment().subtract(i, 'days');
      const count = filteredFeedback.filter(f => moment(f.created_date).isSame(day, 'day')).length;
      days.push({ date: day.format('MMM D'), count });
    }
    return days;
  }, [filteredFeedback]);

  // Rating distribution
  const distributionData = useMemo(() => {
    return [1, 2, 3, 4, 5].map(star => ({
      star: `${star}★`,
      count: filteredFeedback.filter(f => f.rating === star).length,
    }));
  }, [filteredFeedback]);

  // Peak times by hour of day
  const peakTimesData = useMemo(() => {
    const slots = [
      { label: '12am–6am', hours: [0, 1, 2, 3, 4, 5] },
      { label: '6am–9am', hours: [6, 7, 8] },
      { label: '9am–12pm', hours: [9, 10, 11] },
      { label: '12pm–3pm', hours: [12, 13, 14] },
      { label: '3pm–6pm', hours: [15, 16, 17] },
      { label: '6pm–9pm', hours: [18, 19, 20] },
      { label: '9pm–12am', hours: [21, 22, 23] },
    ];
    return slots.map(slot => ({
      label: slot.label,
      count: filteredFeedback.filter(f => slot.hours.includes(moment(f.created_date).hour())).length,
    }));
  }, [filteredFeedback]);

  const peakSlot = peakTimesData.reduce((max, s) => s.count > max.count ? s : max, peakTimesData[0] || { label: '—', count: 0 });

  const ratingColors = { '1★': '#ef4444', '2★': '#f97316', '3★': '#eab308', '4★': '#84cc16', '5★': '#22c55e' };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Understand your feedback patterns over time.</p>
        </div>
        {isFleet && fleetGroups.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">Fleet group:</span>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {fleetGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {filteredFeedback.length === 0 && feedback.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <BarChart2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No feedback yet — analytics will appear once you start receiving ratings.</p>
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <BarChart2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No feedback for this fleet group yet.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Frequency over time */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Feedback Frequency — Last 30 Days</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                  name="Feedback"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution + Peak times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Rating distribution */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Rating Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distributionData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="star" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Ratings">
                    {distributionData.map((entry) => (
                      <Cell key={entry.star} fill={ratingColors[entry.star]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Peak times */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Peak Times</h2>
              </div>
              {peakSlot.count > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Most feedback received during </span>
                  <span className="font-semibold text-primary">{peakSlot.label}</span>
                </div>
              )}
              <div className="space-y-2">
                {peakTimesData.map((slot) => {
                  const max = Math.max(...peakTimesData.map(s => s.count), 1);
                  const pct = Math.round((slot.count / max) * 100);
                  return (
                    <div key={slot.label} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 shrink-0">{slot.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-4 text-right">{slot.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}