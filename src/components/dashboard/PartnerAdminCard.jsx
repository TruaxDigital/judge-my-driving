import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import moment from 'moment';

export default function PartnerAdminCard() {
  const { data: partners = [] } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => base44.entities.ReferralPartner.list(),
  });

  const { data: conversions = [] } = useQuery({
    queryKey: ['admin-all-conversions'],
    queryFn: () => base44.entities.ReferralConversion.list(),
  });

  const activePartners = partners.filter(p => p.status === 'active').length;
  const missingW9 = partners.filter(p => !p.w9_file);
  const thisMonth = conversions.filter(c => moment(c.conversion_date || c.created_date).isSame(moment(), 'month')).length;
  const totalConversions = conversions.length;
  const unpaidTotal = conversions.filter(c => c.commission_status === 'pending').reduce((s, c) => s + (c.commission_amount || 10), 0);

  const ytdByPartner = {};
  for (const c of conversions) {
    if (moment(c.conversion_date || c.created_date).isSame(moment(), 'year')) {
      ytdByPartner[c.partner_id] = (ytdByPartner[c.partner_id] || 0) + (c.commission_amount || 10);
    }
  }
  const approaching600 = Object.entries(ytdByPartner).filter(([, ytd]) => ytd >= 500 && ytd < 600);

  // Top 5 this month
  const thisMonthConvs = conversions.filter(c => moment(c.conversion_date || c.created_date).isSame(moment(), 'month'));
  const partnerCounts = {};
  for (const c of thisMonthConvs) {
    partnerCounts[c.partner_id] = (partnerCounts[c.partner_id] || 0) + 1;
  }
  const top5 = Object.entries(partnerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ partner: partners.find(p => p.id === id), count }))
    .filter(e => e.partner);

  // Next report date
  const now = moment();
  const nextReportMonths = [4, 7, 10, 1];
  let nextReport = null;
  for (const month of nextReportMonths) {
    const candidate = moment().month(month - 1).date(1).startOf('day');
    if (candidate.isAfter(now)) { nextReport = candidate; break; }
    if (month === 1) nextReport = moment().add(1, 'year').month(0).date(1);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5 select-none">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Referral Partners
        </h2>
        <Link to="/AdminPartners" className="text-xs text-primary hover:underline">Manage →</Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Users, label: 'Active Partners', value: activePartners },
          { icon: TrendingUp, label: 'Conversions This Month', value: thisMonth },
          { icon: TrendingUp, label: 'All-Time Conversions', value: totalConversions },
          { icon: DollarSign, label: 'Unpaid Commissions', value: `$${unpaidTotal}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-muted/40 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-bold text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {nextReport && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          Next report: <span className="font-medium text-foreground">{nextReport.format('MMMM D, YYYY')}</span>
        </div>
      )}

      {missingW9.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm text-red-600 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{missingW9.length} partner{missingW9.length > 1 ? 's' : ''} missing W-9</p>
            <p className="text-xs mt-0.5 text-red-500/80">{missingW9.map(p => p.partner_name).join(', ')}</p>
          </div>
        </div>
      )}

      {approaching600.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-sm text-yellow-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {approaching600.length} partner{approaching600.length > 1 ? 's' : ''} approaching $600 1099 threshold
        </div>
      )}

      {top5.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-2">Top Partners This Month</p>
          <div className="space-y-1">
            {top5.map(({ partner, count }) => (
              <div key={partner.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{partner.partner_name}</span>
                <span className="text-muted-foreground">{count} conversion{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}