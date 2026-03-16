import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, Tag, TrendingUp, Loader2 } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import FeedbackCard from '../components/dashboard/FeedbackCard';
import { Link } from 'react-router-dom';
import moment from 'moment';

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stickers = [], isLoading: stickersLoading } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id });
    },
  });

  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['my-feedback', stickers],
    queryFn: async () => {
      if (stickers.length === 0) return [];
      const all = [];
      for (const s of stickers) {
        const fb = await base44.entities.Feedback.filter({ sticker_id: s.id }, '-created_date');
        all.push(...fb.map(f => ({ ...f, _stickerLabel: s.driver_label })));
      }
      return all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: stickers.length > 0,
  });

  const isLoading = stickersLoading || feedbackLoading;

  const totalFeedback = feedback.length;
  const avgRating = totalFeedback > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
    : '—';

  const last30 = feedback.filter(f => moment(f.created_date).isAfter(moment().subtract(30, 'days')));
  const prior30 = feedback.filter(f => 
    moment(f.created_date).isAfter(moment().subtract(60, 'days')) &&
    moment(f.created_date).isBefore(moment().subtract(30, 'days'))
  );

  const avg30 = last30.length > 0
    ? (last30.reduce((sum, f) => sum + f.rating, 0) / last30.length).toFixed(1)
    : '—';

  const trendPercent = last30.length > 0 && prior30.length > 0
    ? Math.round(((last30.reduce((s, f) => s + f.rating, 0) / last30.length) - 
        (prior30.reduce((s, f) => s + f.rating, 0) / prior30.length)) / 
        (prior30.reduce((s, f) => s + f.rating, 0) / prior30.length) * 100)
    : undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">Here's how your driving is rated.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Feedback"
          value={totalFeedback}
          icon={MessageSquare}
        />
        <StatCard
          title="Average Rating"
          value={avgRating}
          icon={Star}
        />
        <StatCard
          title="Last 30 Days"
          value={avg30}
          icon={TrendingUp}
          trend={trendPercent}
          trendLabel="vs prior 30d"
        />
        <StatCard
          title="Active Stickers"
          value={stickers.filter(s => s.status === 'active').length}
          icon={Tag}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Feedback</h2>
          <Link to="/FeedbackFeed" className="text-sm text-primary font-medium hover:underline">
            View all
          </Link>
        </div>
        {feedback.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No feedback yet. Share your sticker QR code to start receiving ratings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.slice(0, 5).map((f) => (
              <FeedbackCard key={f.id} feedback={f} stickerLabel={f._stickerLabel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}