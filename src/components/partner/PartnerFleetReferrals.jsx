import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Truck, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Shield, Star, FileText, Wrench } from 'lucide-react';
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

const FLEET_SIZE_OPTIONS = ['1-9 vehicles', '10-24 vehicles', '25-49 vehicles', '50+ vehicles'];

const SALES_POINTS = [
  {
    icon: Star,
    title: 'Community-powered feedback',
    body: 'QR stickers on every vehicle let anyone on the road rate your drivers in real time. It\'s the one data source no internal tool can give you — external perception from the people who share the road with your fleet.',
  },
  {
    icon: Shield,
    title: 'Insurance-ready safety reports',
    body: 'Professional Fleet plans generate exportable PDF reports: driver ratings, incident logs, corrective action records, fleet safety scores. Hand them to your broker at renewal to strengthen your negotiating position.',
  },
  {
    icon: Wrench,
    title: 'Zero hardware. 5-minute setup.',
    body: 'Weatherproof vinyl bumper stickers with QR codes. Peel and stick on each vehicle. No wiring, no technician visits, no software installs. From $999/year for 10 vehicles.',
  },
  {
    icon: FileText,
    title: 'Corrective action tracking',
    body: 'Safety concern reported? Get an alert. Open the dashboard, investigate, document your response. That timestamped paper trail is what insurance carriers and brokers look for.',
  },
];

const EMPTY_FORM = {
  contact_name: '', company_name: '', contact_email: '',
  contact_phone: '', estimated_fleet_size: '', notes: '',
};

export default function PartnerFleetReferrals({ partner }) {
  const queryClient = useQueryClient();
  const [salesKitOpen, setSalesKitOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['my-fleet-referrals', partner?.id],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.FleetReferral.filter({ partner_id: user.id }, '-created_date');
    },
    enabled: !!partner,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name || !form.company_name || !form.contact_email) {
      setError('Contact name, company name, and email are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    const res = await base44.functions.invoke('submitFleetReferral', {
      ...form,
      estimated_fleet_size: form.estimated_fleet_size || null,
    });
    if (res.data?.success) {
      setForm(EMPTY_FORM);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['my-fleet-referrals'] });
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      setError(res.data?.error || 'Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" /> Fleet Referrals
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Know a company that needs fleet driver monitoring? Submit their info and earn <strong>$100</strong> when the deal closes and stays active for 90 days.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-3 text-sm text-foreground space-y-1">
        <p><strong>How Fleet Referrals Work:</strong> Submit a fleet lead below. JMD's sales team takes it from there. You earn $100 when the deal closes and the fleet stays active for 90 days. You cannot edit or delete a referral once submitted.</p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Submit a Fleet Lead</h3>
        {submitted ? (
          <div className="flex items-center gap-3 text-green-600 py-4">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Fleet referral submitted! We'll keep you updated on the status.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Contact Name *</Label>
                <Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Company Name *</Label>
                <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Acme Logistics" />
              </div>
              <div className="space-y-1.5">
                <Label>Contact Email *</Label>
                <Input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="jane@acme.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone (optional)</Label>
                <Input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="(555) 555-5555" />
              </div>
              <div className="space-y-1.5">
                <Label>Estimated Fleet Size (optional)</Label>
                <Select value={form.estimated_fleet_size} onValueChange={val => set('estimated_fleet_size', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fleet size" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLEET_SIZE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any context about this prospect..."
                rows={3}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <Button type="submit" className="rounded-xl" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Fleet Referral
            </Button>
          </form>
        )}
      </div>

      {/* Referrals Table */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Your Submitted Referrals</h3>
        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl h-24 animate-pulse" />
        ) : referrals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
            No fleet referrals submitted yet.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Date', 'Company', 'Contact', 'Fleet Size', 'Status', 'Commission'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {referrals.map(r => (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {moment(r.submitted_date || r.created_date).format('MMM D, YYYY')}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{r.company_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.contact_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.estimated_fleet_size || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('text-xs border whitespace-nowrap', STATUS_COLORS[r.status] || '')}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {['Commission Approved', 'Paid'].includes(r.status)
                          ? <span className="text-green-600">${r.commission_amount || 100}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fleet Sales Kit */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setSalesKitOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="font-semibold text-foreground text-sm">Fleet Sales Kit</p>
              <p className="text-xs text-muted-foreground">Talking points to help you pitch JMD to fleet prospects</p>
            </div>
          </div>
          {salesKitOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {salesKitOpen && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <p className="text-xs text-muted-foreground">
              When talking to a fleet prospect, focus on these core value drivers. They care about insurance savings, driver accountability, and operational reputation. Use <a href="/fleet-drivers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">judgemydriving.com/fleet-drivers</a> as your landing page.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SALES_POINTS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <p className="font-semibold text-sm text-foreground">{title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-foreground mb-1">The math that closes deals:</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A 10-vehicle fleet paying $25,000/yr in commercial auto insurance saves $1,250 with just a 5% premium reduction. JMD Starter Fleet is $999/yr. That's a <strong className="text-foreground">net-negative cost</strong> — JMD pays for itself if it helps at renewal. Use this framing with any prospect who mentions insurance.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Full fleet landing page: <a href="/fleet-drivers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">judgemydriving.com/fleet-drivers</a>
              {' '}· Share this link with prospects to let JMD's sales page do the heavy lifting.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Questions? <a href="mailto:partners@judgemydriving.com" className="text-primary hover:underline">partners@judgemydriving.com</a>
        {' '}· Payouts are processed quarterly. Minimum payout: $25.
      </p>
    </div>
  );
}