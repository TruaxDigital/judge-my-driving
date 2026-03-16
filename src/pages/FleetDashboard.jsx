import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, MessageSquare, ShieldAlert, Pencil, Power, ChevronDown, ChevronRight, Users, Truck, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import FleetUpgradeBanner from '../components/fleet/FleetUpgradeBanner';

const statusColors = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  registered: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  deactivated: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
};

export default function FleetDashboard() {
  const queryClient = useQueryClient();
  const [expandedGroups, setExpandedGroups] = useState({});
  const [editDialog, setEditDialog] = useState(null);
  const [editData, setEditData] = useState({});
  const [groupFilter, setGroupFilter] = useState('all');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stickers = [], isLoading: stickersLoading } = useQuery({
    queryKey: ['my-stickers'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Sticker.filter({ owner_id: u.id }, '-created_date');
    },
  });

  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['fleet-feedback', stickers],
    queryFn: async () => {
      if (stickers.length === 0) return [];
      const all = [];
      for (const s of stickers) {
        const fb = await base44.entities.Feedback.filter({ sticker_id: s.id });
        all.push(...fb.map(f => ({ ...f, _stickerId: s.id })));
      }
      return all;
    },
    enabled: stickers.length > 0,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sticker.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
      setEditDialog(null);
    },
  });

  const isLoading = userLoading || stickersLoading || feedbackLoading;

  // Groups derived from stickers
  const groups = useMemo(() => {
    const groupMap = {};
    for (const s of stickers) {
      const g = s.fleet_group || 'Ungrouped';
      if (!groupMap[g]) groupMap[g] = [];
      groupMap[g].push(s);
    }
    return groupMap;
  }, [stickers]);

  const allGroups = Object.keys(groups);

  // Fleet-level stats
  const totalVehicles = stickers.length;
  const activeVehicles = stickers.filter(s => s.status === 'active').length;
  const totalFeedback = feedback.length;
  const avgRating = totalFeedback > 0
    ? (feedback.reduce((s, f) => s + f.rating, 0) / totalFeedback).toFixed(1)
    : '—';
  const safetyFlags = feedback.filter(f => f.safety_flag).length;

  const getFeedbackForSticker = (id) => feedback.filter(f => f._stickerId === id);

  const toggleGroup = (g) => setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] }));

  const filteredGroups = groupFilter === 'all' ? allGroups : [groupFilter];

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (user?.plan !== 'fleet') {
    return <FleetUpgradeBanner />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Fleet Dashboard</h1>
        <p className="text-muted-foreground mt-1">{user?.company_name || 'Your fleet'} — {totalVehicles} vehicles</p>
      </div>

      {/* Fleet stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Vehicles', value: totalVehicles, icon: Truck, color: 'text-primary' },
          { label: 'Active', value: activeVehicles, icon: Users, color: 'text-green-500' },
          { label: 'Avg Rating', value: avgRating, icon: TrendingUp, color: 'text-primary' },
          { label: 'Safety Flags', value: safetyFlags, icon: ShieldAlert, color: safetyFlags > 0 ? 'text-red-500' : 'text-muted-foreground' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Group filter */}
      {allGroups.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by group:</span>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {allGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Vehicle groups */}
      <div className="space-y-4">
        {filteredGroups.map(groupName => {
          const groupStickers = groups[groupName] || [];
          const isOpen = expandedGroups[groupName] !== false; // default open
          const groupFb = groupStickers.flatMap(s => getFeedbackForSticker(s.id));
          const groupAvg = groupFb.length > 0
            ? (groupFb.reduce((s, f) => s + f.rating, 0) / groupFb.length).toFixed(1)
            : '—';

          return (
            <div key={groupName} className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Group header */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                onClick={() => toggleGroup(groupName)}
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="font-semibold text-foreground">{groupName}</span>
                  <Badge variant="outline" className="text-xs">{groupStickers.length} vehicles</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {groupFb.length}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {groupAvg}</span>
                </div>
              </button>

              {/* Vehicle rows */}
              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {groupStickers.map(sticker => {
                    const fb = getFeedbackForSticker(sticker.id);
                    const avg = fb.length > 0
                      ? (fb.reduce((s, f) => s + f.rating, 0) / fb.length).toFixed(1)
                      : '—';
                    const safety = fb.filter(f => f.safety_flag).length;

                    return (
                      <div key={sticker.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground text-sm">
                              {sticker.driver_label || 'Unnamed Vehicle'}
                            </span>
                            {sticker.driver_name && (
                              <span className="text-xs text-muted-foreground">· {sticker.driver_name}</span>
                            )}
                            {sticker.vehicle_id && (
                              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{sticker.vehicle_id}</span>
                            )}
                            <Badge variant="outline" className={cn('border text-xs', statusColors[sticker.status])}>
                              {sticker.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-mono">{sticker.unique_code}</span>
                            <span>{fb.length} reviews</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" />{avg}</span>
                            {safety > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                <AlertTriangle className="w-3 h-3" />{safety} safety
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline" size="sm" className="rounded-lg h-8"
                            onClick={() => { setEditData({ driver_label: sticker.driver_label || '', driver_name: sticker.driver_name || '', fleet_group: sticker.fleet_group || '', vehicle_id: sticker.vehicle_id || '' }); setEditDialog(sticker); }}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline" size="sm" className="rounded-lg h-8"
                            onClick={() => updateMutation.mutate({ id: sticker.id, data: { status: sticker.status === 'active' ? 'deactivated' : 'active' } })}
                          >
                            <Power className="w-3.5 h-3.5 mr-1" />
                            {sticker.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {stickers.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Truck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No vehicles yet. Claim stickers from the Stickers page to start managing your fleet.</p>
          </div>
        )}
      </div>

      {/* Edit vehicle dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update the details for this vehicle or driver.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { key: 'driver_label', label: 'Vehicle Nickname', placeholder: 'e.g. Truck #5, Route 7 Van' },
              { key: 'driver_name', label: 'Driver Name', placeholder: 'e.g. John Smith' },
              { key: 'vehicle_id', label: 'Vehicle ID / Plate', placeholder: 'e.g. VAN-014, ABC1234' },
              { key: 'fleet_group', label: 'Fleet Group', placeholder: 'e.g. Route 7, Sales Team' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  placeholder={placeholder}
                  value={editData[key] || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate({ id: editDialog.id, data: editData })}
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