import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, MessageSquare, Pencil, Power, ChevronDown, ChevronRight, Truck, AlertTriangle, BarChart2, List, FileBarChart, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import FleetUpgradeBanner from '../components/fleet/FleetUpgradeBanner';
import FleetStatCards from '../components/fleet/FleetStatCards';
import FleetDriverLeaderboard from '../components/fleet/FleetDriverLeaderboard';
import FleetFeedbackThemes from '../components/fleet/FleetFeedbackThemes';
import FleetReports from '../components/fleet/FleetReports';
import CorrectiveActionPanel from '../components/fleet/CorrectiveActionPanel';
import InsuranceReportGenerator from '../components/fleet/InsuranceReportGenerator';

const statusColors = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  registered: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  deactivated: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
};

const DATE_RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: 'All time', value: null },
];

export default function FleetDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('analytics');
  const [incidentFilter, setIncidentFilter] = useState('all');

  React.useEffect(() => {
    const handler = (e) => setActiveTab(e.detail);
    window.addEventListener('fleet-tab-change', handler);
    return () => window.removeEventListener('fleet-tab-change', handler);
  }, []);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [editDialog, setEditDialog] = useState(null);
  const [editData, setEditData] = useState({});
  const [groupFilter, setGroupFilter] = useState('all');
  const [dateRange, setDateRange] = useState(30);

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

  const { data: allFeedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['fleet-feedback', stickers.map(s => s.id).join(',')],
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

  const { data: allCorrectiveActions = [] } = useQuery({
    queryKey: ['all-corrective-actions'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.CorrectiveAction.filter({ fleet_id: u.id });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sticker.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] });
      setEditDialog(null);
    },
  });

  const isLoading = userLoading || stickersLoading || feedbackLoading;

  const feedback = useMemo(() => {
    if (!dateRange) return allFeedback;
    const cutoff = moment().subtract(dateRange, 'days').toISOString();
    return allFeedback.filter(f => f.created_date >= cutoff);
  }, [allFeedback, dateRange]);

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

  // Stickers filtered by the selected fleet group
  const filteredStickers = useMemo(() => {
    if (groupFilter === 'all') return stickers;
    return stickers.filter(s => (s.fleet_group || 'Ungrouped') === groupFilter);
  }, [stickers, groupFilter]);

  // Feedback filtered by group + date range
  const filteredFeedback = useMemo(() => {
    const groupStickerIds = new Set(filteredStickers.map(s => s.id));
    return feedback.filter(f => groupStickerIds.has(f._stickerId));
  }, [feedback, filteredStickers]);

  const driverRows = useMemo(() => {
    return filteredStickers.map(s => {
      const fb = filteredFeedback.filter(f => f._stickerId === s.id);
      const avg = fb.length > 0
        ? parseFloat((fb.reduce((acc, f) => acc + f.rating, 0) / fb.length).toFixed(1))
        : 0;
      return {
        stickerId: s.id,
        name: s.driver_label || s.driver_name || 'Unnamed Vehicle',
        vehicleId: s.vehicle_id || '',
        group: s.fleet_group || '',
        avgRating: avg,
        totalReviews: fb.length,
        safetyCount: fb.filter(f => f.safety_flag).length,
      };
    });
  }, [filteredStickers, filteredFeedback]);

  const totalScans = filteredFeedback.length;
  const reviewedDrivers = driverRows.filter(d => d.totalReviews > 0);
  const fleetAvg = reviewedDrivers.length > 0
    ? (reviewedDrivers.reduce((s, d) => s + d.avgRating, 0) / reviewedDrivers.length).toFixed(1)
    : '—';
  const safetyIncidents = filteredFeedback.filter(f => f.safety_flag).length;

  // Unresolved incidents: safety flags with no corrective action OR action not Resolved
  const unresolvedIncidents = useMemo(() => {
    const safetyFbIds = new Set(filteredFeedback.filter(f => f.safety_flag).map(f => f.id));
    let count = 0;
    for (const fbId of safetyFbIds) {
      const action = allCorrectiveActions.find(a => a.incident_id === fbId);
      if (!action || action.status !== 'Resolved') count++;
    }
    return count;
  }, [filteredFeedback, allCorrectiveActions]);

  const getFeedbackForSticker = (id) => allFeedback.filter(f => f._stickerId === id);
  const toggleGroup = (g) => setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] }));
  const filteredGroups = groupFilter === 'all' ? allGroups : [groupFilter];

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (!['fleet_admin', 'admin'].includes(user?.role) && user?.plan !== 'fleet') {
    return <FleetUpgradeBanner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Fleet Dashboard</h1>
          <p className="text-muted-foreground mt-1">{user?.company_name || 'Your fleet'} — {stickers.length} vehicles</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center bg-muted rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn('flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'analytics' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={cn('flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'vehicles' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <List className="w-4 h-4" /> Vehicles
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={cn('flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'reports' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <FileBarChart className="w-4 h-4" /> Reports
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={cn('flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all relative', activeTab === 'insurance' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <ShieldAlert className="w-4 h-4" /> Insurance
            {unresolvedIncidents > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unresolvedIncidents}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Date range:</span>
              {DATE_RANGES.map(r => (
                <button
                  key={r.label}
                  onClick={() => setDateRange(r.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                    dateRange === r.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {allGroups.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Fleet group:</span>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {allGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <FleetStatCards totalDrivers={filteredStickers.length} totalScans={totalScans} avgRating={fleetAvg} safetyIncidents={safetyIncidents} unresolvedIncidents={unresolvedIncidents} />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Driver Leaderboard</h2>
            <FleetDriverLeaderboard drivers={driverRows} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Feedback Themes</h2>
            <FleetFeedbackThemes feedback={filteredFeedback} />
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <FleetReports stickers={stickers} allFeedback={allFeedback} user={user} />
      )}

      {activeTab === 'insurance' && (
        <div className="space-y-8">
          {unresolvedIncidents > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                {unresolvedIncidents} safety incident{unresolvedIncidents > 1 ? 's' : ''} require corrective action before generating your insurance report.
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-foreground">Open Safety Incidents</h2>
              <Select value={incidentFilter} onValueChange={setIncidentFilter}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Incidents</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filteredFeedback.filter(f => f.safety_flag).length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
                No safety incidents in the selected period. 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedback.filter(f => f.safety_flag).filter(incident => {
                  if (incidentFilter === 'all') return true;
                  const action = allCorrectiveActions.find(a => a.incident_id === incident.id);
                  if (incidentFilter === 'resolved') return action?.status === 'Resolved';
                  if (incidentFilter === 'follow_up') return action?.status === 'In Progress';
                  if (incidentFilter === 'open') return !action || action.status === 'Open';
                  return true;
                }).map(incident => {
                  const sticker = stickers.find(s => s.id === incident._stickerId);
                  const action = allCorrectiveActions.find(a => a.incident_id === incident.id);
                  return (
                    <div key={incident.id} className={cn(
                      'bg-card border rounded-2xl p-4',
                      action?.status === 'Resolved' ? 'border-green-500/20' : 'border-red-500/20'
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-foreground">
                              {sticker?.driver_label || sticker?.driver_name || 'Unknown Vehicle'}
                            </span>
                            {sticker?.vehicle_id && <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{sticker.vehicle_id}</span>}
                            <span className="text-xs text-muted-foreground">{incident.created_date?.slice(0, 10)}</span>
                          </div>
                          {incident.comment && <p className="text-xs text-muted-foreground mt-1">{incident.comment}</p>}
                        </div>
                        <div className={cn('shrink-0 w-2 h-2 rounded-full mt-1.5', action?.status === 'Resolved' ? 'bg-green-500' : 'bg-red-500')} />
                      </div>
                      <CorrectiveActionPanel incident={incident} fleetId={user?.id} userId={user?.id} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Generate Insurance Report</h2>
            <InsuranceReportGenerator />
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          {allGroups.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Filter by group:</span>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {allGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {filteredGroups.map(groupName => {
            const groupStickers = groups[groupName] || [];
            const isOpen = expandedGroups[groupName] !== false;
            const groupFb = groupStickers.flatMap(s => getFeedbackForSticker(s.id));
            const groupAvg = groupFb.length > 0
              ? (groupFb.reduce((s, f) => s + f.rating, 0) / groupFb.length).toFixed(1)
              : '—';

            return (
              <div key={groupName} className="bg-card border border-border rounded-2xl overflow-hidden">
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
                              <span className="font-medium text-foreground text-sm">{sticker.driver_label || 'Unnamed Vehicle'}</span>
                              {sticker.driver_name && <span className="text-xs text-muted-foreground">· {sticker.driver_name}</span>}
                              {sticker.vehicle_id && <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{sticker.vehicle_id}</span>}
                              <Badge variant="outline" className={cn('border text-xs', statusColors[sticker.status])}>{sticker.status}</Badge>
                              {sticker.start_date && (() => { const days = moment().diff(moment(sticker.start_date), 'days'); return days >= 0 && days <= 90; })() && (
                                <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600 bg-yellow-500/5">🆕 90 Days</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-mono">{sticker.unique_code}</span>
                              <span>{fb.length} reviews</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{avg}</span>
                              {safety > 0 && <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3" />{safety} safety</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="rounded-lg h-8"
                              onClick={() => { setEditData({ driver_label: sticker.driver_label || '', driver_name: sticker.driver_name || '', driver_email: sticker.driver_email || '', vehicle_id: sticker.vehicle_id || '', fleet_group: sticker.fleet_group || '', start_date: sticker.start_date || '', send_monthly_report: sticker.send_monthly_report || false }); setEditDialog(sticker); }}>
                              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-lg h-8"
                              onClick={() => updateMutation.mutate({ id: sticker.id, data: { status: sticker.status === 'active' ? 'deactivated' : 'active' } })}>
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
      )}

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
              { key: 'driver_email', label: 'Driver Email', placeholder: 'e.g. john@company.com' },
              { key: 'vehicle_id', label: 'Vehicle ID / Plate', placeholder: 'e.g. VAN-014, ABC1234' },
              { key: 'fleet_group', label: 'Fleet Group', placeholder: 'e.g. Route 7, Sales Team' },
              { key: 'start_date', label: 'Start Date (for 90-day onboarding tracking)', placeholder: 'YYYY-MM-DD' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input placeholder={placeholder} value={editData[key] || ''} onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">Monthly Driving Report</p>
                <p className="text-xs text-muted-foreground">Email a monthly summary to this driver</p>
              </div>
              <button
                type="button"
                onClick={() => setEditData(prev => ({ ...prev, send_monthly_report: !prev.send_monthly_report }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editData.send_monthly_report ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.send_monthly_report ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: editDialog.id, data: editData })} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}