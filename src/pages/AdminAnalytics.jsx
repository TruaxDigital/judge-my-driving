import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BarChart2, TrendingUp, Users, MousePointerClick, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const CHANNEL_COLORS = {
  'Organic Search': '#22c55e',
  'Direct': '#3b82f6',
  'Organic Social': '#a855f7',
  'Referral': '#f59e0b',
  'Email': '#ec4899',
  'Paid Search': '#ef4444',
  'Unassigned': '#94a3b8',
};

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
          <BarChart2 className="w-7 h-7 text-primary" /> Traffic Sources
        </h1>
        <p className="text-muted-foreground mt-1">
          Google Analytics — sticker landing pages (<code className="text-xs bg-muted px-1 py-0.5 rounded">/scan/*</code>) · Last 30 days
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Total Sessions" value={totalSessions.toLocaleString()} sub="from all sources" />
        <StatCard icon={Users} label="Active Users" value={totalUsers.toLocaleString()} color="text-blue-500" sub="unique visitors" />
        <StatCard icon={MousePointerClick} label="Page Views" value={totalViews.toLocaleString()} color="text-purple-500" sub="scan page views" />
      </div>

      {/* Channel chart */}
      {channelData.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Sessions by Channel</h2>
          <ResponsiveContainer width="100%" height={220}>
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
        </div>
      )}

      {/* Detailed sources table */}
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
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No data yet — scans may not have GA4 tracking yet.</td></tr>
              ) : sources.map((row, i) => {
                const pct = totalSessions > 0 ? ((row.sessions / totalSessions) * 100).toFixed(1) : 0;
                return (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: CHANNEL_COLORS[row.channel] || '#94a3b8' }}
                        />
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

      {/* Top sticker pages */}
      {topPages.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Top Sticker Pages</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Most-visited scan URLs in the last 30 days</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Page Path</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Sessions</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Page Views</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topPages.map((page, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{page.path}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{page.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground">{page.pageViews.toLocaleString()}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}