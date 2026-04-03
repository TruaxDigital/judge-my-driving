import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'user', label: 'User', desc: 'Standard account — can manage their own stickers.' },
  { value: 'fleet_admin', label: 'Fleet Admin', desc: 'Access to fleet dashboard and driver management.' },
  { value: 'partner', label: 'Partner', desc: 'Referral partner portal access only.' },
  { value: 'admin', label: 'Admin', desc: 'Full admin access to all panels.' },
];

export default function InviteUserDialog({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await base44.users.inviteUser(email.trim(), role);
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setRole('user');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>Send an email invitation to join the platform.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="space-y-2">
              {ROLES.map(r => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${role === r.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-0.5 accent-yellow-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInvite} disabled={loading || !email.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}