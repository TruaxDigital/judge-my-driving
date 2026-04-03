import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, QrCode, MousePointerClick, ShoppingCart, TrendingUp, Activity, Search, ArrowUpDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import moment from 'moment';

const DATE_RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: 'All time', value: null },
];

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

function SortableTh({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <th
      className="text-left px-4 py-3 text-muted-foreground font-medium text-xs cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('w-3 h-3', active ? 'text-primary' : 'opacity-30')} />
      </span>
    </th>
  );
}

export default function AdminStickers() {
  const [dateRange, setDateRange] = useState(30);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('scans');
  const [sortDir, setSortDir] = useState('desc');

  const { data: scanEvents = [], isLoading: loadingScans } = useQuery({
    queryKey: ['admin-scan-events'],
    queryFn: () => base44.entities.ScanEvent.list('-created_date', 2000),
  });

  const { data: stickers = [], isLoading: loadingStickers } = useQuery({
    queryKey: ['admin-all-stickers'],
    queryFn: () => base44.entities.Sticker.list('-created_date', 2000),
  });

  const isLoading = loadingScans || loadingStickers;

  const cutoff = dateRange ? moment().subtract(dateRange, 'days').toISOString() : null;
  const filtered = useMemo(() => {
    if (!cutoff) return scanEvents;
    return scanEvents.filter(e => e.created_date >= cutoff);
  }, [scanEvents, cutoff]);

  const scans = useMemo(() => filtered.filter(e => e.event_type === 'scan'), [filtered]);
  const ctaClicks = useMemo(() => filtered.filter(e => e.event_type === 'cta_click'), [filtered]);

  const totalScans = scans.length;
  const totalCTAs = ctaClicks.length;
  const ctaRate = totalScans > 0 ? ((totalCTAs / totalScans) * 100).toFixed(1) : '0.0';
  const uniqueStickersScanned = new Set(scans.map(e => e.sticker_code)).size;
  const ctasWithRating = ctaClicks.filter(e => e.rating_given != null);
  const avgRatingOnCTA = ctasWithRating.length > 0
    ? (ctasWithRating.reduce((s, e) => s + e.rating_given, 0) / ctasWithRating.length).toFixed(1)
    : '—';

  // ── Design performance table ───────────────────────────────────────────────
  // "Sales" = how many registered stickers have that design_id (all-time proxy)
  const designRows = useMemo(() => {
    const map = {};
    // Count scans & CTA clicks from events (date-filtered)
    for (const e of filtered) {
      const key = e.design_id || 'default';
      if (!map[key]) map[key] = { design_id: key, scans: 0, cta_clicks: 0, sticker_count: 0 };
      if (e.event_type === 'scan') map[key].scans++;
      if (e.event_type === 'cta_click') map[key].cta_clicks++;
    }
    // Count stickers sold per design (all-time from sticker records, not date-filtered)
    for (const s of stickers) {
      const key = s.design_id || 'default';
      if (!map[key]) map[key] = { design_id: key, scans: 0, cta_clicks: 0, sticker_count: 0 };
      map[key].sticker_count++;
    }
    return Object.values(map).map(d => ({
      ...d,
      cta_rate: d.scans > 0 ? ((d.cta_clicks / d.scans) * 100).toFixed(1) : '0.0',
      scans_per_sticker: d.sticker_count > 0 ? (d.scans / d.sticker_count).toFixed(1) : '0.0',
    }));
  }, [filtered, stickers]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const sortedDesignRows = useMemo(() => {
    return [...designRows].sort((a, b) => {
      const av = parseFloat(a[sortField]) || 0;
      const bv = parseFloat(b[sortField]) || 0;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [designRows, sortField, sortDir]);

  // ── Per-sticker table ──────────────────────────────────────────────────────
  const stickerRows = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      const key = e.sticker_code;
      if (!map[key]) {
        const rec = stickers.find(s => s.unique_code === key);
        map[key] = {
          code: key,
          label: rec?.driver_label || '—',
          design_id: rec?.design_id || e.design_id || 'default',
          scans: 0,
          cta_clicks: 0,
          last_scan: null,
        };
      }
      if (e.event_type === 'scan') {
        map[key].scans++;
        if (!map[key].last_scan || e.created_date > map[key].last_scan) map[key].last_scan = e.created_date;
      }
      if (e.event_type === 'cta_click') map[key].cta_clicks++;
    }
    return Object.values(map)
      .map(r => ({ ...r, cta_rate: r.scans > 0 ? ((r.cta_clicks / r.scans) * 100).toFixed(1) : '0.0' }))
      .sort((a, b) => b.scans - a.scans);
  }, [filtered, stickers]);

  const filteredRows = useMemo(() => {
    if (!search) return stickerRows;
    const q = search.toLowerCase();
    return stickerRows.filter(r =>
      r.code.toLowerCase().includes(q) ||
      r.label.toLowerCase().includes(q) ||
      r.design_id.toLowerCase().includes(q)
    );
  }, [stickerRows, search]);

  // ── Time series chart ──────────────────────────────────────────────────────
  const timeSeriesData = useMemo(() => {
    const buckets = [];
    const totalDays = dateRange || 90;
    if (totalDays <= 14) {
      for (let i = totalDays - 1; i >= 0; i--) {
        const day = moment().subtract(i, 'days');
        buckets.push({
          date: day.format('MMM D'),
          scans: scans.filter(e => moment(e.created_date).isSame(day, 'day')).length,
          cta_clicks: ctaClicks.filter(e => moment(e.created_date).isSame(day, 'day')).length,
        });
      }
    } else if (totalDays <= 90) {
      for (let i = 11; i >= 0; i--) {
        const week = moment().subtract(i, 'weeks').startOf('week');
        buckets.push({
          date: week.format('MMM D'),
          scans: scans.filter(e => moment(e.created_date).isSame(week, 'week')).length,
          cta_clicks: ctaClicks.filter(e => moment(e.created_date).isSame(week, 'week')).length,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const month = moment().subtract(i, 'months');
        buckets.push({
          date: month.format('MMM YY'),
          scans: scans.filter(e => moment(e.created_date).isSame(month, 'month')).length,
          cta_clicks: ctaClicks.filter(e => moment(e.created_date).isSame(month, 'month')).length,
        });
      }
    }
    return buckets;
  }, [scans, ctaClicks, dateRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" /> Sticker Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Live scan data, CTA clicks, and conversion funnel.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {DATE_RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setDateRange(r.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                dateRange === r.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top-line stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={QrCode} label="Total Scans" value={totalScans.toLocaleString()} sub={`${uniqueStickersScanned} unique stickers`} />
        <StatCard icon={MousePointerClick} label="CTA Clicks" value={totalCTAs.toLocaleString()} color="text-blue-500" sub="'Get Your Sticker' taps" />
        <StatCard icon={TrendingUp} label="Scan → CTA Rate" value={`${ctaRate}%`} color="text-green-500" sub="Viral conversion rate" />
        <StatCard icon={ShoppingCart} label="Avg Rating on CTA" value={avgRatingOnCTA} color="text-yellow-500" sub="Rating when CTA tapped" />
        <StatCard icon={Activity} label="Active Stickers" value={stickers.filter(s => s.status === 'active' || s.is_registered).length} sub="Registered & active" color="text-purple-500" />
      </div>

      {/* Scans + CTA over time */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Scans & CTA Clicks Over Time</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Line type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Scans" />
            <Line type="monotone" dataKey="cta_clicks" stroke="#3b82f6" strokeWidth={2} dot={false} name="CTA Clicks" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-primary inline-block" /> Scans</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-blue-500 border-dashed inline-block" /> CTA Clicks</span>
        </div>
      </div>

      {/* ── Design Performance Table ─────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Design Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stickers sold = all-time count. Scans & CTA rate = selected date range. Click column headers to sort.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">Design</th>
                <SortableTh label="Stickers Sold" field="sticker_count" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Scans" field="scans" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="CTA Clicks" field="cta_clicks" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="CTA Rate" field="cta_rate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Scans / Sticker" field="scans_per_sticker" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedDesignRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No data yet.</td>
                </tr>
              ) : sortedDesignRows.map((d, i) => {
                const ctaNum = parseFloat(d.cta_rate);
                return (
                  <tr key={d.design_id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {i === 0 && <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">#{i + 1}</span>}
                        {i === 1 && <span className="text-xs font-bold text-zinc-400 bg-zinc-500/10 px-1.5 py-0.5 rounded">#{i + 1}</span>}
                        {i === 2 && <span className="text-xs font-bold text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded">#{i + 1}</span>}
                        {i > 2 && <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>}
                        <span className="capitalize font-medium text-foreground">{d.design_id.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{d.sticker_count}</td>
                    <td className="px-4 py-3 text-foreground">{d.scans}</td>
                    <td className="px-4 py-3 text-blue-500 font-semibold">{d.cta_clicks}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-green-500 transition-all"
                            style={{ width: `${Math.min(ctaNum * 5, 100)}%` }}
                          />
                        </div>
                        <span className={cn(
                          'font-semibold text-xs',
                          ctaNum >= 10 ? 'text-green-600' : ctaNum >= 3 ? 'text-yellow-600' : 'text-muted-foreground'
                        )}>
                          {d.cta_rate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.scans_per_sticker}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Per-Sticker Breakdown ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">Per-Sticker Breakdown</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search code, label, design…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Code', 'Label', 'Design', 'Scans', 'CTA Clicks', 'CTA Rate', 'Last Scan'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No scan data yet for this period.
                  </td>
                </tr>
              ) : filteredRows.map(r => (
                <tr key={r.code} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold">{r.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.label}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{r.design_id.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{r.scans}</td>
                  <td className="px-4 py-3 text-blue-500 font-semibold">{r.cta_clicks}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'font-semibold',
                      parseFloat(r.cta_rate) >= 10 ? 'text-green-600' :
                      parseFloat(r.cta_rate) >= 3 ? 'text-yellow-600' : 'text-muted-foreground'
                    )}>
                      {r.cta_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {r.last_scan ? moment(r.last_scan).fromNow() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}