import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Smartphone, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PreviewScan() {
  const [selectedCode, setSelectedCode] = useState('');

  const { data: stickers = [], isLoading } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id }, '-created_date');
    },
  });

  const activeStickers = stickers.filter(s => s.status === 'active');
  const previewCode = selectedCode || activeStickers[0]?.unique_code;
  const previewUrl = previewCode ? `/scan/${previewCode}?preview=1` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Reporter Experience</h1>
        <p className="text-muted-foreground mt-1">
          This is exactly what someone sees after scanning the QR code on your sticker.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {activeStickers.length > 1 && (
          <Select value={previewCode} onValueChange={setSelectedCode}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select a sticker" />
            </SelectTrigger>
            <SelectContent>
              {activeStickers.map(s => (
                <SelectItem key={s.unique_code} value={s.unique_code}>
                  {s.driver_label || s.unique_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="rounded-lg">
              <ExternalLink className="w-4 h-4 mr-2" /> Open on real device
            </Button>
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : !previewUrl ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <Smartphone className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No active stickers to preview. Claim and activate a sticker first.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* Phone frame */}
          <div className="relative mx-auto" style={{ width: 390 }}>
            {/* Phone shell */}
            <div className="relative bg-zinc-800 rounded-[48px] p-3 shadow-2xl ring-1 ring-zinc-700">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-zinc-800 rounded-b-2xl z-10 flex items-center justify-center">
                <div className="w-16 h-1.5 bg-zinc-700 rounded-full" />
              </div>
              {/* Screen */}
              <div className="rounded-[38px] overflow-hidden bg-zinc-900" style={{ height: 760 }}>
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Scan preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
              {/* Home bar */}
              <div className="flex justify-center mt-2">
                <div className="w-24 h-1 bg-zinc-600 rounded-full" />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Feedback submitted here is not recorded. Use "Open on real device" to test on your phone.
          </p>
        </div>
      )}
    </div>
  );
}