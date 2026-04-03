import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BarChart2, TrendingUp, Users, MousePointerClick, ExternalLink, Smartphone, Monitor, Tablet, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';

const CHANNEL_COLORS = {
  'Organic Search': '#22c55e',
  'Direct': '#3b82f6',
  'Organic Social': '#a855f7',
  'Referral': '#f59e0b',
  'Email': '#ec4899',
  'Paid Search': '#ef4444',
  'Unassigned': '#94a3b8',
};

const DEVICE_COLORS = { mobile: '#3b82f6', desktop: '#22c55e', tablet: '#f59e0b' };

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className={cn('w-4 h-4', color)} />
        {label}
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AdminAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-ga-traffic'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAnalyticsTrafficSources', {});
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
  });

  const sources = data?.sources || [];
  const topPages = data?.topPages || [];
  const events = data?.events || [];
  const devices = data?.devices || [];

  const totalSessions = sources.reduce((s, r) => s + r.sessions, 0);
  const totalUsers = sources.reduce((s, r) => s + r.activeUsers, 0);
  const totalViews = sources.reduce((s, r) => s + r.pageViews, 0);

  // Group by channel for the chart
  const channelMap = {};
  for (const row of sources) {
    const key = row.channel || 'Unassigned';
    if (!channelMap[key]) channelMap[key] = { channel: key, sessions: 0, users: 0 };
    channelMap[key].sessions += row.sessions;
    channelMap[key].users += row.activeUsers;
  }
  const channelData = Object.values(channelMap).sort((a, b) => b.sessions - a.sessions);

  // Device pie data
  const devicePieData = devices.map(d => ({
    name: d.device.charAt(0).toUpperCase() + d.device.slice(1),
    value: d.sessions,
    fill: DEVICE_COLORS[d.device] || '#94a3b8',
  }));

  // Top events (exclude auto-collected noise)
  const NOISE_EVENTS = new Set(['session_start', 'user_engagement', 'first_visit', 'page_view', 'scroll']);
  const meaningfulEvents = events.filter(e => !NOISE_EVENTS.has(e.eventName));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-destructive text-sm">
        Failed to load analytics: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-primary" /> Traffic & Conversions
        </h1>
        <p className="text-muted-foreground mt-1">
          Google Analytics — sticker landing pages · Last 30 days
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Total Sessions" value={totalSessions.toLocaleString()} sub="from all sources" />
        <StatCard icon={Users} label="Active Users" value={totalUsers.toLocaleString()} color="text-blue-500" sub="unique visitors" />
        <StatCard icon={MousePointerClick} label="Page Views" value={totalViews.toLocaleString()} color="text-purple-500" sub="scan page views" />
      </div>

      {/* Channel chart + Device breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Sessions by Channel</h2>
          {channelData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="channel" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="sessions" radius={[6, 6, 0, 0]} name="Sessions">
                  {channelData.map((entry) => (
                    <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Device breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Device Breakdown</h2>
          {devicePieData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={devicePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {devicePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {devicePieData.map(d => {
                  const total = devicePieData.reduce((s, x) => s + x.value, 0);
                  const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                        <span className="text-foreground">{d.name}</span>
                      </span>
                      <span className="text-muted-foreground">{pct}% <span className="text-foreground font-medium">({d.value})</span></span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Key Events / Conversions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Key Events (Conversions)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Custom events tracked site-wide · auto-collected events excluded</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Event Name</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Event Count</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Sessions</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Events / Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {meaningfulEvents.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground text-sm">No custom events tracked yet.</td></tr>
              ) : meaningfulEvents.map((ev, i) => {
                const eps = ev.sessions > 0 ? (ev.eventCount / ev.sessions).toFixed(2) : '—';
                const maxCount = meaningfulEvents[0]?.eventCount || 1;
                const pct = (ev.eventCount / maxCount) * 100;
                return (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground font-medium">{ev.eventName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-semibold text-foreground">{ev.eventCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ev.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{eps}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Pages — detailed */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Top Sticker Pages — Detail</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Most-visited /scan/* pages with engagement metrics · last 30 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">#</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Page Path</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Sessions</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Page Views</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Users</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Avg Duration</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Bounce Rate</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topPages.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">No page data yet.</td></tr>
              ) : topPages.map((page, i) => {
                const maxSessions = topPages[0]?.sessions || 1;
                const pct = (page.sessions / maxSessions) * 100;
                const code = page.path.replace('/scan/', '').replace('/', '');
                return (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold">{page.path}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-semibold text-foreground">{page.sessions.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{page.pageViews.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground">{page.activeUsers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDuration(page.avgDuration)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'font-medium',
                        page.bounceRate > 0.7 ? 'text-red-500' : page.bounceRate > 0.5 ? 'text-yellow-600' : 'text-green-600'
                      )}>
                        {(page.bounceRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://app.judgemydriving.com${page.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traffic Sources Detail */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Traffic Sources — Detail</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Source / medium breakdown for all /scan/* pages</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Channel', 'Source / Medium', 'Sessions', 'Users', 'Page Views', 'Bounce Rate'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No data yet.</td></tr>
              ) : sources.map((row, i) => {
                const pct = totalSessions > 0 ? ((row.sessions / totalSessions) * 100).toFixed(1) : 0;
                return (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHANNEL_COLORS[row.channel] || '#94a3b8' }} />
                        <span className="font-medium text-foreground">{row.channel || 'Unassigned'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{row.source} / {row.medium}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-semibold text-foreground">{row.sessions.toLocaleString()}</span>
                        <span className="text-muted-foreground text-xs">({pct}%)</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.activeUsers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground">{row.pageViews.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{(row.bounceRate * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}