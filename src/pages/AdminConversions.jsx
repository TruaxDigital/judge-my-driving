import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Plus, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const STATUS_COLORS = {
  pending: 'text-yellow-600 border-yellow-500/30 bg-yellow-500/5',
  paid: 'text-green-600 border-green-500/30 bg-green-500/5',
};

export default function AdminConversions() {
  const queryClient = useQueryClient();
  const [addDialog, setAddDialog] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [filterPartner, setFilterPartner] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [bulkPeriod, setBulkPeriod] = useState('');

  const [form, setForm] = useState({
    partner_id: '',
    customer_name: '',
    customer_email: '',
    subscription_type: 'individual',
    conversion_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => base44.entities.ReferralPartner.list('-created_date'),
  });

  const { data: conversions = [], isLoading } = useQuery({
    queryKey: ['admin-all-conversions'],
    queryFn: () => base44.entities.ReferralConversion.list('-created_date'),
  });

  // Fleet referrals that have reached Commission Approved will appear as ReferralConversion records
  // with subscription_type = 'fleet_referral' — they show up automatically in this list

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ReferralConversion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-conversions'] });
      setAddDialog(false);
      setForm({ partner_id: '', customer_name: '', customer_email: '', subscription_type: 'individual', conversion_date: new Date().toISOString().slice(0, 10), notes: '' });
    },
  });

  const commissionAmount = form.subscription_type === 'fleet_referral' ? 100 : 10;

  const handleAdd = () => {
    const partner = partners.find(p => p.id === form.partner_id);
    if (!partner) return;
    createMutation.mutate({
      ref_code: partner.ref_code,
      partner_id: form.partner_id,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      subscription_type: form.subscription_type,
      commission_amount: commissionAmount,
      commission_status: 'pending',
      conversion_date: form.conversion_date,
      notes: form.notes,
    });
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleMarkPaid = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await Promise.all(
      [...selected].map(id =>
        base44.entities.ReferralConversion.update(id, {
          commission_status: 'paid',
          paid_date: today,
          payout_period: bulkPeriod || undefined,
        })
      )
    );
    queryClient.invalidateQueries({ queryKey: ['admin-all-conversions'] });
    setSelected(new Set());
    setBulkPeriod('');
  };

  const filtered = conversions.filter(c => {
    if (filterPartner !== 'all' && c.partner_id !== filterPartner) return false;
    if (filterStatus !== 'all' && c.commission_status !== filterStatus) return false;
    const d = c.conversion_date || c.created_date?.slice(0, 10);
    if (filterStart && d < filterStart) return false;
    if (filterEnd && d > filterEnd) return false;
    return true;
  });

  const partnerName = (id) => partners.find(p => p.id === id)?.partner_name || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Conversions</h1>
          <p className="text-muted-foreground mt-1">{conversions.length} total conversions</p>
        </div>
        <Button onClick={() => setAddDialog(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Conversion
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
          <option value="all">All Partners</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.partner_name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="canceled">Canceled</option>
        </select>
        <Input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="w-auto" placeholder="Start date" />
        <Input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="w-auto" placeholder="End date" />
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <Input placeholder="Payout period label (e.g. Q2 2026)" value={bulkPeriod} onChange={e => setBulkPeriod(e.target.value)} className="w-56 h-8" />
          <Button size="sm" className="rounded-lg" onClick={handleMarkPaid}>
            <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Mark as Paid
          </Button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 w-8"></th>
              {['Date', 'Partner', 'Customer', 'Plan', 'Commission', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="cursor-pointer" />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{moment(c.conversion_date || c.created_date).format('MMM D, YYYY')}</td>
                <td className="px-4 py-3 font-medium">{partnerName(c.partner_id)}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.customer_name || '—'}</td>
                <td className="px-4 py-3 capitalize">{c.subscription_type}</td>
                <td className="px-4 py-3 font-semibold text-green-600">${c.commission_amount}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn('text-xs border', STATUS_COLORS[c.commission_status])}>{c.commission_status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">No conversions found.</div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Conversion</DialogTitle>
            <DialogDescription>Manually log a referral conversion.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Partner *</Label>
              <select value={form.partner_id} onChange={e => setForm(p => ({ ...p, partner_id: e.target.value }))}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="">Select partner...</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.partner_name} ({p.ref_code})</option>)}
              </select>
            </div>
            {[
              { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'Optional' },
              { key: 'customer_email', label: 'Customer Email', type: 'email', placeholder: 'Optional' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Subscription Type *</Label>
              <div className="flex gap-2">
                {['individual', 'family', 'fleet_referral'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({ ...p, subscription_type: t }))}
                    className={cn('flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all', form.subscription_type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-muted rounded-xl px-4 py-2 text-sm flex items-center justify-between">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-bold text-foreground">${commissionAmount}.00 {form.subscription_type === 'fleet_referral' ? '(fleet)' : '(standard)'}</span>
            </div>
            <div className="space-y-1">
              <Label>Conversion Date</Label>
              <Input type="date" value={form.conversion_date} onChange={e => setForm(p => ({ ...p, conversion_date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Notes (admin only)</Label>
              <Input placeholder="Optional" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.partner_id || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Conversion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}