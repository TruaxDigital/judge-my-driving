import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Award, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import moment from 'moment';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function PartnerDashboard({ partner, user }) {
  const { data: conversions = [], isLoading } = useQuery({
    queryKey: ['partner-conversions', partner?.id],
    queryFn: () => base44.entities.ReferralConversion.filter({ partner_id: partner.id }, '-created_date'),
    enabled: !!partner?.id,
  });

  const totalAll = conversions.length;
  const thisMonth = conversions.filter(c => moment(c.conversion_date || c.created_date).isSame(moment(), 'month')).length;
  const totalEarned = conversions.reduce((s, c) => s + (c.commission_amount || 10), 0);
  const unpaid = conversions.filter(c => c.commission_status === 'pending').reduce((s, c) => s + (c.commission_amount || 10), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Partner'}
        </h1>
        {partner && (
          <p className="text-muted-foreground mt-1">
            {partner.partner_name} · Ref code: <span className="font-mono text-foreground">{partner.ref_code}</span>
          </p>
        )}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-3 text-sm text-foreground">
        You earn <strong>$10</strong> for every individual or family signup. Payouts are processed quarterly. Minimum payout: $25.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Referrals" value={totalAll} />
        <StatCard icon={Star} label="This Month" value={thisMonth} />
        <StatCard icon={Award} label="Total Earned" value={`$${totalEarned}`} />
        <StatCard icon={DollarSign} label="Unpaid Balance" value={`$${unpaid}`} sub={unpaid < 25 ? 'Below $25 min payout' : 'Ready for next payout'} />
      </div>

      {/* Conversion History */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">Conversion History</h2>
        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl h-32 animate-pulse" />
        ) : conversions.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
            No conversions yet. Share your referral links to start earning.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Commission</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {conversions.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      {moment(c.conversion_date || c.created_date).format('MMM D, YYYY')}
                    </td>
                    <td className="px-4 py-3 capitalize">{c.subscription_type}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">${c.commission_amount || 10}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-xs border', c.commission_status === 'paid' ? 'text-green-600 border-green-500/30 bg-green-500/5' : 'text-yellow-600 border-yellow-500/30 bg-yellow-500/5')}>
                        {c.commission_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}