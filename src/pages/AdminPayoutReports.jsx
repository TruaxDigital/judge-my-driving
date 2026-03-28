import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Download, FileBarChart, AlertTriangle, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function AdminPayoutReports() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [newReportDialog, setNewReportDialog] = useState(false);
  const [newForm, setNewForm] = useState({ period_start: '', period_end: '', quarter_label: '' });
  const [activeReport, setActiveReport] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(null);

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['payout-reports'],
    queryFn: () => base44.entities.PayoutReport.list('-created_date'),
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => base44.entities.ReferralPartner.list(),
  });

  const { data: allConversions = [] } = useQuery({
    queryKey: ['admin-all-conversions'],
    queryFn: () => base44.entities.ReferralConversion.list(),
  });

  const handleGenerateReport = async () => {
    setGenerating(true);
    await base44.functions.invoke('generatePayoutReport', {
      period_start: newForm.period_start,
      period_end: newForm.period_end,
      quarter_label: newForm.quarter_label,
      is_manual: true,
    });
    queryClient.invalidateQueries({ queryKey: ['payout-reports'] });
    setNewReportDialog(false);
    setGenerating(false);
  };

  const getReportData = (report) => {
    if (!report) return { rows: [], carried: [] };

    const periodConversions = allConversions.filter(c => {
      const d = c.conversion_date || c.created_date?.slice(0, 10);
      return d >= report.period_start && d <= report.period_end && c.commission_status === 'pending';
    });

    const partnerMap = {};
    for (const c of periodConversions) {
      if (!partnerMap[c.partner_id]) partnerMap[c.partner_id] = [];
      partnerMap[c.partner_id].push(c);
    }

    const ytdEarned = (partnerId) => allConversions
      .filter(c => c.partner_id === partnerId && moment(c.conversion_date || c.created_date).isSame(moment(), 'year'))
      .reduce((s, c) => s + (c.commission_amount || 10), 0);

    const rows = [], carried = [];

    for (const [partnerId, convs] of Object.entries(partnerMap)) {
      const partner = partners.find(p => p.id === partnerId);
      if (!partner) continue;
      const amount = convs.reduce((s, c) => s + (c.commission_amount || 10), 0);
      const ytd = ytdEarned(partnerId);
      const entry = { partner, convs, amount, ytd, referrals: convs.length };
      if (amount >= 25) rows.push(entry);
      else carried.push(entry);
    }

    return { rows, carried };
  };

  const handleConfirmPayment = async (partnerId) => {
    if (!activeReport) return;
    setConfirmingPayment(partnerId);
    await base44.functions.invoke('confirmPartnerPayment', {
      partner_id: partnerId,
      period_start: activeReport.period_start,
      period_end: activeReport.period_end,
      quarter_label: activeReport.quarter_label,
      report_id: activeReport.id,
    });
    queryClient.invalidateQueries({ queryKey: ['admin-all-conversions'] });
    queryClient.invalidateQueries({ queryKey: ['payout-reports'] });
    setConfirmingPayment(null);
  };

  const handleMarkAllPaid = async (rows) => {
    if (!activeReport) return;
    for (const row of rows) {
      await handleConfirmPayment(row.partner.id);
    }
    await base44.entities.PayoutReport.update(activeReport.id, { status: 'confirmed' });
    queryClient.invalidateQueries({ queryKey: ['payout-reports'] });
  };

  const exportCSV = (rows) => {
    const headers = ['Partner Name', 'Ref Code', 'Referrals', 'Amount Owed', 'Payout Method', 'Payout Details', 'W-9 Status', 'YTD Total', '1099 Flag'];
    const csvRows = rows.map(r => [
      r.partner.partner_name,
      r.partner.ref_code,
      r.referrals,
      r.amount,
      r.partner.payout_method || '',
      r.partner.payout_details || '',
      r.partner.w9_file ? 'Uploaded' : 'Missing',
      r.ytd,
      r.ytd >= 600 ? '1099-NEC REQUIRED' : '',
    ]);
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-report-${activeReport?.quarter_label || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const export1099 = (rows) => {
    const flagged = rows.filter(r => r.ytd >= 600);
    const headers = ['Partner Name', 'Contact Name', 'Contact Email', 'Payout Details', 'YTD Total'];
    const csvRows = flagged.map(r => [r.partner.partner_name, r.partner.contact_name, r.partner.contact_email, r.partner.payout_details || '', r.ytd]);
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1099-list-${activeReport?.quarter_label || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { rows: reportRows, carried: carriedRows } = getReportData(activeReport);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileBarChart className="w-7 h-7 text-primary" /> Payout Reports
          </h1>
          <p className="text-muted-foreground mt-1">Auto-generated quarterly. Manually confirm payments after sending.</p>
        </div>
        <Button onClick={() => setNewReportDialog(true)} className="rounded-xl">
          Generate Report
        </Button>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reportsLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-card border border-border rounded-2xl h-16 animate-pulse" />)
        ) : reports.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-sm">
            No payout reports yet. Reports auto-generate on April 1, July 1, October 1, and January 1.
          </div>
        ) : (
          reports.map(r => (
            <div key={r.id} className={cn('bg-card border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/20 transition-colors', activeReport?.id === r.id ? 'border-primary/40' : 'border-border')}
              onClick={() => setActiveReport(r.id === activeReport?.id ? null : r)}>
              <div>
                <p className="font-semibold text-foreground">{r.quarter_label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.date_range_label} · Generated {moment(r.generated_at).format('MMM D, YYYY')}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="font-bold text-foreground">${r.total_amount || 0}</p>
                  <p className="text-xs text-muted-foreground">{r.total_partners || 0} partners</p>
                </div>
                <Badge variant="outline" className={cn('text-xs border', r.status === 'confirmed' ? 'text-green-600 border-green-500/30 bg-green-500/5' : 'text-yellow-600 border-yellow-500/30 bg-yellow-500/5')}>
                  {r.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active Report Detail */}
      {activeReport && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Report Period', value: activeReport.date_range_label },
              { label: 'Partners Owed', value: reportRows.length },
              { label: 'Total Payout', value: `$${reportRows.reduce((s, r) => s + r.amount, 0)}` },
              { label: 'Missing W-9', value: reportRows.filter(r => !r.partner.w9_file).length },
            ].map(s => (
              <div key={s.label} className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-bold text-foreground mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Export buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => exportCSV(reportRows)}>
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </Button>
            {reportRows.some(r => r.ytd >= 600) && (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => export1099(reportRows)}>
                <Download className="w-4 h-4 mr-2" /> Download 1099 List
              </Button>
            )}
            {activeReport.status !== 'confirmed' && reportRows.length > 0 && (
              <Button size="sm" className="rounded-xl" onClick={() => handleMarkAllPaid(reportRows)}>
                <CheckSquare className="w-4 h-4 mr-2" /> Mark All as Paid
              </Button>
            )}
          </div>

          {/* Payout Table */}
          {reportRows.length > 0 ? (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Partners to Pay (≥ $25)</h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {['Partner', 'Ref Code', 'Referrals', 'Amount', 'Payout Method', 'Payout Details', 'W-9', 'YTD', 'Flag', 'Confirm'].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-muted-foreground font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reportRows.map(row => (
                      <tr key={row.partner.id} className={cn('hover:bg-muted/20', !row.partner.w9_file && 'bg-red-500/5')}>
                        <td className="px-3 py-2 font-medium text-foreground">{row.partner.partner_name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{row.partner.ref_code}</td>
                        <td className="px-3 py-2">{row.referrals}</td>
                        <td className="px-3 py-2 font-bold text-green-600">${row.amount}</td>
                        <td className="px-3 py-2 capitalize">{row.partner.payout_method || '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.partner.payout_details || '—'}</td>
                        <td className="px-3 py-2">
                          {row.partner.w9_file
                            ? <span className="text-green-600 text-xs">✓</span>
                            : <span className="text-red-500 text-xs font-semibold">Missing</span>}
                        </td>
                        <td className="px-3 py-2">${row.ytd}</td>
                        <td className="px-3 py-2">
                          {row.ytd >= 600 && <span className="text-red-500 text-xs font-bold">1099-NEC</span>}
                        </td>
                        <td className="px-3 py-2">
                          {activeReport.status !== 'confirmed' ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg"
                              onClick={() => handleConfirmPayment(row.partner.id)}
                              disabled={confirmingPayment === row.partner.id}>
                              {confirmingPayment === row.partner.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                            </Button>
                          ) : (
                            <span className="text-green-600 text-xs font-medium">✓ Paid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No partners with ≥$25 pending in this period.</p>
          )}

          {/* Carried Forward */}
          {carriedRows.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Carried Forward (&lt; $25)</h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {['Partner', 'Ref Code', 'Referrals This Period', 'Balance'].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-muted-foreground font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {carriedRows.map(row => (
                      <tr key={row.partner.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium text-foreground">{row.partner.partner_name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{row.partner.ref_code}</td>
                        <td className="px-3 py-2">{row.referrals}</td>
                        <td className="px-3 py-2 text-muted-foreground">${row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Report Dialog */}
      <Dialog open={newReportDialog} onOpenChange={setNewReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Payout Report</DialogTitle>
            <DialogDescription>Select a date range and label for this report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Quarter / Report Label (e.g. Q1 2026)</Label>
              <Input placeholder="Q1 2026" value={newForm.quarter_label} onChange={e => setNewForm(p => ({ ...p, quarter_label: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Period Start</Label>
                <Input type="date" value={newForm.period_start} onChange={e => setNewForm(p => ({ ...p, period_start: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Period End</Label>
                <Input type="date" value={newForm.period_end} onChange={e => setNewForm(p => ({ ...p, period_end: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewReportDialog(false)}>Cancel</Button>
            <Button onClick={handleGenerateReport} disabled={!newForm.quarter_label || !newForm.period_start || !newForm.period_end || generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}