import React from 'react';
import { Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const features = [
  'Group vehicles by route, team, or department',
  'Assign named drivers to each sticker',
  'Fleet-wide safety flag monitoring',
  'Bulk activate / deactivate vehicles',
  'Per-group analytics and reporting',
];

export default function FleetUpgradeBanner() {
  const queryClient = useQueryClient();

  const upgradeMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({ plan: 'fleet' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });

  return (
    <div className="max-w-lg mx-auto py-16 space-y-8 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
        <Truck className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Fleet Tools</h1>
        <p className="text-muted-foreground">
          Manage multiple vehicles, assign drivers, and monitor your entire fleet's driving feedback from one place.
        </p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-3">
        {features.map(f => (
          <div key={f} className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm text-foreground">{f}</span>
          </div>
        ))}
      </div>
      <Button
        className="w-full h-12 rounded-xl font-semibold"
        onClick={() => upgradeMutation.mutate()}
        disabled={upgradeMutation.isPending}
      >
        {upgradeMutation.isPending ? 'Upgrading...' : 'Upgrade to Fleet — Free During Beta'}
      </Button>
      <p className="text-xs text-muted-foreground">You can downgrade anytime from Settings.</p>
    </div>
  );
}