import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const PLAN_OPTIONS = ['Individual', 'Family', 'Starter Fleet', 'Professional Fleet', 'Enterprise Fleet'];
const ISSUE_OPTIONS = ['Sticker / Shipping', 'Account & Billing', 'Dashboard / App Issue', 'Feedback Not Received', 'Other'];

export default function EscalateDialog({ open, onClose, user }) {
  const [form, setForm] = useState({ name: '', email: '', planType: '', issueType: '', message: '' });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [open, user]);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: typeof e === 'string' ? e : e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.planType) e.planType = 'Required';
    if (!form.issueType) e.issueType = 'Required';
    if (!form.message.trim() || form.message.trim().length < 20) e.message = 'At least 20 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStatus('loading');
    const res = await base44.functions.invoke('createSupportTicket', form);
    setStatus(res.data?.success ? 'success' : 'error');
  };

  const handleClose = () => {
    if (status === 'success') {
      setForm({ name: '', email: '', planType: '', issueType: '', message: '' });
      setStatus(null);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Support Ticket</DialogTitle>
          <DialogDescription>We typically respond within 1 business day.</DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
            <p className="font-semibold text-foreground">Ticket submitted!</p>
            <p className="text-sm text-muted-foreground">We'll get back to you within 1 business day.</p>
            <Button className="w-full rounded-xl mt-2" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {status === 'error' && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Something went wrong. Email us at <a href="mailto:hello@judgemydriving.com" className="underline font-medium">hello@judgemydriving.com</a>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Your name" value={form.name} onChange={set('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Plan <span className="text-destructive">*</span></Label>
                <Select value={form.planType} onValueChange={set('planType')}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>{PLAN_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                {errors.planType && <p className="text-xs text-destructive">{errors.planType}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Issue Type <span className="text-destructive">*</span></Label>
                <Select value={form.issueType} onValueChange={set('issueType')}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{ISSUE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
                {errors.issueType && <p className="text-xs text-destructive">{errors.issueType}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Describe your issue in detail."
                className="min-h-[100px] resize-none"
                value={form.message}
                onChange={set('message')}
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={status === 'loading'}>
              {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending…</> : 'Submit Ticket'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}