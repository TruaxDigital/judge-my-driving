import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '../components/dashboard/PullToRefreshIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil, QrCode, Star, MessageSquare, Globe, ExternalLink, PackageCheck, Palette, RefreshCw, PlusCircle, MoreHorizontal, Power, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import moment from 'moment';
import QRCodeModal from '../components/stickers/QRCodeModal';
import StickerDesignPicker from '../components/stickers/StickerDesignPicker';
import ReplacementStickerDialog from '../components/stickers/ReplacementStickerDialog';
import ClaimStickerWizard from '../components/stickers/ClaimStickerWizard';
import { cn, isInIframe } from '@/lib/utils';

export default function Stickers() {
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
  };
  const { containerRef, pullDistance, refreshing } = usePullToRefresh(handleRefresh);
  const [editDialog, setEditDialog] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [qrSticker, setQrSticker] = useState(null);
  const [designDialog, setDesignDialog] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState('default');
  const [replacementSticker, setReplacementSticker] = useState(null);
  const [addonLoading, setAddonLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimWizardStickers, setClaimWizardStickers] = useState([]);
  const [showHidden, setShowHidden] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stickers = [], isLoading } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id }, '-created_date');
    },
  });

  const handleOrderMore = async () => {
    if (isInIframe()) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setAddonLoading(true);
    const res = await base44.functions.invoke('createCheckoutSession', {
      mode: 'addon',
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert('Could not start checkout. Please try again.');
    }
    setAddonLoading(false);
  };

  const handleUpgrade = async () => {
    if (isInIframe()) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setAddonLoading(true);
    const res = await base44.functions.invoke('createCheckoutSession', { mode: 'upgrade' });
    if (res.data?.success) {
      alert('Your plan has been upgraded to Family! Your 2 additional stickers are being prepared.');
      window.location.reload();
    } else {
      alert(res.data?.error || 'Could not process upgrade. Please try again.');
    }
    setAddonLoading(false);
  };

  const handleClaimSticker = async () => {
    setClaimLoading(true);
    try {
      await base44.functions.invoke('provisionMyStickers', {});
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      // Fetch fresh stickers to get the newly created one
      const u = await base44.auth.me();
      const allStickers = await base44.entities.Sticker.filter({ owner_id: u.id }, '-created_date');
      const unclaimedNew = allStickers.filter(s => !s.printful_order_id && !s.design_id);
      if (unclaimedNew.length > 0) {
        setClaimWizardStickers([unclaimedNew[0]]);
      }
    } catch (err) {
      alert('Failed to claim sticker. Please try again.');
    }
    setClaimLoading(false);
  };

  // Stickers that haven't been sent to Printful yet (no printful_order_id)
  const unclaimedStickers = stickers.filter(s => !s.printful_order_id);

  // Filter stickers based on visibility and user role (fleet users can hide/show)
  const isFleetUser = ['fleet_admin', 'starter_fleet', 'professional_fleet'].includes(user?.role) || user?.plan === 'fleet';
  const visibleStickers = isFleetUser && !showHidden ? stickers.filter(s => !s.is_hidden) : stickers;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sticker.update(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update for rename (driver_label)
      if ('driver_label' in data) {
        await queryClient.cancelQueries({ queryKey: ['my-stickers'] });
        const previous = queryClient.getQueryData(['my-stickers']);
        queryClient.setQueryData(['my-stickers'], (old = []) =>
          old.map(s => s.id === id ? { ...s, ...data } : s)
        );
        return { previous };
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['my-stickers'], context.previous);
    },
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
    <div className="space-y-6" ref={containerRef}>
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">My Stickers</h1>
            <p className="text-muted-foreground mt-1">Stickers linked to your account.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {user?.plan_tier === 'individual' && (
              <Button variant="outline" onClick={handleUpgrade} disabled={addonLoading} className="rounded-xl">
                {addonLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                Upgrade to Add Vehicles
              </Button>
            )}
            {(['family', 'starter_fleet', 'professional_fleet'].includes(user?.plan_tier) || user?.plan === 'fleet') && (
              <Button variant="outline" onClick={handleOrderMore} disabled={addonLoading} className="rounded-xl">
                {addonLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                Order More Stickers
              </Button>
            )}
          </div>
        </div>
        {/* Mobile-only centered buttons */}
        <div className="flex sm:hidden justify-center">
          {user?.plan_tier === 'individual' && (
            <Button variant="outline" onClick={handleUpgrade} disabled={addonLoading} className="rounded-xl w-full">
              {addonLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
              Upgrade to Add Vehicles
            </Button>
          )}
          {(['family', 'starter_fleet', 'professional_fleet'].includes(user?.plan_tier) || user?.plan === 'fleet') && (
            <Button variant="outline" onClick={handleOrderMore} disabled={addonLoading} className="rounded-xl w-full">
              {addonLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
              Order More Stickers
            </Button>
          )}
        </div>
      </div>

      {/* Banner for claiming stickers with available credits — only show if no stickers provisioned yet */}
      {(user?.sticker_credits || 0) > 0 && stickers.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground text-sm">
              ✨ You have {user.sticker_credits} sticker credit{user.sticker_credits > 1 ? 's' : ''} available!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Claim and order a new sticker now.
            </p>
          </div>
          <Button 
            onClick={handleClaimSticker} 
            disabled={claimLoading} 
            className="rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-semibold whitespace-nowrap shrink-0"
          >
            {claimLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Claim Sticker
          </Button>
        </div>
      )}

      {/* Banner for unclaimed stickers (not yet sent to Printful) */}
      {unclaimedStickers.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-center gap-4">
          <div>
            <p className="font-semibold text-foreground text-sm">
              🎉 You have {unclaimedStickers.length} sticker{unclaimedStickers.length > 1 ? 's' : ''} ready to configure and ship!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use the Design button on each sticker below to choose a design and enter your shipping address.
            </p>
          </div>
        </div>
      )}

      {stickers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No stickers yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Your stickers will appear here automatically after subscribing. Visit the Pricing page to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {isFleetUser && stickers.some(s => s.is_hidden) && (
            <div className="flex items-center gap-2">
              <Button
                variant={showHidden ? "default" : "outline"}
                size="sm"
                className="rounded-lg"
                onClick={() => setShowHidden(!showHidden)}
              >
                {showHidden ? 'Hide' : 'Show'} Hidden ({stickers.filter(s => s.is_hidden).length})
              </Button>
            </div>
          )}
          <div className="grid gap-4">
            {visibleStickers.map(sticker => (
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
                    {sticker.start_date && (() => { const days = moment().diff(moment(sticker.start_date), 'days'); return days >= 0 && days <= 90; })() && (
                      <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600 bg-yellow-500/5">🆕 90 Days</Badge>
                    )}
                    {sticker.fleet_group && (
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600 bg-blue-500/5">
                        {sticker.fleet_group}
                      </Badge>
                    )}
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
                  <Button
                    variant={sticker.printful_order_id ? 'outline' : 'default'}
                    size="sm"
                    className={`rounded-lg ${!sticker.printful_order_id ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-400' : ''}`}
                    onClick={() => {
                      if (sticker.printful_order_id) {
                        setSelectedDesign(sticker.design_id || 'default');
                        setDesignDialog(sticker);
                      } else {
                        setClaimWizardStickers([sticker]);
                      }
                    }}
                  >
                    <Palette className="w-4 h-4 mr-1" /> {sticker.printful_order_id ? 'Design' : 'Claim'}
                  </Button>
                  {/* Public Leaderboard Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn('rounded-lg', sticker.public_scorecard ? 'border-green-500/40 text-green-600 bg-green-500/5 hover:bg-green-500/10' : 'text-muted-foreground')}
                    onClick={() => updateMutation.mutate({ id: sticker.id, data: { public_scorecard: !sticker.public_scorecard } })}
                  >
                    {sticker.public_scorecard ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                    {sticker.public_scorecard ? 'Public' : 'Private'}
                  </Button>
                  {/* View Public Profile */}
                  {sticker.public_scorecard && (
                    <a href={`/driver-profile?code=${sticker.unique_code}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-lg text-primary border-primary/30 hover:bg-primary/5">
                        <Globe className="w-4 h-4 mr-1" /> Profile
                      </Button>
                    </a>
                  )}
                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-lg px-2">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditLabel(sticker.driver_label || ''); setEditDialog(sticker); }}>
                        <Pencil className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReplacementSticker(sticker)}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Order Replacement
                      </DropdownMenuItem>
                      <a href={`/scan/${sticker.unique_code}`} target="_blank" rel="noopener noreferrer">
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" /> Preview Scan Page
                        </DropdownMenuItem>
                      </a>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={sticker.status === 'active' ? 'text-destructive focus:text-destructive' : ''}
                        onClick={() => updateMutation.mutate({ id: sticker.id, data: { status: sticker.status === 'active' ? 'deactivated' : 'active' } })}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {sticker.status === 'active' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      {isFleetUser && (
                        <DropdownMenuItem
                          onClick={() => updateMutation.mutate({ id: sticker.id, data: { is_hidden: !sticker.is_hidden } })}
                        >
                          {sticker.is_hidden ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                          {sticker.is_hidden ? 'Unhide' : 'Hide'} from Dashboard
                        </DropdownMenuItem>
                      )}
                      </DropdownMenuContent>
                      </DropdownMenu>
                </div>
              </div>
            </div>
              ))}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal sticker={qrSticker} open={!!qrSticker} onClose={() => setQrSticker(null)} />

      {/* Rename Dialog */}
      <Dialog open={!!editDialog} onOpenChange={(open) => { if (!open) setEditDialog(null); }}>
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
      <Dialog open={!!designDialog} onOpenChange={(open) => { if (!open) setDesignDialog(null); }}>
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

      {/* Claim Sticker Wizard */}
      <ClaimStickerWizard
        stickers={claimWizardStickers}
        open={claimWizardStickers.length > 0}
        onClose={() => setClaimWizardStickers([])}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
          queryClient.invalidateQueries({ queryKey: ['me'] });
        }}
      />
    </div>
  );
}