import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, MessageSquare, TrendingUp, Medal, Crown, Shield } from 'lucide-react';
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

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Load all registered active stickers with feedback
  const { data: allStickers = [], isLoading: stickersLoading } = useQuery({
    queryKey: ['leaderboard-stickers'],
    queryFn: () => base44.entities.Sticker.filter({ is_registered: true, status: 'active' }, '-average_rating', 100),
  });

  // Filter for user's own stickers
  const myStickers = allStickers.filter(s => s.owner_id === user?.id);

  const displayStickers = view === 'mine' ? myStickers : allStickers;

  // Sort: by average_rating desc, then feedback_count desc, must have at least 1 feedback
  const ranked = displayStickers
    .filter(s => (s.feedback_count || 0) >= 1)
    .sort((a, b) => {
      const ratingDiff = (b.average_rating || 0) - (a.average_rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.feedback_count || 0) - (a.feedback_count || 0);
    });

  // My best sticker rank
  const myBestRank = user
    ? ranked.findIndex(s => s.owner_id === user.id) + 1
    : null;

  const isLoading = stickersLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
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

      {/* My rank callout */}
      {view === 'public' && myBestRank > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground">
            Your best vehicle ranks <span className="text-primary font-bold">#{myBestRank}</span> out of {ranked.length} drivers.
            {myBestRank === 1 && ' 🏆 You\'re #1!'}
            {myBestRank <= 3 && myBestRank > 1 && ' 🎉 Top 3!'}
          </p>
        </div>
      )}

      {/* Top 3 podium */}
      {ranked.length >= 3 && view === 'public' && (
        <div className="grid grid-cols-3 gap-3">
          {[ranked[1], ranked[0], ranked[2]].map((s, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ['h-24', 'h-32', 'h-20'];
            const badge = getRatingBadge(s.average_rating || 0);
            return (
              <div key={s.id} className={cn(
                'bg-card border rounded-2xl flex flex-col items-center justify-end pb-4 pt-3 px-2 gap-1',
                actualRank === 1 ? 'border-primary/40 shadow-lg' : 'border-border',
                heights[i]
              )}>
                {actualRank === 1 && <Crown className="w-5 h-5 text-yellow-500 mb-1" />}
                {actualRank === 2 && <Medal className="w-4 h-4 text-slate-400 mb-1" />}
                {actualRank === 3 && <Medal className="w-4 h-4 text-amber-600 mb-1" />}
                <p className="text-xs font-semibold text-foreground text-center truncate w-full text-center px-1">
                  {s.driver_label || s.driver_name || `#${s.unique_code}`}
                </p>
                <p className={cn('text-sm font-bold', getRatingColor(s.average_rating || 0))}>
                  ★ {(s.average_rating || 0).toFixed(1)}
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
        ) : ranked.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {view === 'mine'
                ? 'None of your vehicles have received feedback yet.'
                : 'No drivers on the leaderboard yet. Be the first!'}
            </p>
          </div>
        ) : (
          ranked.map((sticker, idx) => {
            const rank = idx + 1;
            const badge = getRatingBadge(sticker.average_rating || 0);
            const isMe = sticker.owner_id === user?.id;
            return (
              <div
                key={sticker.id}
                className={cn(
                  'bg-card border rounded-2xl px-5 py-4 flex items-center gap-4 transition-all',
                  isMe ? 'border-primary/30 bg-primary/5' : 'border-border',
                  rank === 1 && 'shadow-md'
                )}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* Driver info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {sticker.driver_label || sticker.driver_name || `Vehicle ${sticker.unique_code}`}
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
                  {sticker.fleet_group && (
                    <p className="text-xs text-muted-foreground mt-0.5">{sticker.fleet_group}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <MessageSquare className="w-3 h-3" /> {sticker.feedback_count || 0} reviews
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-xl font-bold', getRatingColor(sticker.average_rating || 0))}>
                      {(sticker.average_rating || 0).toFixed(1)}
                    </p>
                    <div className="flex gap-0.5 justify-end">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-3 h-3',
                            i < Math.round(sticker.average_rating || 0)
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

      {ranked.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Rankings based on average star rating. Minimum 1 review required to appear.
        </p>
      )}
    </div>
  );
}