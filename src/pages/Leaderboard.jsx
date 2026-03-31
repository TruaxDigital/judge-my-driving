import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, MessageSquare, TrendingUp, Medal, Crown, Shield } from 'lucide-react';
import ThemeAwareLogo from '@/components/ThemeAwareLogo';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function getRankIcon(rank) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-muted-foreground font-bold text-sm w-5 text-center">#{rank}</span>;
}

function getRatingColor(rating) {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-500';
  return 'text-red-500';
}

function getRatingBadge(rating) {
  if (rating >= 4.8) return { label: 'Elite Driver', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
  if (rating >= 4.5) return { label: 'Excellent', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
  if (rating >= 4.0) return { label: 'Great', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
  if (rating >= 3.5) return { label: 'Good', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
  if (rating >= 3.0) return { label: 'Average', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
  return { label: 'Needs Work', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
}

export default function Leaderboard() {
  const [view, setView] = useState('public'); // 'public' | 'mine'
  const [selectedScope, setSelectedScope] = useState('national');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('monthly');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch pre-calculated leaderboard from cache (for public view)
  const { data: leaderboardCache = null, isLoading: cacheLoading } = useQuery({
    queryKey: ['leaderboard-cache', selectedScope, selectedTimePeriod],
    queryFn: async () => {
      const results = await base44.entities.LeaderboardCache.filter({
        scope: selectedScope,
        time_period: selectedTimePeriod,
      });
      return results.length > 0 ? results[0] : null;
    },
    enabled: view === 'public',
  });

  // Fetch user's own stickers (for my vehicles view)
  const { data: myStickers = [], isLoading: myStickersLoading } = useQuery({
    queryKey: ['my-leaderboard-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id }, '-average_rating');
    },
    enabled: view === 'mine',
  });

  // Fetch all stickers to get unique states and metros
  const { data: allStickers = [] } = useQuery({
    queryKey: ['all-stickers-for-scopes'],
    queryFn: async () => {
      return base44.entities.Sticker.list('-created_date');
    },
  });

  // Fetch metro mappings
  const { data: metroMappings = [] } = useQuery({
    queryKey: ['metro-mappings'],
    queryFn: () => base44.entities.MetroAreaMapping.list(),
  });

  // Build dynamic scope options
  const scopeOptions = (() => {
    const options = [{ value: 'national', label: 'National' }];
    const stateMap = new Map();
    const metroMap = new Map();

    for (const sticker of allStickers) {
      if (sticker.home_state_slug) {
        stateMap.set(sticker.home_state_slug, sticker.home_state);
      }
      if (sticker.home_metro_slug) {
        const metro = metroMappings.find(m => m.metro_slug === sticker.home_metro_slug);
        if (metro) {
          metroMap.set(sticker.home_metro_slug, metro.metro_name);
        }
      }
    }

    stateMap.forEach((stateName, stateSlug) => {
      options.push({ value: `state:${stateSlug}`, label: stateName });
    });

    metroMap.forEach((metroName, metroSlug) => {
      options.push({ value: `metro:${metroSlug}`, label: `${metroName} (Metro)` });
    });

    return options;
  })();

  // Get rankings from cache
  const rankings = leaderboardCache?.rankings || [];

  // Format my stickers as ranking entries
  const myRankings = myStickers.map(s => ({
    rank: null,
    driver_id: s.id,
    display_name: s.driver_label || s.unique_code,
    location: s.home_state || 'Unknown',
    avg_rating: s.average_rating || 0,
    scan_count: s.feedback_count || 0,
  }));

  // Find user's best rank in public leaderboard
  const myRank = view === 'public' ? rankings.findIndex(r => r.driver_id === user?.id) + 1 : null;

  const displayRankings = view === 'mine' ? myRankings : rankings;

  const isLoading = view === 'public' ? cacheLoading : myStickersLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <ThemeAwareLogo className="h-20 w-auto mb-2" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-primary" /> Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">See how drivers rank based on community feedback.</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-muted rounded-xl p-1 gap-1 self-start sm:self-auto">
          {['public', 'mine'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                view === v
                  ? 'bg-card shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v === 'public' ? 'All Drivers' : 'My Vehicles'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {view === 'public' && (
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Scope</label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              {scopeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Time Period</label>
            <select
              value={selectedTimePeriod}
              onChange={(e) => setSelectedTimePeriod(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="alltime">All Time</option>
            </select>
          </div>
        </div>
      )}

      {/* My rank callout */}
      {view === 'public' && myRank > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground">
            Your best vehicle ranks <span className="text-primary font-bold">#{myRank}</span> out of {rankings.length} drivers.
            {myRank === 1 && ' 🏆 You\'re #1!'}
            {myRank <= 3 && myRank > 1 && ' 🎉 Top 3!'}
          </p>
        </div>
      )}

      {/* Top 3 podium */}
      {rankings.length >= 3 && view === 'public' && (
        <div className="grid grid-cols-3 gap-3">
          {[rankings[1], rankings[0], rankings[2]].map((r, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ['h-24', 'h-32', 'h-20'];
            const badge = getRatingBadge(r.avg_rating || 0);
            return (
              <div key={r.driver_id} className={cn(
                'bg-card border rounded-2xl flex flex-col items-center justify-end pb-4 pt-3 px-2 gap-1',
                actualRank === 1 ? 'border-primary/40 shadow-lg' : 'border-border',
                heights[i]
              )}>
                {actualRank === 1 && <Crown className="w-5 h-5 text-yellow-500 mb-1" />}
                {actualRank === 2 && <Medal className="w-4 h-4 text-slate-400 mb-1" />}
                {actualRank === 3 && <Medal className="w-4 h-4 text-amber-600 mb-1" />}
                <p className="text-xs font-semibold text-foreground text-center truncate w-full text-center px-1">
                  {r.display_name}
                </p>
                <p className={cn('text-sm font-bold', getRatingColor(r.avg_rating || 0))}>
                  ★ {(r.avg_rating || 0).toFixed(1)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl h-16 animate-pulse" />
          ))
        ) : displayRankings.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {view === 'mine'
                ? 'None of your vehicles have received feedback yet.'
                : 'No drivers on the leaderboard yet. Be the first!'}
            </p>
          </div>
        ) : (
          displayRankings.map((ranking) => {
            const badge = getRatingBadge(ranking.avg_rating || 0);
            const isMe = ranking.driver_id === user?.id;
            return (
              <div
                key={ranking.driver_id}
                className={cn(
                  'bg-card border rounded-2xl px-5 py-4 flex items-center gap-4 transition-all',
                  isMe ? 'border-primary/30 bg-primary/5' : 'border-border',
                  ranking.rank === 1 && 'shadow-md'
                )}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center shrink-0">
                  {getRankIcon(ranking.rank)}
                </div>

                {/* Driver info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {ranking.display_name}
                    </p>
                    {isMe && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        You
                      </Badge>
                    )}
                    <Badge variant="outline" className={cn('text-xs border', badge.color)}>
                      {badge.label}
                    </Badge>
                  </div>
                  {ranking.location && (
                    <p className="text-xs text-muted-foreground mt-0.5">{ranking.location}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <MessageSquare className="w-3 h-3" /> {ranking.scan_count || 0} reviews
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-xl font-bold', getRatingColor(ranking.avg_rating || 0))}>
                      {(ranking.avg_rating || 0).toFixed(1)}
                    </p>
                    <div className="flex gap-0.5 justify-end">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-3 h-3',
                            i < Math.round(ranking.avg_rating || 0)
                              ? 'text-primary fill-primary'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {displayRankings.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Rankings based on average star rating. Minimum 1 review required to appear.
        </p>
      )}
    </div>
  );
}