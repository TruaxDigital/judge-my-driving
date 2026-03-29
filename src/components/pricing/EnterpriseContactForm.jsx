import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FLEET_SIZE_OPTIONS = [
  { label: '1–9 vehicles', value: '1-9' },
  { label: '10–24 vehicles', value: '10-24' },
  { label: '25–49 vehicles', value: '25-49' },
  { label: '50+ vehicles', value: '50+' },
];

const INDUSTRY_OPTIONS = [
  { label: 'HVAC', value: 'hvac' },
  { label: 'Plumbing', value: 'plumbing' },
  { label: 'Electrical', value: 'electrical' },
  { label: 'Landscaping', value: 'landscaping' },
  { label: 'Delivery / Courier', value: 'delivery' },
  { label: 'Property Management', value: 'property-mgmt' },
  { label: 'Pest Control', value: 'pest-control' },
  { label: 'Cleaning Services', value: 'cleaning' },
  { label: 'Construction', value: 'construction' },
  { label: 'Towing', value: 'towing' },
  { label: 'Mobile Healthcare', value: 'healthcare' },
  { label: 'Waste Management', value: 'waste-mgmt' },
  { label: 'Other', value: 'other' },
];

const EMPTY_FORM = {
  inquiryType: 'demo',
  firstName: '',
  lastName: '',
  company: '',
  fleetSize: '',
  industry: '',
  email: '',
  phone: '',
  planContext: '',
};

export default function EnterpriseContactForm({ open, onClose, planName }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill plan context when opened from a specific plan
  useEffect(() => {
    if (open) {
      setForm(prev => ({ ...prev, planContext: planName || '' }));
    }
  }, [open, planName]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.company || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.fleetSize) {
      setError('Please select your fleet size.');
      return;
    }
    if (!form.industry) {
      setError('Please select your industry.');
      return;
    }
    const digitsOnly = form.phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('submitEnterpriseLead', form);
    if (res.data?.success) {
      setSuccess(true);
    } else {
      setError(res.data?.error || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setSuccess(false);
    setError('');
    onClose();
  };

  const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {planName ? `Contact Sales – ${planName}` : 'Contact Sales'}
          </DialogTitle>
          <DialogDescription>
            Tell us about your fleet and we'll be in touch within 1 business day.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-foreground text-lg">We'll be in touch!</p>
            <p className="text-sm text-muted-foreground">Thanks! A member of our team will reach out to you within 1 business day.</p>
            <Button className="mt-2 rounded-xl w-full" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">

            {/* Inquiry type toggle */}
            <div className="space-y-1.5">
              <Label>I'm interested in <span className="text-destructive">*</span></Label>
              <div className="flex rounded-xl border border-input overflow-hidden">
                {[
                  { value: 'demo', label: 'Request a Demo' },
                  { value: 'sales', label: 'Sales Inquiry' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, inquiryType: opt.value }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      form.inquiryType === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Jane" value={form.firstName} onChange={set('firstName')} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Smith" value={form.lastName} onChange={set('lastName')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Company <span className="text-destructive">*</span></Label>
              <Input placeholder="Acme Logistics" value={form.company} onChange={set('company')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fleet Size <span className="text-destructive">*</span></Label>
                <select className={selectClass} value={form.fleetSize} onChange={set('fleetSize')}>
                  <option value="">Select size…</option>
                  {FLEET_SIZE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Industry <span className="text-destructive">*</span></Label>
                <select className={selectClass} value={form.industry} onChange={set('industry')}>
                  <option value="">Select industry…</option>
                  {INDUSTRY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} />
            </div>

            <div className="space-y-1.5">
              <Label>Phone <span className="text-destructive">*</span></Label>
              <Input type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              {form.inquiryType === 'demo' ? 'Request a Demo' : 'Send Inquiry'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}