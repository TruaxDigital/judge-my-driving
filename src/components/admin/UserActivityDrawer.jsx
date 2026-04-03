import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Loader2, Tag, Star, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

export default function UserActivityDrawer({ user, open, onClose }) {
  const { data: stickers = [], isLoading: loadingStickers } = useQuery({
    queryKey: ['user-stickers', user?.id],
    queryFn: () => base44.entities.Sticker.filter({ owner_id: user.id }),
    enabled: !!user && open,
  });

  const { data: feedback = [], isLoading: loadingFeedback } = useQuery({
    queryKey: ['user-feedback', user?.id],
    queryFn: async () => {
      if (!stickers.length) return [];
      const all = [];
      for (const s of stickers) {
        const fb = await base44.entities.Feedback.filter({ sticker_id: s.id });
        all.push(...fb);
      }
      return all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user && open && stickers.length > 0,
  });

  const isLoading = loadingStickers || loadingFeedback;
  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : '—';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{user?.full_name || user?.email}</SheetTitle>
          <SheetDescription>{user?.email} · Joined {moment(user?.created_date).format('MMM D, YYYY')}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{stickers.length}</p>
                <p className="text-xs text-muted-foreground">Stickers</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{feedback.length}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{avgRating}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>

            {/* Stickers */}
            {stickers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Stickers</p>
                <div className="space-y-2">
                  {stickers.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-mono text-xs font-semibold">{s.unique_code}</span>
                        {s.driver_label && <span className="text-muted-foreground">· {s.driver_label}</span>}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{s.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent feedback */}
            {feedback.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Recent Feedback</p>
                <div className="space-y-2">
                  {feedback.slice(0, 10).map(f => (
                    <div key={f.id} className="bg-muted/50 rounded-xl px-3 py-2 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{moment(f.created_date).fromNow()}</span>
                      </div>
                      {f.comment && <p className="text-xs text-muted-foreground">{f.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stickers.length === 0 && feedback.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">No activity yet for this user.</p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}