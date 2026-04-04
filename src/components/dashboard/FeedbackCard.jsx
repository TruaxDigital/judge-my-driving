import React from 'react';
import { Star, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const ratingColors = {
  good: 'bg-green-500/10 border-green-500/20 text-green-600',
  neutral: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600',
  bad: 'bg-red-500/10 border-red-500/20 text-red-600',
};

export default function FeedbackCard({ feedback, stickerLabel }) {
  const ratingType = feedback.rating >= 4 ? 'good' : feedback.rating === 3 ? 'neutral' : 'bad';
  const colors = ratingColors[ratingType];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow select-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold", colors)}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "w-4 h-4",
                    s <= feedback.rating ? "fill-current" : "fill-none opacity-30"
                  )}
                />
              ))}
            </div>
            {stickerLabel && (
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-medium">
                {stickerLabel}
              </span>
            )}
            {feedback.safety_flag && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> Safety
              </span>
            )}
          </div>
          
          {feedback.comment && (
            <p className="text-foreground text-sm leading-relaxed">{feedback.comment}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {moment(feedback.created_date).fromNow()}
            </span>
            {feedback.location_name && (
              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {feedback.location_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}