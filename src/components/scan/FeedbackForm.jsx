import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import { base44 } from '@/api/base44Client';

export default function FeedbackForm({ sticker, onSubmitted }) {
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [safetyFlag, setSafetyFlag] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [cooldownMessage, setCooldownMessage] = useState('');

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
    setBlockedMessage('');
    setCooldownMessage('');

    const res = await base44.functions.invoke('submitFeedback', {
      sticker_id: sticker.id,
      sticker_code: sticker.unique_code,
      rating,
      comment: comment || undefined,
      safety_flag: safetyFlag,
      latitude: location?.latitude,
      longitude: location?.longitude,
      location_name: locationName || undefined,
      is_preview: isPreview || undefined,
    });

    setSubmitting(false);

    if (res.data?.blocked) {
      setBlockedMessage(res.data.error || 'Your comment was not submitted because it appears to contain harmful or bullying language. Please keep feedback focused on driving behavior.');
      return;
    }

    if (res.data?.error) {
      // Cooldown or other server error
      setCooldownMessage(res.data.error);
      return;
    }

    if (!isPreview) {
      base44.analytics.track({
        eventName: 'feedback_submitted',
        properties: {
          sticker_code: sticker.unique_code,
          rating,
          has_comment: !!comment,
          safety_flag: safetyFlag,
          has_location: !!location,
        },
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
          <span className="text-xs text-zinc-400">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
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

      {blockedMessage && (
        <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{blockedMessage}</p>
        </div>
      )}

      {cooldownMessage && (
        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <Clock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-300">{cooldownMessage}</p>
        </div>
      )}

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

      <p className="text-center text-xs pt-1" style={{ color: '#999999' }}>
        By submitting feedback, you agree to our{' '}
        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: '#999999', textDecoration: 'underline' }}>Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#999999', textDecoration: 'underline' }}>Privacy Policy</a>.
      </p>

      <p className="text-center text-zinc-500 text-xs leading-relaxed">
        🚗 <strong className="text-zinc-400">Pull over before you post.</strong> Using a mobile device while driving is illegal. Stop in a safe location or ask a passenger to submit this review. By tapping Submit, you confirm you are not operating a vehicle.{' '}
        <a href="/liability" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2">
          Driver safety is our number one priority.
        </a>
      </p>
    </div>
  );
}