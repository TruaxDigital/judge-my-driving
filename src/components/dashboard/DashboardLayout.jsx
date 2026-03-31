import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Tag, Settings, 
  LogOut, ChevronRight, BarChart2, FileText, Truck, CreditCard, Trophy, HelpCircle, Users, GitMerge, DollarSign
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTabBar from './BottomTabBar';
import UnifiedHeader from './UnifiedHeader';

const allNavItems = [
  { path: '/Dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/MapView', label: 'Map', icon: Map },
  { path: '/Stickers', label: 'Stickers', icon: Tag },
  { path: '/FleetDashboard', label: 'Fleet', icon: Truck, plans: ['starter_fleet', 'professional_fleet', 'enterprise', 'enterprise_fleet'], roles: ['fleet_admin', 'admin'] },
  { path: '/Analytics', label: 'Analytics', icon: BarChart2, plans: ['starter_fleet', 'professional_fleet', 'enterprise_fleet'] },
  { path: '/Reporting', label: 'Reports', icon: FileText },
  { path: '/Leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/AdminUsers', label: 'Users', icon: Users, roles: ['admin'] },
  { path: '/AdminPartners', label: 'Partners', icon: GitMerge, roles: ['admin'] },
  { path: '/AdminConversions', label: 'Conversions', icon: BarChart2, roles: ['admin'] },
  { path: '/AdminPayoutReports', label: 'Payout Reports', icon: DollarSign, roles: ['admin'] },
  { path: '/Support', label: 'Support', icon: HelpCircle },
  { path: '/Pricing', label: 'Plans', icon: CreditCard },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const navItems = allNavItems.filter(item => {
    if (item.roles && !item.roles.includes(user?.role)) return false;
    if (item.plans && !item.plans.includes(user?.plan_tier)) return false;
    return true;
  });

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
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border">
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg"
            alt="Judge My Driving"
            className="h-28 w-auto"
          />
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

        <div className="p-4 border-t border-border">
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
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen overscroll-y-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="p-6 lg:p-10 max-w-7xl mx-auto pb-safe lg:pb-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomTabBar />
    </div>
  );
}