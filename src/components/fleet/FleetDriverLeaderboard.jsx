import React, { useState } from 'react';
import { Star, ArrowUpDown, ShieldAlert, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function StarBar({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn('w-3.5 h-3.5', i <= Math.round(rating) ? 'text-primary fill-primary' : 'text-muted-foreground/30')}
        />
      ))}
      <span className="text-sm font-semibold ml-1">{rating}</span>
    </div>
  );
}

function PodiumCard({ driver, rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const isTop = rank === 1;
  return (
    <div className={cn(
      'bg-card border rounded-2xl p-4 flex flex-col items-center text-center gap-2',
      isTop ? 'border-primary/40 bg-primary/5' : 'border-border'
    )}>
      <div className="text-2xl">{medals[rank]}</div>
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Trophy className={cn('w-5 h-5', isTop ? 'text-primary' : 'text-muted-foreground')} />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">{driver.name}</p>
        {driver.vehicleId && <p className="text-xs text-muted-foreground font-mono">{driver.vehicleId}</p>}
      </div>
      <StarBar rating={driver.avgRating} />
      <p className="text-xs text-muted-foreground">{driver.totalReviews} reviews</p>
    </div>
  );
}

export default function FleetDriverLeaderboard({ drivers }) {
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'scans'

  const sorted = [...drivers].sort((a, b) =>
    sortBy === 'rating' ? b.avgRating - a.avgRating : b.totalReviews - a.totalReviews
  );

  const top3 = sorted.filter(d => d.totalReviews > 0).slice(0, 3);
  const bottom3 = sorted.filter(d => d.totalReviews > 0).slice(-3).reverse();

  return (
    <div className="space-y-6">
      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Top Performers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3.map((d, i) => <PodiumCard key={d.stickerId} driver={d} rank={i + 1} />)}
          </div>
        </div>
      )}

      {/* Bottom 3 */}
      {bottom3.length > 0 && top3.length > 3 && (
        <div>
          <h3 className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-3">Needs Attention</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bottom3.map(d => (
              <div key={d.stickerId} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <p className="font-semibold text-sm text-foreground">{d.name}</p>
                {d.vehicleId && <p className="text-xs text-muted-foreground font-mono">{d.vehicleId}</p>}
                <StarBar rating={d.avgRating} />
                <p className="text-xs text-muted-foreground">{d.totalReviews} reviews</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">All Drivers</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={sortBy === 'rating' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => setSortBy('rating')}
            >
              <Star className="w-3 h-3 mr-1" /> Rating
            </Button>
            <Button
              variant={sortBy === 'scans' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => setSortBy('scans')}
            >
              <ArrowUpDown className="w-3 h-3 mr-1" /> Scans
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Driver / Vehicle</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Group</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Avg Rating</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Reviews</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((driver, idx) => {
                  const isBottom = bottom3.some(b => b.stickerId === driver.stickerId) && driver.totalReviews > 0 && top3.length > 3;
                  return (
                    <tr key={driver.stickerId} className={cn('hover:bg-muted/30 transition-colors', isBottom && 'bg-red-500/5')}>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{driver.name}</div>
                        {driver.vehicleId && <div className="text-xs text-muted-foreground font-mono">{driver.vehicleId}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {driver.group ? <Badge variant="outline" className="text-xs">{driver.group}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {driver.totalReviews > 0 ? (
                          <div className="flex items-center justify-end gap-1">
                            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                            <span className="font-semibold">{driver.avgRating}</span>
                          </div>
                        ) : <span className="text-muted-foreground text-xs">No data</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{driver.totalReviews}</td>
                      <td className="px-4 py-3 text-right">
                        {driver.safetyCount > 0
                          ? <span className="text-red-500 font-semibold">{driver.safetyCount}</span>
                          : <span className="text-muted-foreground">0</span>}
                      </td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No driver data available for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}