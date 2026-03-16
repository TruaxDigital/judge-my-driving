import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Pencil, QrCode, Star, MessageSquare, Power, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

function generateCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Stickers() {
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const { data: stickers = [], isLoading } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id }, '-created_date');
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      let code = generateCode();
      // Ensure uniqueness
      let existing = await base44.entities.Sticker.filter({ unique_code: code });
      while (existing.length > 0) {
        code = generateCode();
        existing = await base44.entities.Sticker.filter({ unique_code: code });
      }
      return base44.entities.Sticker.create({
        unique_code: code,
        owner_id: user.id,
        owner_email: user.email,
        driver_label: newLabel || 'My Vehicle',
        status: 'active',
        is_registered: true,
        qr_url: `${window.location.origin}/scan/${code}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
      setCreateDialog(false);
      setNewLabel('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sticker.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
      setEditDialog(null);
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Stickers</h1>
          <p className="text-muted-foreground mt-1">Manage your driving stickers.</p>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Sticker
        </Button>
      </div>

      {stickers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <QrCode className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No stickers yet. Create one to get started.</p>
          <Button onClick={() => setCreateDialog(true)} variant="outline" className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Create Sticker
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {stickers.map(sticker => (
            <div key={sticker.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-foreground text-lg">
                    {sticker.driver_label || 'Unnamed'}
                  </h3>
                  <Badge variant="outline" className={cn("border text-xs", statusColors[sticker.status])}>
                    {sticker.status}
                  </Badge>
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
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/scan/${sticker.unique_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <ExternalLink className="w-4 h-4 mr-1" /> Preview
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    setEditLabel(sticker.driver_label || '');
                    setEditDialog(sticker);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Edit
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
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sticker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Driver / Vehicle Nickname</Label>
              <Input
                placeholder="e.g. Mom's Car, Fleet Truck #5"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sticker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Driver / Vehicle Nickname</Label>
              <Input
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
    </div>
  );
}