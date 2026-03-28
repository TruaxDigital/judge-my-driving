import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, Shield, Trophy, Award, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function getRatingColor(rating) {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-500';
  return 'text-red-500';
}

function getRatingLabel(rating) {
  if (rating >= 4.8) return { label: 'Elite Driver', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
  if (rating >= 4.5) return { label: 'Excellent', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
  if (rating >= 4.0) return { label: 'Great', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
  if (rating >= 3.5) return { label: 'Good', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
  return { label: 'Average', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
}

export default function DriverProfile() {
  // Get unique_code from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  const { data: sticker, isLoading: stickerLoading, error } = useQuery({
    queryKey: ['public-sticker', code],
    queryFn: async () => {
      if (!code) return null;
      const results = await base44.entities.Sticker.filter({ unique_code: code });
      return results[0] || null;
    },
    enabled: !!code,
  });

  const { data: socialCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['social-cards', sticker?.id],
    queryFn: () => base44.entities.SocialCard.filter({ driver_id: sticker.id }),
    enabled: !!sticker?.id,
  });

  const { data: recentFeedback = [] } = useQuery({
    queryKey: ['public-feedback', sticker?.id],
    queryFn: () => base44.entities.Feedback.filter({ sticker_id: sticker.id }, '-created_date', 5),
    enabled: !!sticker?.id,
  });

  if (!code) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No sticker code provided.</p>
        </div>
      </div>
    );
  }

  if (stickerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sticker || !sticker.public_scorecard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="font-semibold text-foreground">Profile Not Public</p>
          <p className="text-muted-foreground text-sm">This driver hasn't opted in to a public profile.</p>
        </div>
      </div>
    );
  }

  const rating = sticker.average_rating || 0;
  const ratingLabel = getRatingLabel(rating);

  const cardTypeLabels = {
    badge_earned: '🏅 Badge Earned',
    state_top10: '🏆 State Top 10',
    scan_milestone: '📊 Scan Milestone',
    streak_milestone: '🔥 Streak Milestone',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="font-extrabold text-lg tracking-tight">
          <span className="text-primary">JUDGE MY</span>
          <span className="text-foreground"> DRIVING</span>
        </div>
        <a href="https://judgemydriving.com/get-started" target="_blank" rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          Get your sticker <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">🚗</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {sticker.driver_label || sticker.driver_name || 'Anonymous Driver'}
            </h1>
            {sticker.home_state && (
              <p className="text-muted-foreground text-sm mt-1">{sticker.home_state}</p>
            )}
          </div>

          {/* Rating */}
          {rating > 0 ? (
            <div className="space-y-2">
              <p className={cn('text-5xl font-bold', getRatingColor(rating))}>
                {rating.toFixed(1)}
              </p>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn('w-5 h-5', i < Math.round(rating) ? 'text-primary fill-primary' : 'text-muted-foreground/30')}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge variant="outline" className={cn('border', ratingLabel.color)}>{ratingLabel.label}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {sticker.feedback_count || 0} community reviews
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No reviews yet.</p>
          )}
        </div>

        {/* Badges / Social Cards */}
        {socialCards.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialCards.map(card => (
                <div key={card.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  {card.image_url && (
                    <img src={card.image_url} alt={card.card_type} className="w-full aspect-square object-cover" />
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground">
                      {cardTypeLabels[card.card_type] || card.card_type}
                    </p>
                    {card.share_text && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.share_text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {recentFeedback.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Recent Reviews
            </h2>
            <div className="space-y-2">
              {recentFeedback.map(fb => (
                <div key={fb.id} className="bg-card border border-border rounded-xl px-4 py-3 space-y-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('w-3.5 h-3.5', i < fb.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30')} />
                    ))}
                  </div>
                  {fb.comment && <p className="text-sm text-foreground italic">"{fb.comment}"</p>}
                  {fb.location_name && <p className="text-xs text-muted-foreground">{fb.location_name}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">Want community feedback on your driving?</p>
          <a
            href="https://judgemydriving.com/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            Get Your Sticker <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}