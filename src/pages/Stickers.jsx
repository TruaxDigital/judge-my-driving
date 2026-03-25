import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil, QrCode, Star, MessageSquare, Power, ExternalLink, ScanLine, PackageCheck, Palette, RefreshCw } from 'lucide-react';
import QRCodeModal from '../components/stickers/QRCodeModal';
import StickerDesignPicker from '../components/stickers/StickerDesignPicker';
import ReplacementStickerDialog from '../components/stickers/ReplacementStickerDialog';
import ClaimStickerWizard from '../components/stickers/ClaimStickerWizard';
import { cn } from '@/lib/utils';

export default function Stickers() {
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [claimDialog, setClaimDialog] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [claimError, setClaimError] = useState('');
  const [qrSticker, setQrSticker] = useState(null);
  const [designDialog, setDesignDialog] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState('default');
  const [replacementSticker, setReplacementSticker] = useState(null);
  const [claimWizardOpen, setClaimWizardOpen] = useState(false);

  const { data: stickers = [], isLoading } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id }, '-created_date');
    },
  });

  // Auto-open claim wizard after a new subscription purchase
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sub_success') === 'true' && !isLoading && stickers.length > 0) {
      setClaimWizardOpen(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isLoading, stickers.length]);

  // Stickers that haven't been sent to Printful yet (no printful_order_id)
  const unclaimedStickers = stickers.filter(s => !s.printful_order_id);

  const claimMutation = useMutation({
    mutationFn: async () => {
      setClaimError('');
      const code = claimCode.trim().toUpperCase();
      const user = await base44.auth.me();
      const results = await base44.entities.Sticker.filter({ unique_code: code });

      if (results.length === 0) throw new Error('No sticker found with that code. Double-check and try again.');
      const sticker = results[0];
      if (sticker.is_registered) throw new Error('This sticker is already registered to an account.');

      return base44.entities.Sticker.update(sticker.id, {
        owner_id: user.id,
        owner_email: user.email,
        is_registered: true,
        status: 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
      setClaimDialog(false);
      setClaimCode('');
    },
    onError: (e) => setClaimError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sticker.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
      setEditDialog(null);
      setDesignDialog(null);
    },
  });

  const statusColors = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    registered: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    deactivated: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">My Stickers</h1>
          <p className="text-muted-foreground mt-1">Stickers linked to your account.</p>
        </div>
        <Button onClick={() => { setClaimCode(''); setClaimError(''); setClaimDialog(true); }} className="rounded-xl">
          <ScanLine className="w-4 h-4 mr-2" /> Claim a Sticker
        </Button>
      </div>

      {stickers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No stickers yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Once you receive your sticker in the mail, scan the QR code on it or enter the code below to link it to your account.
            </p>
          </div>
          <Button onClick={() => { setClaimCode(''); setClaimError(''); setClaimDialog(true); }} variant="outline" className="rounded-xl">
            <ScanLine className="w-4 h-4 mr-2" /> Claim a Sticker
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {stickers.map(sticker => (
            <div key={sticker.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-foreground text-lg">
                      {sticker.driver_label || 'Unnamed Vehicle'}
                    </h3>
                    <Badge variant="outline" className={cn("border text-xs", statusColors[sticker.status])}>
                      {sticker.status}
                    </Badge>
                    {sticker.design_id && sticker.design_id !== 'default' && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary/80">
                        <Palette className="w-3 h-3 mr-1" />
                        {sticker.design_id.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-mono">
                      <QrCode className="w-4 h-4" />
                      {sticker.unique_code}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      {sticker.feedback_count || 0} reviews
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4" />
                      {sticker.average_rating || '—'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setQrSticker(sticker)}>
                    <QrCode className="w-4 h-4 mr-1" /> QR Code
                  </Button>
                  <a href={`/scan/${sticker.unique_code}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <ExternalLink className="w-4 h-4 mr-1" /> Preview
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => { setSelectedDesign(sticker.design_id || 'default'); setDesignDialog(sticker); }}
                  >
                    <Palette className="w-4 h-4 mr-1" /> Design
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => { setEditLabel(sticker.driver_label || ''); setEditDialog(sticker); }}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Rename
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => setReplacementSticker(sticker)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Replace
                  </Button>
                  <Button
                    variant={sticker.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    className="rounded-lg"
                    onClick={() => updateMutation.mutate({
                      id: sticker.id,
                      data: { status: sticker.status === 'active' ? 'deactivated' : 'active' }
                    })}
                  >
                    <Power className="w-4 h-4 mr-1" />
                    {sticker.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Dialog */}
      <Dialog open={claimDialog} onOpenChange={setClaimDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Your Sticker</DialogTitle>
            <DialogDescription>
              Enter the unique code printed on your sticker, or simply scan its QR code with your phone camera.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Sticker Code</Label>
              <Input
                placeholder="e.g. JMD8K3NP"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                className="font-mono text-lg tracking-widest"
                maxLength={8}
              />
              {claimError && (
                <p className="text-sm text-destructive">{claimError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialog(false)}>Cancel</Button>
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimCode.trim().length < 6 || claimMutation.isPending}
            >
              {claimMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim Sticker'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <QRCodeModal sticker={qrSticker} open={!!qrSticker} onClose={() => setQrSticker(null)} />

      {/* Rename Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Sticker</DialogTitle>
            <DialogDescription>Give this sticker a nickname so you can identify which vehicle it belongs to.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Vehicle Nickname</Label>
              <Input
                placeholder="e.g. Mom's Car, Fleet Truck #5"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate({ id: editDialog.id, data: { driver_label: editLabel } })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Design Picker Dialog */}
      <Dialog open={!!designDialog} onOpenChange={() => setDesignDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Sticker Design</DialogTitle>
            <DialogDescription>
              Select a design for <strong>{designDialog?.driver_label || designDialog?.unique_code}</strong>. This determines which template will be printed on your sticker.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-[60vh] overflow-y-auto pr-1">
            <StickerDesignPicker value={selectedDesign} onChange={setSelectedDesign} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDesignDialog(null)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate({ id: designDialog.id, data: { design_id: selectedDesign } })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Design'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replacement Sticker Dialog */}
      <ReplacementStickerDialog
        sticker={replacementSticker}
        open={!!replacementSticker}
        onClose={() => setReplacementSticker(null)}
      />
    </div>
  );
}