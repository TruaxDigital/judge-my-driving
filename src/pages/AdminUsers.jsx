import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Plus, Minus, CreditCard, Users, Activity, CreditCard as SubIcon, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import UserActivityDrawer from '@/components/admin/UserActivityDrawer';
import InviteUserDialog from '@/components/admin/InviteUserDialog';
import ManageSubscriptionDialog from '@/components/admin/ManageSubscriptionDialog';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Dialog state
  const [creditDialog, setCreditDialog] = useState(null);
  const [activityUser, setActivityUser] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [subUser, setSubUser] = useState(null);

  // Credit adjust state
  const [delta, setDelta] = useState(1);
  const [note, setNote] = useState('');
  const [createStickers, setCreateStickers] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('listAllUsers', {});
      return res.data?.users || [];
    },
    enabled: me?.role === 'admin',
  });

  if (me && me.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Access restricted to admins.</p>
      </div>
    );
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjust = async () => {
    if (!creditDialog || delta === 0) return;
    setSaving(true);
    const res = await base44.functions.invoke('manageStickerCredits', {
      target_user_id: creditDialog.user.id,
      delta,
      note,
      create_stickers: createStickers,
    });
    setSaving(false);
    if (res.data?.success) {
      toast.success(`Credits updated: ${res.data.previous_credits} → ${res.data.new_credits}${res.data.stickers_created ? ` (${res.data.stickers_created} sticker(s) created)` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setCreditDialog(null);
      setDelta(1);
      setNote('');
    } else {
      toast.error(res.data?.error || 'Failed to update credits');
    }
  };

  const planColor = {
    individual: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    family: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    starter_fleet: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    professional_fleet: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    enterprise_fleet: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">User Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{users.length} total users</p>
          </div>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="rounded-xl gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">User</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Plan</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-center px-5 py-3 font-semibold text-muted-foreground">Credits</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{u.full_name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    {u.plan_tier ? (
                      <Badge variant="outline" className={`text-xs border ${planColor[u.plan_tier] || ''}`}>
                        {u.plan_tier.replace(/_/g, ' ')}
                      </Badge>
                    ) : <span className="text-muted-foreground text-xs">none</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${u.subscription_status === 'active' ? 'text-green-600' : u.subscription_status === 'past_due' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {u.subscription_status || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`font-bold text-base ${(u.sticker_credits || 0) > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {u.sticker_credits || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-xs"
                        onClick={() => setActivityUser(u)}
                      >
                        <Activity className="w-3.5 h-3.5 mr-1" /> Activity
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-xs"
                        onClick={() => setSubUser(u)}
                      >
                        <SubIcon className="w-3.5 h-3.5 mr-1" /> Subscription
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-xs"
                        onClick={() => { setCreditDialog({ user: u }); setDelta(1); setNote(''); setCreateStickers(true); }}
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" /> Credits
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Credits Dialog */}
      <Dialog open={!!creditDialog} onOpenChange={open => { if (!open) setCreditDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Sticker Credits</DialogTitle>
            <DialogDescription>
              Adjusting credits for <strong>{creditDialog?.user?.full_name || creditDialog?.user?.email}</strong>.
              Current credits: <strong>{creditDialog?.user?.sticker_credits || 0}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Credit Change</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="rounded-lg" onClick={() => setDelta(d => d - 1)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={delta}
                  onChange={e => setDelta(parseInt(e.target.value) || 0)}
                  className="w-24 text-center font-bold text-lg"
                />
                <Button variant="outline" size="icon" className="rounded-lg" onClick={() => setDelta(d => d + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {delta >= 0 ? `+${delta}` : delta} → <strong>{Math.max(0, (creditDialog?.user?.sticker_credits || 0) + delta)}</strong> credits
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
              <input
                type="checkbox"
                id="createStickers"
                checked={createStickers}
                onChange={e => setCreateStickers(e.target.checked)}
                className="w-4 h-4 accent-yellow-400"
              />
              <label htmlFor="createStickers" className="text-sm cursor-pointer">
                Also create sticker records immediately (recommended for new credits)
              </label>
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                placeholder="e.g. Complimentary credits, customer service adjustment..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="pb-safe">
            <Button variant="outline" onClick={() => setCreditDialog(null)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving || delta === 0}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Drawer */}
      <UserActivityDrawer
        user={activityUser}
        open={!!activityUser}
        onClose={() => setActivityUser(null)}
      />

      {/* Invite Dialog */}
      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />

      {/* Manage Subscription Dialog */}
      {subUser && (
        <ManageSubscriptionDialog
          user={subUser}
          open={!!subUser}
          onClose={() => setSubUser(null)}
        />
      )}
    </div>
  );
}