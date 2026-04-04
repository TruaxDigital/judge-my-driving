import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Tag, Settings, 
  LogOut, ChevronRight, BarChart2, FileText, Truck, CreditCard, Trophy, HelpCircle, Users, GitMerge, DollarSign, Activity, LineChart
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTabBar from './BottomTabBar';
import UnifiedHeader from './UnifiedHeader';
import ThemeAwareLogo from '@/components/ThemeAwareLogo';
import PartnerToggle from './PartnerToggle';

// Nav items for regular users
const userNavItems = [
  { path: '/Dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/MapView', label: 'Map', icon: Map },
  { path: '/Stickers', label: 'Stickers', icon: Tag },
  { path: '/FleetDashboard', label: 'Fleet', icon: Truck, plans: ['starter_fleet', 'professional_fleet', 'enterprise', 'enterprise_fleet'], roles: ['fleet_admin'] },
  { path: '/Analytics', label: 'Analytics', icon: BarChart2, plans: ['starter_fleet', 'professional_fleet', 'enterprise_fleet'] },
  { path: '/Reporting', label: 'Reports', icon: FileText },
  { path: '/Leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/Support', label: 'Support', icon: HelpCircle },
  { path: '/Pricing', label: 'Plans', icon: CreditCard },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

// Nav items for admin users only
const adminNavItems = [
  { path: '/AdminUsers', label: 'Users', icon: Users },
  { path: '/AdminPartners', label: 'Partners', icon: GitMerge },
  { path: '/AdminConversions', label: 'Conversions', icon: BarChart2 },
  { path: '/AdminFleetReferrals', label: 'Fleet Referrals', icon: Truck },
  { path: '/AdminPayoutReports', label: 'Payout Reports', icon: DollarSign },
  { path: '/AdminStickers', label: 'Sticker Analytics', icon: Activity },
  { path: '/AdminAnalytics', label: 'GA Traffic', icon: LineChart },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

// Tabs whose scroll position + content should be preserved when switching
const PRESERVED_TABS = ['/Dashboard', '/Stickers', '/Settings', '/FleetDashboard'];

export default function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Track scroll positions per tab
  const scrollPositions = useRef({});
  const mainRef = useRef(null);
  const prevPath = useRef(location.pathname);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin
    ? adminNavItems
    : userNavItems.filter(item => {
        if (item.roles && !item.roles.includes(user?.role)) return false;
        if (item.plans && !item.plans.includes(user?.plan_tier)) return false;
        return true;
      });

  // Save scroll position when leaving a preserved tab, restore when entering one
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const prev = prevPath.current;
    if (PRESERVED_TABS.some(t => prev.startsWith(t))) {
      scrollPositions.current[prev] = el.scrollTop;
    }
    prevPath.current = location.pathname;
    if (PRESERVED_TABS.some(t => location.pathname.startsWith(t))) {
      const saved = scrollPositions.current[location.pathname] || 0;
      // Defer to let the new page render first
      requestAnimationFrame(() => { el.scrollTop = saved; });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Mobile header — unified with back button support */}
      <UnifiedHeader mobileOpen={mobileOpen} onMenuToggle={() => setMobileOpen(!mobileOpen)} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          style={{ touchAction: 'manipulation' }}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
        "lg:translate-x-0 lg:z-50",
        mobileOpen ? "translate-x-0 z-50" : "-translate-x-full z-30"
      )}>
        <div className="p-6 border-b border-border space-y-3">
          <img
            src="https://cdn.jsdelivr.net/gh/TruaxDigital/judge-my-driving@main/judge-my-driving-horizontal-logo-white.svg"
            alt="Judge My Driving"
            className="h-28 w-auto"
          />
          <PartnerToggle user={user} />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all select-none",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border" style={{ paddingBottom: 'max(4.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main ref={mainRef} className="lg:ml-64 pt-14 lg:pt-0 min-h-screen overscroll-y-none overflow-y-auto h-screen">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="p-6 lg:p-10 max-w-7xl mx-auto pb-24 lg:pb-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomTabBar />
    </div>
  );
}