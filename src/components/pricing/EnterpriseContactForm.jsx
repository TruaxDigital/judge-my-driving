import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnterpriseContactForm({ open, onClose }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', company: '', fleetSize: '', email: '', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.company) {
      setError('Please fill in all required fields.');
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
    setForm({ firstName: '', lastName: '', company: '', fleetSize: '', email: '', phone: '' });
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Enterprise Sales</DialogTitle>
          <DialogDescription>Tell us about your fleet and we'll be in touch shortly.</DialogDescription>
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
            <div className="space-y-1.5">
              <Label>Fleet Size</Label>
              <Input placeholder="e.g. 75 vehicles" value={form.fleetSize} onChange={set('fleetSize')} />
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Message
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}