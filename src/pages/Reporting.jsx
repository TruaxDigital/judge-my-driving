import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, FileText, Send, CheckCircle, Calendar, ShieldAlert, Star, Mail } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function Reporting() {
  const [sending, setSending] = useState(false);

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
    queryKey: ['all-feedback-report', stickers],
    queryFn: async () => {
      if (stickers.length === 0) return [];
      const all = [];
      for (const s of stickers) {
        const fb = await base44.entities.Feedback.filter({ sticker_id: s.id });
        all.push(...fb.map(f => ({ ...f, _stickerLabel: s.driver_label, _stickerCode: s.unique_code })));
      }
      return all;
    },
    enabled: stickers.length > 0,
  });

  const isLoading = stickersLoading || feedbackLoading;

  const handleSendNow = async () => {
    setSending(true);
    const response = await base44.functions.invoke('generateMonthlyReport', {});
    if (response.data?.success) {
      toast.success('Report sent to your email!');
    } else {
      toast.error(response.data?.error || 'Failed to send report');
    }
    setSending(false);
  };

  // Per-sticker summary for the preview cards
  const stickerSummaries = stickers.map(s => {
    const fb = feedback.filter(f => f.sticker_id === s.id);
    const total = fb.length;
    const avg = total > 0 ? (fb.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) : '—';
    const safety = fb.filter(f => f.safety_flag).length;
    const positive = fb.filter(f => f.rating >= 4 && f.comment).slice(0, 2);
    return { sticker: s, total, avg, safety, positive };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg"
            alt="Judge My Driving"
            className="h-20 w-auto mb-2"
          />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Reporting</h1>
          <p className="text-muted-foreground mt-1">Monthly PDF reports are auto-emailed to you on the 1st of each month.</p>
        </div>
        <Button onClick={handleSendNow} disabled={sending || isLoading} className="rounded-xl">
          {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Send Report Now
        </Button>
      </div>

      {/* Schedule info */}
      <Card className="rounded-2xl border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Automatic Monthly Report</p>
            <p className="text-muted-foreground text-sm">
              A PDF summary is emailed to <span className="font-medium text-foreground">{user?.email}</span> on the 1st of every month.
              Next report: <span className="font-medium text-foreground">{moment().add(1, 'month').startOf('month').format('MMMM 1, YYYY')}</span>
            </p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500 ml-auto shrink-0" />
        </CardContent>
      </Card>

      {/* Per-sticker preview */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : stickerSummaries.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No stickers yet. Claim a sticker to start generating reports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Report Preview — {moment().format('MMMM YYYY')}</h2>
          <div className="grid gap-4">
            {stickerSummaries.map(({ sticker, total, avg, safety, positive }) => (
              <Card key={sticker.id} className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-primary" />
                    {sticker.driver_label || 'Unnamed Vehicle'}
                    <span className="text-xs font-mono text-muted-foreground ml-1">#{sticker.unique_code}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-foreground">{total}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Total Feedback</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                        {avg}
                        {avg !== '—' && <Star className="w-4 h-4 text-primary fill-primary" />}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Avg Rating</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${safety > 0 ? 'bg-red-500/10' : 'bg-muted'}`}>
                      <p className={`text-2xl font-bold ${safety > 0 ? 'text-red-500' : 'text-foreground'}`}>{safety}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                        {safety > 0 && <ShieldAlert className="w-3 h-3 text-red-400" />} Safety Flags
                      </p>
                    </div>
                  </div>

                  {positive.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Positive Feedback</p>
                      {positive.map(f => (
                        <div key={f.id} className="bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
                          <p className="text-sm text-foreground">"{f.comment}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {total === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No feedback received yet.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}