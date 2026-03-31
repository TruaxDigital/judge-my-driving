import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, QrCode, BookOpen, Palette, Settings, AlertTriangle, Upload, Loader2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import PartnerDashboard from '@/components/partner/PartnerDashboard';
import PartnerReferralTools from '@/components/partner/PartnerReferralTools';
import PartnerPitchScripts from '@/components/partner/PartnerPitchScripts';
import PartnerDesigns from '@/components/partner/PartnerDesigns';
import PartnerSettings from '@/components/partner/PartnerSettings';
import PartnerSetup from '@/components/partner/PartnerSetup';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tools', label: 'Referral Tools', icon: QrCode },
  { id: 'scripts', label: 'Pitch Scripts', icon: BookOpen },
  { id: 'designs', label: 'Sticker Designs', icon: Palette },
  { id: 'settings', label: 'Account Settings', icon: Settings },
];

export default function PartnerPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [w9Loading, setW9Loading] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: partner, isLoading: partnerLoading } = useQuery({
    queryKey: ['my-partner'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getMyPartnerRecord', {});
      return res.data?.partner || null;
    },
    enabled: !!user,
  });

  const handleW9Upload = async (e) => {
    const file = e.target.files[0];
    if (!file || !partner) return;
    setW9Loading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ReferralPartner.update(partner.id, {
      w9_file: file_url,
      w9_uploaded_at: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['my-partner'] });
    setW9Loading(false);
  };

  if (userLoading || partnerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Partner role but no ReferralPartner record — show inline setup
  if (!partner) {
    return <PartnerSetup user={user} onComplete={() => queryClient.invalidateQueries({ queryKey: ['my-partner'] })} />;
  }

  const needsW9 = partner && !partner.w9_file;

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <PartnerDashboard partner={partner} user={user} />;
      case 'tools': return <PartnerReferralTools partner={partner} />;
      case 'scripts': return <PartnerPitchScripts partner={partner} />;
      case 'designs': return <PartnerDesigns partner={partner} />;
      case 'settings': return <PartnerSettings partner={partner} user={user} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['my-partner'] })} />;
      default: return <PartnerDashboard partner={partner} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 h-16 flex items-center justify-between">
        <img
          src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg"
          alt="Judge My Driving"
          className="h-10 w-auto"
        />
        <button onClick={() => base44.auth.logout()} className="text-muted-foreground text-sm flex items-center gap-1">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg"
            alt="Judge My Driving"
            className="h-14 w-auto mb-1"
          />
          <p className="text-xs text-muted-foreground">Partner Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground text-center">Questions? hello@judgemydriving.com</p>
          <p className="text-xs text-muted-foreground text-center">Payouts processed quarterly. Min: $25.</p>
          <button onClick={() => base44.auth.logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* W-9 Banner */}
        {needsW9 && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              W-9 required before payouts can be processed.
            </div>
            <label className={cn('cursor-pointer flex items-center gap-2 text-xs font-semibold text-yellow-700 border border-yellow-500/40 rounded-lg px-3 py-1.5 hover:bg-yellow-500/10 transition-colors', w9Loading && 'opacity-50 pointer-events-none')}>
              {w9Loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Upload W-9
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleW9Upload} disabled={w9Loading} />
            </label>
          </div>
        )}

        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
          {renderTab()}
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-all',
                activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}