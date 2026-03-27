import React, { useState, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Mail, TrendingUp, TrendingDown, Minus, FileText, UserPlus,
  Trophy, Flame, Globe, Loader2, CheckCircle, Star, ShieldAlert, AlertTriangle, Code, Copy, Check
} from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTrend(sticker, allFeedback) {
  const fb = allFeedback.filter(f => f._stickerId === sticker.id);
  if (fb.length < 4) return null;
  const sorted = [...fb].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);
  const avg = (arr) => arr.reduce((s, f) => s + f.rating, 0) / arr.length;
  const diff = avg(secondHalf) - avg(firstHalf);
  if (diff > 0.2) return 'up';
  if (diff < -0.2) return 'down';
  return 'flat';
}

function getStreak(sticker, allFeedback) {
  const fb = allFeedback.filter(f => f._stickerId === sticker.id && f.safety_flag);
  if (fb.length === 0) return 30; // no incidents ever = full streak
  const sorted = [...fb].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const lastIncident = new Date(sorted[0].created_date);
  return Math.floor((new Date() - lastIncident) / (1000 * 60 * 60 * 24));
}

function is90Days(sticker) {
  if (!sticker.start_date) return false;
  const days = moment().diff(moment(sticker.start_date), 'days');
  return days >= 0 && days <= 90;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function buildEmbedCode({ label, avg, reviewCount, comments = [] }) {
  const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
  const commentsHtml = comments.length > 0
    ? comments.map(c => `<div style="font-style:italic;color:#555;font-size:13px;border-left:3px solid #f5c000;padding-left:10px;margin-top:8px">"${c}"</div>`).join('')
    : '';
  return `<!-- Judge My Driving Scorecard Widget -->
<div style="font-family:sans-serif;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;max-width:320px;box-shadow:0 2px 8px rgba(0,0,0,0.07)">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
    <img src="https://app.judgemydriving.com/jmd-logo.png" alt="Judge My Driving" style="height:28px" onerror="this.style.display='none'" />
    <span style="font-weight:700;font-size:15px;color:#111">${label}</span>
  </div>
  <div style="font-size:28px;font-weight:800;color:#111">${avg} <span style="font-size:18px;color:#f5c000">${stars}</span></div>
  <div style="font-size:13px;color:#666;margin-top:2px">Based on ${reviewCount} verified review${reviewCount !== 1 ? 's' : ''}</div>
  ${commentsHtml}
  <div style="margin-top:14px;padding-top:12px;border-top:1px solid #f0f0f0;font-size:11px;color:#999">
    Powered by <a href="https://judgemydriving.com" target="_blank" style="color:#f5c000;font-weight:600;text-decoration:none">Judge My Driving</a> — Real feedback from real drivers on the road.
  </div>
</div>`;
}

export default function FleetReports({ stickers, allFeedback, user }) {
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportEmails, setReportEmails] = useState('');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [embedDialog, setEmbedDialog] = useState(null); // { code, title }
  const [copied, setCopied] = useState(false);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Driver improvement tracking
  const driverTrends = useMemo(() => {
    return stickers.map(s => {
      const fb = allFeedback.filter(f => f._stickerId === s.id);
      const avg = fb.length > 0
        ? parseFloat((fb.reduce((acc, f) => acc + f.rating, 0) / fb.length).toFixed(1))
        : null;
      const trend = getTrend(s, allFeedback);
      const streak = getStreak(s, allFeedback);
      const safety = fb.filter(f => f.safety_flag).length;
      return {
        sticker: s,
        name: s.driver_label || s.driver_name || 'Unnamed Vehicle',
        avg,
        trend,
        streak,
        safety,
        totalReviews: fb.length,
        isOnboarding: is90Days(s),
      };
    });
  }, [stickers, allFeedback]);

  // Safest driver (highest avg, no safety flags last 30 days)
  const safestDriver = useMemo(() => {
    const cutoff = moment().subtract(30, 'days').toISOString();
    return driverTrends
      .filter(d => d.totalReviews >= 3)
      .filter(d => {
        const recentSafety = allFeedback.filter(f =>
          f._stickerId === d.sticker.id && f.safety_flag && f.created_date >= cutoff
        ).length;
        return recentSafety === 0;
      })
      .sort((a, b) => b.avg - a.avg)[0] || null;
  }, [driverTrends, allFeedback]);

  // Onboarding drivers (within 90 days of start_date)
  const onboardingDrivers = driverTrends.filter(d => d.isOnboarding);

  // Streak champions (30+ days no safety incidents)
  const streakChampions = driverTrends.filter(d => d.streak >= 30 && d.totalReviews > 0);

  // Public scorecard drivers (opted in)
  const publicDrivers = stickers.filter(s => s.public_scorecard);
  const publicAvg = publicDrivers.length > 0
    ? (allFeedback
        .filter(f => publicDrivers.some(s => s.id === f._stickerId))
        .reduce((s, f, _, arr) => s + f.rating / arr.length, 0)
      ).toFixed(1)
    : null;

  const handleSendReport = async () => {
    setSendingReport(true);
    const emails = reportEmails.split(',').map(e => e.trim()).filter(Boolean);
    const cutoff = reportPeriod === 'weekly'
      ? moment().subtract(7, 'days').toISOString()
      : moment().subtract(30, 'days').toISOString();

    const periodFb = allFeedback.filter(f => f.created_date >= cutoff);
    const safetyCount = periodFb.filter(f => f.safety_flag).length;
    const avgRating = periodFb.length > 0
      ? (periodFb.reduce((s, f) => s + f.rating, 0) / periodFb.length).toFixed(1)
      : 'N/A';

    const driverSummaries = stickers.map(s => {
      const fb = periodFb.filter(f => f._stickerId === s.id);
      const avg = fb.length > 0
        ? (fb.reduce((a, f) => a + f.rating, 0) / fb.length).toFixed(1)
        : 'N/A';
      return `• ${s.driver_label || s.driver_name || s.unique_code}: ${avg} avg (${fb.length} reviews, ${fb.filter(f => f.safety_flag).length} safety flags)`;
    }).join('\n');

    const subject = `${reportPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Fleet Safety Summary — ${moment().format('MMM D, YYYY')}`;
    const body = `
      <h2>${reportPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Fleet Safety Report</h2>
      <p><strong>Period:</strong> ${moment(cutoff).format('MMM D')} – ${moment().format('MMM D, YYYY')}</p>
      <p><strong>Fleet Average Rating:</strong> ${avgRating} ⭐</p>
      <p><strong>Total Feedback:</strong> ${periodFb.length}</p>
      <p><strong>Safety Incidents:</strong> ${safetyCount}</p>
      <h3>Driver Breakdown</h3>
      <pre style="font-family:monospace;background:#f4f4f4;padding:12px;border-radius:8px">${driverSummaries}</pre>
      ${safestDriver ? `<p>🏆 <strong>Safest Driver This Period:</strong> ${safestDriver.name} (${safestDriver.avg}⭐)</p>` : ''}
      <p style="color:#888;font-size:12px">Sent from Judge My Driving Fleet Dashboard</p>
    `;

    for (const email of emails) {
      await base44.integrations.Core.SendEmail({ to: email, subject, body });
    }
    setSendingReport(false);
    setReportSent(true);
    setReportDialog(false);
    setTimeout(() => setReportSent(false), 4000);
  };

  return (
    <div className="space-y-6">

      {/* 1. Safety Summary Report */}
      <SectionCard title="Safety Summary Report" icon={Mail}>
        <p className="text-sm text-muted-foreground">
          Email a weekly or monthly safety summary to stakeholders. Includes fleet avg rating, total feedback, safety incidents, and per-driver breakdown.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {reportSent && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Report sent!
            </div>
          )}
          <Button onClick={() => setReportDialog(true)} className="rounded-xl">
            <Mail className="w-4 h-4 mr-2" /> Send Safety Report
          </Button>
        </div>
      </SectionCard>

      {/* 2. Driver Improvement Tracking */}
      <SectionCard title="Driver Improvement Tracking" icon={TrendingUp}>
        <p className="text-sm text-muted-foreground mb-2">Trend is based on comparing first half vs second half of all-time feedback per driver.</p>
        <div className="space-y-2">
          {driverTrends.filter(d => d.totalReviews >= 4).map(d => (
            <div key={d.sticker.id} className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-3">
                <TrendIcon trend={d.trend} />
                <div>
                  <p className="text-sm font-medium text-foreground">{d.name}</p>
                  {d.sticker.driver_name && <p className="text-xs text-muted-foreground">{d.sticker.driver_name}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-primary fill-primary" />{d.avg}</span>
                <span>{d.totalReviews} reviews</span>
                <Badge variant="outline" className={cn('text-xs border', d.trend === 'up' ? 'text-green-600 border-green-500/30' : d.trend === 'down' ? 'text-red-500 border-red-500/30' : 'text-muted-foreground')}>
                  {d.trend === 'up' ? 'Improving' : d.trend === 'down' ? 'Declining' : 'Stable'}
                </Badge>
              </div>
            </div>
          ))}
          {driverTrends.filter(d => d.totalReviews >= 4).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">At least 4 reviews per driver needed to track trends.</p>
          )}
        </div>
      </SectionCard>

      {/* 3. Driver Scorecards */}
      <SectionCard title="Driver Scorecards" icon={FileText}>
        <p className="text-sm text-muted-foreground mb-2">Performance summary for each driver. Print or share as a review.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {driverTrends.map(d => (
            <div key={d.sticker.id} className="border border-border rounded-xl p-4 space-y-2 bg-background">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-foreground">{d.name}</p>
                {d.avg !== null ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="font-bold text-sm">{d.avg}</span>
                  </div>
                ) : <span className="text-xs text-muted-foreground">No data</span>}
              </div>
              {d.sticker.driver_name && <p className="text-xs text-muted-foreground">{d.sticker.driver_name}</p>}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{d.totalReviews} reviews</span>
                {d.safety > 0 && <span className="text-red-500 flex items-center gap-0.5"><ShieldAlert className="w-3 h-3" />{d.safety} safety flags</span>}
                {d.trend && <Badge variant="outline" className="text-xs">{d.trend === 'up' ? '📈 Improving' : d.trend === 'down' ? '📉 Declining' : '➡️ Stable'}</Badge>}
                {d.isOnboarding && <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600">🆕 Onboarding</Badge>}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="w-3 h-3 text-orange-400" />
                {d.streak} days without safety incident
              </div>
            </div>
          ))}
          {driverTrends.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-4">No driver data available.</p>}
        </div>
      </SectionCard>

      {/* 4. New Driver Onboarding (90 days) */}
      <SectionCard title="New Driver Onboarding (First 90 Days)" icon={UserPlus}>
        <p className="text-sm text-muted-foreground">
          Drivers with a start date within the last 90 days. Set a start date on a sticker via the Vehicles tab to track onboarding.
        </p>
        {onboardingDrivers.length > 0 ? (
          <div className="space-y-2">
            {onboardingDrivers.map(d => {
              const daysIn = moment().diff(moment(d.sticker.start_date), 'days');
              return (
                <div key={d.sticker.id} className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    {d.sticker.driver_name && <p className="text-xs text-muted-foreground">{d.sticker.driver_name}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-500/30 text-xs">Day {daysIn} of 90</Badge>
                    {d.avg !== null && <span className="flex items-center gap-1 text-muted-foreground"><Star className="w-3.5 h-3.5 text-primary fill-primary" />{d.avg}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No drivers currently in onboarding. Set a start date on vehicle stickers to enable this tracking.</p>
        )}
      </SectionCard>

      {/* 5. Safest Driver Award */}
      <SectionCard title="Monthly Safest Driver Award" icon={Trophy}>
        {safestDriver ? (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
            <div className="text-4xl">🏆</div>
            <div>
              <p className="text-xl font-bold text-foreground">{safestDriver.name}</p>
              {safestDriver.sticker.driver_name && <p className="text-sm text-muted-foreground">{safestDriver.sticker.driver_name}</p>}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="text-2xl font-bold">{safestDriver.avg}</span>
              <span className="text-muted-foreground">avg rating</span>
            </div>
            <p className="text-sm text-muted-foreground">No safety incidents in the last 30 days · {safestDriver.totalReviews} total reviews</p>
            <div className="bg-white border border-border rounded-xl p-4 text-sm text-left space-y-1 max-w-sm mx-auto print:block">
              <p className="font-bold text-center text-base">🏅 Certificate of Safe Driving</p>
              <p className="text-center text-muted-foreground text-xs">Awarded to</p>
              <p className="text-center font-semibold">{safestDriver.sticker.driver_name || safestDriver.name}</p>
              <p className="text-center text-xs text-muted-foreground">For outstanding safe driving performance</p>
              <p className="text-center text-xs text-muted-foreground">{moment().format('MMMM YYYY')}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-2" /> Print Certificate
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No driver qualifies yet. A driver needs at least 3 reviews and no safety incidents in the last 30 days.</p>
        )}
      </SectionCard>

      {/* 6. Driver Streaks */}
      <SectionCard title="Driver Streaks (Days Without Safety Incident)" icon={Flame}>
        <div className="space-y-2">
          {driverTrends
            .filter(d => d.totalReviews > 0)
            .sort((a, b) => b.streak - a.streak)
            .map(d => (
              <div key={d.sticker.id} className={cn(
                'flex items-center justify-between rounded-xl px-4 py-2.5 border',
                d.streak >= 30
                  ? 'bg-orange-500/5 border-orange-500/20'
                  : 'bg-muted/30 border-border'
              )}>
                <div className="flex items-center gap-3">
                  <Flame className={cn('w-4 h-4', d.streak >= 30 ? 'text-orange-400' : 'text-muted-foreground/40')} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    {d.sticker.driver_name && <p className="text-xs text-muted-foreground">{d.sticker.driver_name}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('font-bold text-sm', d.streak >= 30 ? 'text-orange-500' : 'text-foreground')}>
                    {d.streak} days
                  </span>
                  {d.streak >= 30 && <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30">🔥 30+ Day Streak</Badge>}
                </div>
              </div>
            ))}
          {driverTrends.filter(d => d.totalReviews > 0).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No feedback data yet.</p>
          )}
        </div>
      </SectionCard>

      {/* 7. Public Scorecard Opt-in */}
      <SectionCard title="Public Driver Scorecard" icon={Globe}>
        <p className="text-sm text-muted-foreground">
          Opted-in drivers appear on your public scorecard widget. Embed this on your website to show visitors your fleet's rating.
        </p>

        {/* Fleet-wide metric — all stickers */}
        {(() => {
          const totalFb = allFeedback;
          const fleetWideAvg = totalFb.length > 0
            ? (totalFb.reduce((s, f) => s + f.rating, 0) / totalFb.length).toFixed(1)
            : null;
          const recentComments = [...totalFb]
            .filter(f => f.comment && f.comment.trim().length > 0)
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .slice(0, 3);
          return fleetWideAvg ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">⭐ {fleetWideAvg} / 5</p>
                  <p className="text-sm text-muted-foreground">Fleet-wide average across all {stickers.length} vehicle{stickers.length !== 1 ? 's' : ''} · {totalFb.length} total reviews</p>
                  <p className="text-xs text-muted-foreground font-mono bg-white/60 rounded px-2 py-1 inline-block">
                    "Our drivers are rated {fleetWideAvg}/5 — Judge My Driving"
                  </p>
                </div>
                <button
                  onClick={() => setEmbedDialog({
                    title: 'Fleet-Wide Scorecard Widget',
                    code: buildEmbedCode({
                      label: 'Our Fleet',
                      avg: fleetWideAvg,
                      reviewCount: totalFb.length,
                      comments: recentComments.slice(0, 2).map(f => f.comment),
                    })
                  })}
                  className="shrink-0 p-2 rounded-lg border border-primary/30 bg-white/60 text-primary hover:bg-white transition-all"
                  title="Get embed code"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>
              {recentComments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-primary/10">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Reviews</p>
                  {recentComments.map((f, i) => (
                    <div key={i} className="bg-white/70 rounded-xl px-3 py-2 text-sm text-foreground italic">
                      "{f.comment}"
                      <span className="ml-2 not-italic text-xs text-muted-foreground">{'⭐'.repeat(Math.round(f.rating))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null;
        })()}

        {/* Per-driver opt-in rows */}
        <div className="space-y-3">
          {stickers.map(s => {
            const fb = allFeedback.filter(f => f._stickerId === s.id);
            const avg = fb.length > 0
              ? (fb.reduce((a, f) => a + f.rating, 0) / fb.length).toFixed(1)
              : null;
            const recentComment = [...fb]
              .filter(f => f.comment && f.comment.trim().length > 0)
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
            return (
              <div key={s.id} className="bg-muted/30 rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.driver_label || s.driver_name || 'Unnamed Vehicle'}</p>
                    {avg && <p className="text-xs text-muted-foreground">{avg} avg · {fb.length} reviews</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {avg && (
                      <button
                        onClick={() => setEmbedDialog({
                          title: `${s.driver_label || s.driver_name || 'Driver'} Scorecard Widget`,
                          code: buildEmbedCode({
                            label: s.driver_label || s.driver_name || 'Our Driver',
                            avg,
                            reviewCount: fb.length,
                            comments: recentComment ? [recentComment.comment] : [],
                          })
                        })}
                        className="p-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                        title="Get embed code"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => base44.entities.Sticker.update(s.id, { public_scorecard: !s.public_scorecard })}
                      className={cn(
                        'text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                        s.public_scorecard
                          ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                      )}
                    >
                      {s.public_scorecard ? '✓ Public' : 'Make Public'}
                    </button>
                  </div>
                </div>
                {recentComment && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-2">
                    "{recentComment.comment}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Embed Code Dialog */}
      <Dialog open={!!embedDialog} onOpenChange={() => setEmbedDialog(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> {embedDialog?.title}</DialogTitle>
            <DialogDescription>Paste this snippet anywhere on your website. It includes your rating, recent reviews, and a Judge My Driving badge.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <pre className="bg-muted rounded-xl p-4 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
              {embedDialog?.code}
            </pre>
            <Button className="w-full rounded-xl" onClick={() => handleCopy(embedDialog?.code)}>
              {copied ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Embed Code</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Report Dialog */}
      <Dialog open={reportDialog} onOpenChange={setReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Safety Summary Report</DialogTitle>
            <DialogDescription>Email a fleet safety summary to your stakeholders.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Period</Label>
              <div className="flex gap-2">
                {['weekly', 'monthly'].map(p => (
                  <button
                    key={p}
                    onClick={() => setReportPeriod(p)}
                    className={cn(
                      'flex-1 py-2 rounded-xl border text-sm font-medium transition-all capitalize',
                      reportPeriod === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recipient Emails</Label>
              <Input
                placeholder="manager@company.com, safety@company.com"
                value={reportEmails}
                onChange={e => setReportEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate multiple emails with commas.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialog(false)}>Cancel</Button>
            <Button onClick={handleSendReport} disabled={sendingReport || !reportEmails.trim()}>
              {sendingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}