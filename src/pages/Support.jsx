import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const PLAN_OPTIONS = [
  'Individual',
  'Family',
  'Starter Fleet',
  'Professional Fleet',
  'Enterprise Fleet',
];

const ISSUE_OPTIONS = [
  'Sticker / Shipping',
  'Account & Billing',
  'Dashboard / App Issue',
  'Feedback Not Received',
  'Other',
];

export default function Support() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    planType: '',
    issueType: '',
    message: '',
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errors, setErrors] = useState({});

  // Sync email once user loads
  React.useEffect(() => {
    if (user?.email && !form.email) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.planType) e.planType = 'Please select a plan type';
    if (!form.issueType) e.issueType = 'Please select an issue type';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus('loading');

    try {
      const res = await base44.functions.invoke('createSupportTicket', form);
      if (res.data?.success) {
        setStatus('success');
        setForm({ name: '', email: user?.email || '', planType: '', issueType: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: typeof e === 'string' ? e : e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Get Help</h1>
        <p className="text-muted-foreground mt-1">We typically respond within 1 business day.</p>
      </div>

      {status === 'success' && (
        <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 font-medium">Your message was sent. We'll be in touch within 1 business day.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">
            Something went wrong. Please email us directly at{' '}
            <a href="mailto:support@judgemydriving.com" className="underline font-medium">support@judgemydriving.com</a>.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label>Name <span className="text-destructive">*</span></Label>
          <Input placeholder="Your full name" value={form.name} onChange={set('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label>Email <span className="text-destructive">*</span></Label>
          <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Plan Type */}
        <div className="space-y-1.5">
          <Label>Plan Type <span className="text-destructive">*</span></Label>
          <Select value={form.planType} onValueChange={set('planType')}>
            <SelectTrigger><SelectValue placeholder="Select your plan" /></SelectTrigger>
            <SelectContent>
              {PLAN_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.planType && <p className="text-xs text-destructive">{errors.planType}</p>}
        </div>

        {/* Issue Type */}
        <div className="space-y-1.5">
          <Label>Issue Type <span className="text-destructive">*</span></Label>
          <Select value={form.issueType} onValueChange={set('issueType')}>
            <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
            <SelectContent>
              {ISSUE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.issueType && <p className="text-xs text-destructive">{errors.issueType}</p>}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label>Message <span className="text-destructive">*</span></Label>
          <Textarea
            placeholder="Describe your issue and we'll get back to you shortly."
            className="min-h-[120px] resize-none"
            value={form.message}
            onChange={set('message')}
          />
          <div className="flex justify-between">
            {errors.message
              ? <p className="text-xs text-destructive">{errors.message}</p>
              : <span />}
            <p className="text-xs text-muted-foreground ml-auto">{form.message.length} chars</p>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={status === 'loading'}>
          {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}