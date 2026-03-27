import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Save, User, CreditCard, ExternalLink, Gift, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { isInIframe } from '@/lib/utils';
import moment from 'moment';

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [notificationPref, setNotificationPref] = useState('');
  const [freeReplacementStatus, setFreeReplacementStatus] = useState(null); // null | 'loading' | 'sent' | 'error'

  React.useEffect(() => {
    if (user) {
      setNotificationPref(user.notification_pref || 'instant');
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Settings saved');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences.</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" /> Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user?.full_name || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Notification Preference</Label>
            <Select value={notificationPref} onValueChange={setNotificationPref}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant (every feedback)</SelectItem>
                <SelectItem value="daily">Daily digest</SelectItem>
                <SelectItem value="weekly">Weekly summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => updateMutation.mutate({ notification_pref: notificationPref })}
            disabled={updateMutation.isPending}
            className="rounded-xl"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Reporter View
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Preview exactly what someone sees when they scan your sticker's QR code. Feedback submitted in this view is not recorded.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => window.open('/PreviewScan', '_blank')}
          >
            <Smartphone className="w-4 h-4 mr-2" /> Open Reporter View
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium capitalize">{user?.plan_tier?.replace(/_/g, ' ') || 'No plan'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-medium capitalize ${user?.subscription_status === 'active' ? 'text-green-600' : user?.subscription_status === 'past_due' ? 'text-red-600' : 'text-muted-foreground'}`}>
              {user?.subscription_status || '—'}
            </span>
          </div>
          {user?.subscription_end_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Renews</span>
              <span className="font-medium">{moment(user.subscription_end_date).format('MMM D, YYYY')}</span>
            </div>
          )}
          {user?.subscription_status === 'active' && (
            <div className="border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-foreground">Free Replacement Sticker</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    As an active subscriber, you can request one free replacement sticker per renewal year. We'll send a new one with the same QR code.
                  </p>
                </div>
              </div>
              {freeReplacementStatus === 'sent' ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" /> Request submitted! We'll ship your replacement shortly.
                </div>
              ) : freeReplacementStatus === 'error' ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" /> Something went wrong. Please contact support.
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={freeReplacementStatus === 'loading'}
                  onClick={async () => {
                    setFreeReplacementStatus('loading');
                    try {
                      const newCredits = (user.sticker_credits || 0) + 1;
                      await base44.auth.updateMe({ sticker_credits: newCredits });
                      queryClient.invalidateQueries({ queryKey: ['me'] });
                      setFreeReplacementStatus('sent');
                    } catch {
                      setFreeReplacementStatus('error');
                    }
                  }}
                >
                  {freeReplacementStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
                  Request Free Replacement
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-2 flex-wrap">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={async () => {
                if (isInIframe()) { alert('Please open the published app to manage billing.'); return; }
                const res = await base44.functions.invoke('createPortalSession', {});
                if (res.data?.url) window.location.href = res.data.url;
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}