import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FeedbackCard from '../components/dashboard/FeedbackCard';

export default function FeedbackFeed() {
  const [stickerFilter, setStickerFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const { data: stickers = [] } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id });
    },
  });

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['all-feedback', stickers],
    queryFn: async () => {
      if (stickers.length === 0) return [];
      const all = [];
      for (const s of stickers) {
        const fb = await base44.entities.Feedback.filter({ sticker_id: s.id }, '-created_date');
        all.push(...fb.map(f => ({ ...f, _stickerLabel: s.driver_label, _stickerCode: s.unique_code })));
      }
      return all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: stickers.length > 0,
  });

  const filtered = feedback.filter(f => {
    if (stickerFilter !== 'all' && f.sticker_id !== stickerFilter) return false;
    if (ratingFilter !== 'all') {
      const r = parseInt(ratingFilter);
      if (r === 5 && f.rating < 4) return false;
      if (r === 3 && f.rating !== 3) return false;
      if (r === 1 && f.rating > 2) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Feedback</h1>
        <p className="text-muted-foreground mt-1">All driving feedback across your stickers.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={stickerFilter} onValueChange={setStickerFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All stickers" />
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

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">Positive (4-5)</SelectItem>
            <SelectItem value="3">Neutral (3)</SelectItem>
            <SelectItem value="1">Negative (1-2)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No feedback matches your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <FeedbackCard key={f.id} feedback={f} stickerLabel={f._stickerLabel} />
          ))}
        </div>
      )}
    </div>
  );
}