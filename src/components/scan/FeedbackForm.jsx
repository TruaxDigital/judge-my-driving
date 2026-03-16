import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function FeedbackForm({ sticker, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [safetyFlag, setSafetyFlag] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            setLocationName(data.display_name?.split(',').slice(0, 3).join(',') || 'Location found');
          } catch {
            setLocationName('Location found');
          }
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
        { timeout: 10000 }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    
    const feedbackData = {
      sticker_id: sticker.id,
      sticker_code: sticker.unique_code,
      rating,
      comment: comment || undefined,
      safety_flag: safetyFlag,
      latitude: location?.latitude,
      longitude: location?.longitude,
      location_name: locationName || undefined,
    };

    const feedback = await base44.entities.Feedback.create(feedbackData);

    // Update sticker feedback count and average
    const allFeedback = await base44.entities.Feedback.filter({ sticker_id: sticker.id });
    const totalCount = allFeedback.length;
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalCount;
    await base44.entities.Sticker.update(sticker.id, {
      feedback_count: totalCount,
      average_rating: Math.round(avgRating * 10) / 10,
    });

    // Send email notification to sticker owner
    if (sticker.owner_email) {
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      await base44.integrations.Core.SendEmail({
        to: sticker.owner_email,
        subject: `New driving feedback for ${sticker.driver_label || 'your vehicle'}`,
        body: `
          <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #FACC15;">New Feedback Received</h2>
            <p style="font-size: 24px;">${stars}</p>
            <p><strong>Rating:</strong> ${rating}/5</p>
            ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
            ${locationName ? `<p><strong>Location:</strong> ${locationName}</p>` : ''}
            <p><strong>Time:</strong> ${moment().format('MMM D, YYYY h:mm A')}</p>
            ${safetyFlag ? '<p style="color: red;"><strong>⚠️ Safety concern reported</strong></p>' : ''}
          </div>
        `,
      });
    }

    onSubmitted(rating, safetyFlag);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-white">Rate This Driver</h1>
        <p className="text-zinc-400 text-sm">
          {sticker.driver_label || 'How was their driving?'}
        </p>
      </div>

      <div className="flex justify-center">
        <StarRating rating={rating} onRate={setRating} size="xl" />
      </div>

      {rating > 0 && rating <= 3 && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <Checkbox
            id="safety"
            checked={safetyFlag}
            onCheckedChange={setSafetyFlag}
            className="mt-0.5 border-red-400 data-[state=checked]:bg-red-500"
          />
          <label htmlFor="safety" className="text-sm text-red-300 cursor-pointer">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4" /> Report a safety concern
            </span>
            <span className="text-red-400/70 text-xs mt-1 block">
              Check this if the driving posed a danger to others
            </span>
          </label>
        </div>
      )}

      <Textarea
        placeholder="Add a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px] rounded-xl resize-none"
      />

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-xs text-zinc-400">{moment().format('h:mm A')}</span>
        </div>
        {locationLoading ? (
          <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg">
            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
            <span className="text-xs text-zinc-400">Getting location...</span>
          </div>
        ) : location ? (
          <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg max-w-[250px]">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-zinc-400 truncate">{locationName}</span>
          </div>
        ) : null}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Submit Feedback'
        )}
      </Button>
    </div>
  );
}