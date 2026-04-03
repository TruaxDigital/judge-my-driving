import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeAwareLogo from '@/components/ThemeAwareLogo';
import PartnerToggle from './PartnerToggle';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Routes that are "root" tab destinations — show logo, no back button
const ROOT_ROUTES = ['/Dashboard', '/Stickers', '/FleetDashboard', '/Settings', '/Leaderboard', '/MapView'];

const ROUTE_LABELS = {
  '/Analytics': 'Analytics',
  '/Reporting': 'Reports',
  '/Support': 'Support',
  '/Pricing': 'Plans',
  '/AdminUsers': 'Users',
  '/AdminPartners': 'Partners',
  '/AdminConversions': 'Conversions',
  '/AdminPayoutReports': 'Payout Reports',
  '/AdminSales': 'Sales',
  '/AdminFleetReferrals': 'Fleet Referrals',
  '/PreviewScan': 'Reporter View',
};

export default function UnifiedHeader({ mobileOpen, onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ROOT_ROUTES.includes(location.pathname);
  const label = ROUTE_LABELS[location.pathname];

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center justify-between px-4 safe-area-top select-none">
      {/* Left: Back button or logo */}
      <div className="flex items-center gap-2 min-w-0">
        {!isRoot && label ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-primary font-medium text-sm py-1 -ml-1 pr-2"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ) : (
          <img
            src="https://cdn.jsdelivr.net/gh/TruaxDigital/judge-my-driving@main/judge-my-driving-horizontal-logo-white.svg"
            alt="Judge My Driving"
            className="h-7 w-auto max-w-[180px] object-contain"
          />
        )}
      </div>

      {/* Right: Partner toggle + Hamburger */}
      <div className="flex items-center gap-2">
        <PartnerToggle user={user} />
        <button
          onClick={onMenuToggle}
          className="flex items-center justify-center w-11 h-11 -mr-1 text-foreground rounded-lg"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}