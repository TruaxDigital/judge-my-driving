import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, RefreshCw, ExternalLink, Truck, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import moment from 'moment';

const STATUS_COLORS = {
  'Submitted': 'text-blue-600 border-blue-500/30 bg-blue-500/5',
  'Contacted': 'text-yellow-600 border-yellow-500/30 bg-yellow-500/5',
  'Deal Closed': 'text-purple-600 border-purple-500/30 bg-purple-500/5',
  '90-Day Hold': 'text-orange-600 border-orange-500/30 bg-orange-500/5',
  'Commission Approved': 'text-green-600 border-green-500/30 bg-green-500/5',
  'Paid': 'text-green-700 border-green-600/30 bg-green-600/10',
  'Rejected': 'text-red-600 border-red-500/30 bg-red-500/5',
};

const ALL_STATUSES = ['Submitted', 'Contacted', 'Deal Closed', '90-Day Hold', 'Commission Approved', 'Paid', 'Rejected'];

export default function AdminFleetReferrals() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSync, setFilterSync] = useState('all');
  const [filterPartner, setFilterPartner] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(null);

  const [editForm, setEditForm] = useState({
    status: '', deal_value: '', stripe_payment_date: '', commission_amount: '',
  });

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['admin-fleet-referrals'],
    queryFn: () => base44.entities.FleetReferral.list('-created_date'),
  });

  const { data: allConversions = [] } = useQuery({
    queryKey: ['admin-all-conversions'],
    queryFn: () => base44.entities.ReferralConversion.list(),
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => base44.entities.ReferralPartner.list(),
  });

  const filtered = referrals.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterSync !== 'all' && r.hubspot_sync_status !== filterSync) return false;
    if (filterPartner && !(r.partner_name || '').toLowerCase().includes(filterPartner.toLowerCase())) return false;
    return true;
  });

  const openDetail = (r) => {
    setSelected(r);
    setEditForm({
      status: r.status || 'Submitted',
      deal_value: r.deal_value || '',
      stripe_payment_date: r.stripe_payment_date || '',
      commission_amount: r.commission_amount || 100,
    });
  };

  const calc90DayDate = (stripeDate) => {
    if (!stripeDate) return '';
    return moment(stripeDate).add(90, 'days').format('YYYY-MM-DD');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const ninety_day_eligible_date = editForm.stripe_payment_date ? calc90DayDate(editForm.stripe_payment_date) : selected.ninety_day_eligible_date;
    const updates = {
      status: editForm.status,
      deal_value: editForm.deal_value ? Number(editForm.deal_value) : null,
      stripe_payment_date: editForm.stripe_payment_date || null,
      commission_amount: Number(editForm.commission_amount) || 100,
      ninety_day_eligible_date: ninety_day_eligible_date || null,
      status_updated_date: new Date().toISOString().slice(0, 10),
    };

    // If Commission Approved, create a ReferralConversion record for the partner
    const wasAlreadyApproved = selected.status === 'Commission Approved' || selected.status === 'Paid';
    if (editForm.status === 'Commission Approved' && !wasAlreadyApproved) {
      // Find partner record to get partner_id
      const partnerRec = partners.find(p => p.user_id === selected.partner_id) || partners.find(p => p.contact_name === selected.partner_name);
      if (partnerRec) {
        await base44.entities.ReferralConversion.create({
          ref_code: selected.ref_code || partnerRec.ref_code,
          partner_id: partnerRec.id,
          customer_name: selected.company_name,
          customer_email: selected.contact_email,
          subscription_type: 'fleet_referral',
          commission_amount: Number(editForm.commission_amount) || 100,
          commission_status: 'pending',
          conversion_date: new Date().toISOString().slice(0, 10),
          notes: `Fleet referral: ${selected.company_name}`,
        });
      }
    }

    await base44.entities.FleetReferral.update(selected.id, updates);
    queryClient.invalidateQueries({ queryKey: ['admin-fleet-referrals'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-conversions'] });
    setSaving(false);
    setSelected(null);
  };

  const handleRetrySync = async (referralId) => {
    setRetrying(referralId);
    await base44.functions.invoke('retryFleetReferralSync', { fleet_referral_id: referralId });
    queryClient.invalidateQueries({ queryKey: ['admin-fleet-referrals'] });
    setRetrying(null);
  };

  // Stats
  const totalSubmitted = referrals.length;
  const pendingAction = referrals.filter(r => r.status === 'Submitted' || r.status === 'Contacted').length;
  const inHold = referrals.filter(r => r.status === '90-Day Hold').length;
  const failedSync = referrals.filter(r => r.hubspot_sync_status === 'failed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Truck className="w-7 h-7 text-primary" /> Fleet Referrals
        </h1>
        <p className="text-muted-foreground mt-1">{referrals.length} total fleet referrals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Submitted', value: totalSubmitted, color: 'text-foreground' },
          { label: 'Pending Action', value: pendingAction, color: 'text-yellow-600' },
          { label: 'In 90-Day Hold', value: inHold, color: 'text-orange-600' },
          { label: 'Failed Sync', value: failedSync, color: failedSync > 0 ? 'text-red-600' : 'text-foreground' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Filter by partner name"
          value={filterPartner}
          onChange={e => setFilterPartner(e.target.value)}
          className="w-48"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSync} onValueChange={setFilterSync}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Sync Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sync Statuses</SelectItem>
            <SelectItem value="synced">Synced</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-card border border-border rounded-2xl h-14 animate-pulse" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Partner', 'Company', 'Contact', 'Fleet Size', 'Submitted', 'Status', 'Deal Value', '90-Day Date', 'Commission', 'HubSpot', 'Sync', ''].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-muted-foreground font-medium text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => openDetail(r)}>
                    <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">{r.partner_name || '—'}</td>
                    <td className="px-3 py-3 font-medium">{r.company_name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.contact_name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.estimated_fleet_size || '—'}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{moment(r.submitted_date || r.created_date).format('MMM D, YYYY')}</td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className={cn('text-xs border whitespace-nowrap', STATUS_COLORS[r.status] || '')}>{r.status}</Badge>
                    </td>
                    <td className="px-3 py-3">{r.deal_value ? `$${r.deal_value.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.ninety_day_eligible_date ? moment(r.ninety_day_eligible_date).format('MMM D, YYYY') : '—'}</td>
                    <td className="px-3 py-3 font-semibold">{r.commission_amount ? `$${r.commission_amount}` : '—'}</td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      {r.hubspot_deal_id ? (
                        <a href={`https://app.hubspot.com/contacts/245571544/deal/${r.hubspot_deal_id}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary text-xs hover:underline">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('text-xs font-medium', r.hubspot_sync_status === 'failed' ? 'text-red-500' : r.hubspot_sync_status === 'synced' ? 'text-green-600' : 'text-yellow-600')}>
                        {r.hubspot_sync_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      {r.hubspot_sync_status === 'failed' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg whitespace-nowrap"
                          onClick={() => handleRetrySync(r.id)}
                          disabled={retrying === r.id}>
                          {retrying === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw className="w-3 h-3 mr-1" /> Retry</>}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground text-sm">No fleet referrals found.</div>
            )}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected.company_name}</DialogTitle>
              <DialogDescription>{selected.contact_name} · {selected.contact_email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Read-only info */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                {[
                  ['Partner', selected.partner_name || '—'],
                  ['Ref Code', selected.ref_code || '—'],
                  ['Phone', selected.contact_phone || '—'],
                  ['Fleet Size', selected.estimated_fleet_size || '—'],
                  ['Notes', selected.notes || '—'],
                  ['Submitted', moment(selected.submitted_date || selected.created_date).format('MMM D, YYYY')],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="text-foreground text-right">{val}</span>
                  </div>
                ))}
                {selected.hubspot_deal_id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">HubSpot Deal</span>
                    <a href={`https://app.hubspot.com/contacts/245571544/deal/${selected.hubspot_deal_id}`} target="_blank" rel="noopener noreferrer"
                      className="text-primary text-xs flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Open in HubSpot
                    </a>
                  </div>
                )}
              </div>

              {/* Editable fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {editForm.status === 'Commission Approved' && selected.status !== 'Commission Approved' && selected.status !== 'Paid' && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> This will add ${editForm.commission_amount || 100} to the partner's commission balance.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Deal Value ($)</Label>
                    <Input type="number" value={editForm.deal_value} onChange={e => setEditForm(f => ({ ...f, deal_value: e.target.value }))} placeholder="e.g. 999" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Commission Amount ($)</Label>
                    <Input type="number" value={editForm.commission_amount} onChange={e => setEditForm(f => ({ ...f, commission_amount: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Stripe Payment Date (starts 90-day clock)</Label>
                  <Input type="date" value={editForm.stripe_payment_date} onChange={e => setEditForm(f => ({ ...f, stripe_payment_date: e.target.value }))} />
                  {editForm.stripe_payment_date && (
                    <p className="text-xs text-muted-foreground">
                      90-day eligible: <strong>{moment(editForm.stripe_payment_date).add(90, 'days').format('MMM D, YYYY')}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="pb-safe">
              <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}