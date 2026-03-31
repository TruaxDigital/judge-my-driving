import React from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

const THRESHOLD = 72;

export default function PullToRefreshIndicator({ pullDistance, refreshing }) {
  if (!refreshing && pullDistance === 0) return null;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const ready = progress >= 1;

  return (
    <div
      className="flex items-center justify-center transition-all duration-150 overflow-hidden"
      style={{ height: refreshing ? 44 : pullDistance * 0.5 }}
    >
      <div className={`flex items-center gap-2 text-xs text-muted-foreground transition-all`}>
        {refreshing ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <ArrowDown
            className={`w-4 h-4 transition-transform duration-200 ${ready ? 'text-primary rotate-180' : 'text-muted-foreground'}`}
            style={{ opacity: progress }}
          />
        )}
        <span style={{ opacity: progress }}>
          {refreshing ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  );
}