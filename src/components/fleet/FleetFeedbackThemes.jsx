import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

// Simple keyword bucketing for themes
const POSITIVE_KEYWORDS = [
  { label: 'Courteous', words: ['courteous', 'polite', 'respectful', 'kind', 'friendly'] },
  { label: 'Safe Driver', words: ['safe', 'careful', 'cautious', 'attentive'] },
  { label: 'Good Speed', words: ['speed', 'pace', 'appropriate speed', 'not speeding'] },
  { label: 'Signal Use', words: ['signal', 'blinker', 'indicator', 'turn signal'] },
  { label: 'Smooth', words: ['smooth', 'comfortable', 'gentle', 'no sudden'] },
];

const NEGATIVE_KEYWORDS = [
  { label: 'Tailgating', words: ['tailgat', 'too close', 'following too'] },
  { label: 'Speeding', words: ['speeding', 'too fast', 'reckless', 'speed'] },
  { label: 'Phone Use', words: ['phone', 'texting', 'distracted'] },
  { label: 'Cutting Off', words: ['cut off', 'cut me off', 'lane change', 'merged'] },
  { label: 'Aggressive', words: ['aggressive', 'road rage', 'honking', 'angry'] },
  { label: 'Running Lights', words: ['red light', 'stop sign', 'ran', 'ignored'] },
];

function countThemes(comments, keywords) {
  return keywords.map(theme => ({
    label: theme.label,
    count: comments.filter(c =>
      theme.words.some(w => c.toLowerCase().includes(w))
    ).length,
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count);
}

function ThemeTag({ label, count, color }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${color}`}>
      <span className="font-medium">{label}</span>
      <span className="font-bold ml-3">{count}x</span>
    </div>
  );
}

export default function FleetFeedbackThemes({ feedback }) {
  const positiveComments = feedback.filter(f => f.rating >= 4 && f.comment).map(f => f.comment);
  const negativeComments = feedback.filter(f => f.rating <= 2 && f.comment).map(f => f.comment);

  const positiveThemes = countThemes(positiveComments, POSITIVE_KEYWORDS);
  const negativeThemes = countThemes(negativeComments, NEGATIVE_KEYWORDS);

  const hasAny = positiveThemes.length > 0 || negativeThemes.length > 0;

  if (!hasAny) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
        Not enough comments yet to detect themes. Themes appear once drivers receive written feedback.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ThumbsUp className="w-4 h-4 text-green-500" />
          <h3 className="font-semibold text-sm text-foreground">Positive Themes</h3>
          <span className="text-xs text-muted-foreground ml-auto">from {positiveComments.length} comments</span>
        </div>
        {positiveThemes.length > 0 ? positiveThemes.map(t => (
          <ThemeTag key={t.label} label={t.label} count={t.count} color="bg-green-500/5 border-green-500/20 text-green-700" />
        )) : (
          <p className="text-muted-foreground text-sm">No positive themes detected yet.</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ThumbsDown className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-sm text-foreground">Negative Themes</h3>
          <span className="text-xs text-muted-foreground ml-auto">from {negativeComments.length} comments</span>
        </div>
        {negativeThemes.length > 0 ? negativeThemes.map(t => (
          <ThemeTag key={t.label} label={t.label} count={t.count} color="bg-red-500/5 border-red-500/20 text-red-700" />
        )) : (
          <p className="text-muted-foreground text-sm">No negative themes detected yet.</p>
        )}
      </div>
    </div>
  );
}