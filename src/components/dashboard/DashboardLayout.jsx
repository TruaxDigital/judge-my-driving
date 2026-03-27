import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Tag, Settings, 
  LogOut, Menu, X, ChevronRight, BarChart2, FileText, Truck, CreditCard, Trophy, HelpCircle, Users
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const allNavItems = [
  { path: '/Dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/MapView', label: 'Map', icon: Map },
  { path: '/Stickers', label: 'Stickers', icon: Tag },
  { path: '/FleetDashboard', label: 'Fleet', icon: Truck, plans: ['starter_fleet', 'professional_fleet', 'enterprise_fleet'], roles: ['fleet_admin', 'admin'] },
  { path: '/Analytics', label: 'Analytics', icon: BarChart2, plans: ['starter_fleet', 'professional_fleet', 'enterprise_fleet'] },
  { path: '/Reporting', label: 'Reports', icon: FileText },
  { path: '/Leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/AdminUsers', label: 'Users', icon: Users, roles: ['admin'] },
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
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 h-16 flex items-center justify-between">
        <h1 className="font-extrabold text-lg tracking-tight">
          <span className="text-primary">JMD</span>
        </h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

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
          <h1 className="font-extrabold text-xl tracking-tight">
            <span className="text-primary">JUDGE MY</span>
            <span className="text-foreground"> DRIVING</span>
          </h1>
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
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
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}