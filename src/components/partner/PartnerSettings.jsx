import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAYOUT_OPTIONS = [
  { value: 'venmo', label: 'Venmo', detailLabel: 'Venmo username' },
  { value: 'paypal', label: 'PayPal', detailLabel: 'PayPal email' },
  { value: 'eft', label: 'EFT (Bank Transfer)', detailLabel: 'Bank routing and account number' },
];

export default function PartnerSettings({ partner, user, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [w9Loading, setW9Loading] = useState(false);
  const [form, setForm] = useState({
    contact_name: partner?.contact_name || '',
    contact_email: partner?.contact_email || '',
    contact_phone: partner?.contact_phone || '',
    payout_method: partner?.payout_method || 'venmo',
    payout_details: partner?.payout_details || '',
  });

  const payoutOption = PAYOUT_OPTIONS.find(p => p.value === form.payout_method);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.ReferralPartner.update(partner.id, {
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      payout_method: form.payout_method,
      payout_details: form.payout_details,
    });
    setSaving(false);
    setSaved(true);
    onUpdate && onUpdate();
    setTimeout(() => setSaved(false), 3000);
  };

  const handleW9Upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setW9Loading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ReferralPartner.update(partner.id, {
      w9_file: file_url,
      w9_uploaded_at: new Date().toISOString(),
    });
    setW9Loading(false);
    onUpdate && onUpdate();
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Update your contact and payout information.</p>
      </div>

      {/* Ref code (read-only) */}
      <div className="bg-muted rounded-xl px-4 py-3 space-y-1">
        <p className="text-xs text-muted-foreground">Your Referral Code (read-only)</p>
        <p className="font-mono font-semibold text-foreground">{partner?.ref_code}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Contact Information</h2>

        <div className="space-y-1">
          <Label>Contact Name</Label>
          <Input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Contact Email</Label>
          <Input type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Contact Phone</Label>
          <Input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Payout Settings</h2>

        <div className="space-y-2">
          <Label>Payout Method</Label>
          <div className="flex gap-2">
            {PAYOUT_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, payout_method: o.value }))}
                className={cn(
                  'flex-1 py-2 rounded-xl border text-sm font-medium transition-all',
                  form.payout_method === o.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/80'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {payoutOption && (
          <div className="space-y-1">
            <Label>{payoutOption.detailLabel}</Label>
            <Input value={form.payout_details} onChange={e => setForm(p => ({ ...p, payout_details: e.target.value }))} placeholder={payoutOption.detailLabel} />
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">W-9 Form</h2>
        {partner?.w9_file ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-foreground">W-9 uploaded</p>
              {partner.w9_uploaded_at && <p className="text-xs text-muted-foreground">{new Date(partner.w9_uploaded_at).toLocaleDateString()}</p>}
            </div>
            <a href={partner.w9_file} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-primary underline flex items-center gap-1">
              <FileText className="w-3 h-3" /> View
            </a>
          </div>
        ) : (
          <p className="text-sm text-yellow-600 font-medium">W-9 not yet uploaded — required before payouts.</p>
        )}

        <label className={cn('cursor-pointer flex items-center gap-2 text-sm font-medium border border-border rounded-xl px-4 py-2.5 hover:bg-muted transition-colors w-fit', w9Loading && 'opacity-50 pointer-events-none')}>
          {w9Loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {partner?.w9_file ? 'Replace W-9' : 'Upload W-9'}
          <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleW9Upload} disabled={w9Loading} />
        </label>
      </div>

      <Button onClick={handleSave} disabled={saving} className="rounded-xl">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {saved ? '✓ Saved!' : 'Save Changes'}
      </Button>
    </div>
  );
}