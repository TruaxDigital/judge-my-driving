import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Star, MessageSquare, Tag, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatCard from '../components/dashboard/StatCard';
import FeedbackCard from '../components/dashboard/FeedbackCard';
import SubscriptionBanner from '../components/dashboard/SubscriptionBanner';

export default function Dashboard() {
  const [stickerFilter, setStickerFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stickers = [], isLoading: stickersLoading } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id }, '-created_date');
    },
  });

  const { data: allFeedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['all-feedback', stickers.map(s => s.id)],
    queryFn: async () => {
      if (stickers.length === 0) return [];
      const results = await Promise.all(
        stickers.map(s => base44.entities.Feedback.filter({ sticker_id: s.id }, '-created_date', 50))
      );
      return results.flat().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: stickers.length > 0,
  });

  const filteredFeedback = allFeedback.filter(f => {
    if (stickerFilter !== 'all' && f.sticker_id !== stickerFilter) return false;
    if (ratingFilter === 'positive' && f.rating < 4) return false;
    if (ratingFilter === 'neutral' && f.rating !== 3) return false;
    if (ratingFilter === 'negative' && f.rating > 2) return false;
    return true;
  });

  const totalFeedback = allFeedback.length;
  const avgRating = totalFeedback > 0
    ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
    : '—';
  const safetyFlags = allFeedback.filter(f => f.safety_flag).length;
  const activeStickers = stickers.filter(s => s.status === 'active').length;

  const getStickerLabel = (stickerId) => {
    const s = stickers.find(s => s.id === stickerId);
    return s?.driver_label || s?.unique_code || 'Unknown';
  };

  const isLoading = stickersLoading || (stickers.length > 0 && feedbackLoading);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your driving feedback at a glance.</p>
      </div>

      <SubscriptionBanner status={user?.subscription_status} />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Feedback" value={totalFeedback} icon={MessageSquare} />
            <StatCard title="Avg Rating" value={avgRating} icon={Star} />
            <StatCard title="Active Stickers" value={activeStickers} icon={Tag} />
            <StatCard title="Safety Flags" value={safetyFlags} icon={ShieldAlert} />
          </div>

          {/* Feedback Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">Feedback Feed</h2>
              <div className="flex gap-2 flex-wrap">
                {stickers.length > 1 && (
                  <Select value={stickerFilter} onValueChange={setStickerFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Stickers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stickers</SelectItem>
                      {stickers.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.driver_label || s.unique_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="positive">Positive (4–5★)</SelectItem>
                    <SelectItem value="neutral">Neutral (3★)</SelectItem>
                    <SelectItem value="negative">Negative (1–2★)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-2">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="font-semibold text-foreground">No feedback yet</p>
                <p className="text-muted-foreground text-sm">
                  Once someone scans your sticker and submits feedback, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFeedback.map(feedback => (
                  <FeedbackCard
                    key={feedback.id}
                    feedback={feedback}
                    stickerLabel={stickers.length > 1 ? getStickerLabel(feedback.sticker_id) : null}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}