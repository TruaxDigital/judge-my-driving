import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Download, Copy, Check, RefreshCw, Eye, FileText, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const CHANNEL_LABELS = {
  driving_school: 'Driving School', pta: 'PTA', insurance: 'Insurance',
  dealership: 'Dealership', event: 'Event', influencer: 'Influencer', other: 'Other',
};

const STATUS_COLORS = {
  active: 'text-green-600 border-green-500/30 bg-green-500/5',
  paused: 'text-yellow-600 border-yellow-500/30 bg-yellow-500/5',
  inactive: 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5',
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded text-muted-foreground hover:text-primary transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function PartnerDetailDialog({ partner, conversions, onClose, onRefCodeUpdate }) {
  const queryClient = useQueryClient();
  const [editingRefCode, setEditingRefCode] = useState(false);
  const [newRefCode, setNewRefCode] = useState(partner.ref_code);
  const [regenerating, setRegenerating] = useState(false);
  const [notes, setNotes] = useState(partner.notes || '');

  const ytdEarned = conversions
    .filter(c => moment(c.conversion_date || c.created_date).isSame(moment(), 'year'))
    .reduce((s, c) => s + (c.commission_amount || 10), 0);

  const totalEarned = conversions.reduce((s, c) => s + (c.commission_amount || 10), 0);
  const unpaid = conversions.filter(c => c.commission_status === 'pending').reduce((s, c) => s + (c.commission_amount || 10), 0);

  const handleSaveRefCode = async () => {
    if (!newRefCode.trim()) return;
    setRegenerating(true);
    await base44.functions.invoke('regeneratePartnerQR', { partner_id: partner.id, ref_code: newRefCode.trim() });
    queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
    onRefCodeUpdate && onRefCodeUpdate();
    setEditingRefCode(false);
    setRegenerating(false);
  };

  const handleSaveNotes = async () => {
    await base44.entities.ReferralPartner.update(partner.id, { notes });
    queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
  };

  const handleStatusChange = async (status) => {
    await base44.entities.ReferralPartner.update(partner.id, { status });
    queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{partner.partner_name}</DialogTitle>
        <DialogDescription>{CHANNEL_LABELS[partner.channel_type]} · {partner.location || 'No location'}</DialogDescription>
      </DialogHeader>

      <div className="space-y-5 py-2">
        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Status:</span>
          {['active', 'paused', 'inactive'].map(s => (
            <button key={s} onClick={() => handleStatusChange(s)}
              className={cn('px-3 py-1 rounded-lg text-xs font-medium border capitalize transition-all', partner.status === s ? STATUS_COLORS[s] : 'border-border text-muted-foreground hover:bg-muted')}>
              {s}
            </button>
          ))}
        </div>

        {/* Ref Code */}
        <div className="bg-muted rounded-xl p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Ref Code</p>
          <div className="flex items-center gap-2">
            {editingRefCode ? (
              <>
                <Input value={newRefCode} onChange={e => setNewRefCode(e.target.value)} className="h-8 text-sm font-mono" />
                <Button size="sm" onClick={handleSaveRefCode} disabled={regenerating}>
                  {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save & Regen QR'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingRefCode(false)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="font-mono text-foreground font-semibold">{partner.ref_code}</span>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingRefCode(true)}>Edit</Button>
              </>
            )}
          </div>
        </div>

        {/* QR Codes */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Teen Driver QR', url: partner.teen_qr_url, ref: `student-drivers` },
            { label: 'Senior Driver QR', url: partner.senior_qr_url, ref: `senior-drivers` },
          ].map(({ label, url, ref }) => (
            <div key={label} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              {url ? (
                <img src={url} alt={label} className="w-full rounded-xl border border-border" />
              ) : (
                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Not yet generated</p>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs bg-muted rounded px-2 py-1 font-mono truncate">
                <span className="flex-1 truncate">.../{ref}?ref={partner.ref_code}</span>
                <CopyButton text={`https://app.judgemydriving.com/${ref}?ref=${partner.ref_code}`} />
              </div>
              {url && (
                <a href={url} download target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full text-xs h-7">
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Contact + Payout */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Contact</p>
            <p className="text-foreground font-medium">{partner.contact_name}</p>
            <p className="text-muted-foreground">{partner.contact_email}</p>
            {partner.contact_phone && <p className="text-muted-foreground">{partner.contact_phone}</p>}
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Payout</p>
            <p className="text-foreground font-medium capitalize">{partner.payout_method || '—'}</p>
            <p className="text-muted-foreground">{partner.payout_details || '—'}</p>
          </div>
        </div>

        {/* W-9 */}
        <div className="flex items-center gap-3 text-sm">
          <p className="text-muted-foreground">W-9:</p>
          {partner.w9_file ? (
            <a href={partner.w9_file} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> View W-9
            </a>
          ) : (
            <span className="text-red-500 font-medium">Not uploaded</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{conversions.length}</p>
            <p className="text-xs text-muted-foreground">Total referrals</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">${totalEarned}</p>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">${unpaid}</p>
            <p className="text-xs text-muted-foreground">Unpaid balance</p>
          </div>
        </div>

        {ytdEarned >= 600 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 1099-NEC REQUIRED — YTD: ${ytdEarned}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Admin Notes (not visible to partner)</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            rows={3}
            className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Internal notes..."
          />
        </div>

        {/* Conversion history */}
        {conversions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Conversion History</p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left px-3 py-2 text-muted-foreground">Date</th>
                    <th className="text-left px-3 py-2 text-muted-foreground">Plan</th>
                    <th className="text-left px-3 py-2 text-muted-foreground">Commission</th>
                    <th className="text-left px-3 py-2 text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {conversions.map(c => (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2">{moment(c.conversion_date || c.created_date).format('MMM D, YYYY')}</td>
                      <td className="px-3 py-2 capitalize">{c.subscription_type}</td>
                      <td className="px-3 py-2 text-green-600 font-semibold">${c.commission_amount}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn('text-xs border', c.commission_status === 'paid' ? 'text-green-600 border-green-500/30' : 'text-yellow-600 border-yellow-500/30')}>
                          {c.commission_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default function AdminPartners() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterW9, setFilterW9] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => base44.entities.ReferralPartner.list('-created_date'),
  });

  const { data: allConversions = [] } = useQuery({
    queryKey: ['admin-all-conversions'],
    queryFn: () => base44.entities.ReferralConversion.list('-created_date'),
  });

  const filtered = partners.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterChannel !== 'all' && p.channel_type !== filterChannel) return false;
    if (filterW9 === 'uploaded' && !p.w9_file) return false;
    if (filterW9 === 'missing' && p.w9_file) return false;
    if (search) {
      const s = search.toLowerCase();
      return (p.partner_name || '').toLowerCase().includes(s) || (p.ref_code || '').toLowerCase().includes(s);
    }
    return true;
  });

  const getPartnerConversions = (partnerId) => allConversions.filter(c => c.partner_id === partnerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Partner Management
          </h1>
          <p className="text-muted-foreground mt-1">{partners.length} total partners</p>
        </div>
        <a href="/partner-signup" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="rounded-xl">Share Signup Link</Button>
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or ref code" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
        </div>
        {[
          { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: ['all', 'active', 'paused', 'inactive'] },
          { label: 'Channel', value: filterChannel, onChange: setFilterChannel, options: ['all', ...Object.keys(CHANNEL_LABELS)] },
          { label: 'W-9', value: filterW9, onChange: setFilterW9, options: ['all', 'uploaded', 'missing'] },
        ].map(({ label, value, onChange, options }) => (
          <select key={label} value={value} onChange={e => onChange(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            {options.map(o => (
              <option key={o} value={o}>{o === 'all' ? `All ${label}s` : (CHANNEL_LABELS[o] || o.charAt(0).toUpperCase() + o.slice(1))}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-card border border-border rounded-2xl h-14 animate-pulse" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Partner Name', 'Channel', 'Location', 'Ref Code', 'Status', 'Referrals', 'Unpaid', 'W-9'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => {
                const convs = getPartnerConversions(p.id);
                const unpaid = convs.filter(c => c.commission_status === 'pending').reduce((s, c) => s + (c.commission_amount || 10), 0);
                return (
                  <tr key={p.id} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setSelectedPartner(p)}>
                    <td className="px-4 py-3 font-medium text-foreground">{p.partner_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{CHANNEL_LABELS[p.channel_type] || p.channel_type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.location || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.ref_code}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-xs border capitalize', STATUS_COLORS[p.status])}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3">{convs.length}</td>
                    <td className="px-4 py-3 font-semibold">{unpaid > 0 ? `$${unpaid}` : '—'}</td>
                    <td className="px-4 py-3">
                      {p.w9_file
                        ? <span className="text-green-600 text-xs font-medium">✓ Uploaded</span>
                        : <span className="text-red-500 text-xs font-medium">Missing</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm">No partners found.</div>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={open => { if (!open) setSelectedPartner(null); }}>
        {selectedPartner && (
          <PartnerDetailDialog
            partner={selectedPartner}
            conversions={getPartnerConversions(selectedPartner.id)}
            onClose={() => setSelectedPartner(null)}
            onRefCodeUpdate={() => setSelectedPartner(null)}
          />
        )}
      </Dialog>
    </div>
  );
}