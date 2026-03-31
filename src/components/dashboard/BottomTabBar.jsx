import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tag, Settings, Trophy, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const FLEET_PLANS = ['starter_fleet', 'professional_fleet', 'enterprise', 'enterprise_fleet'];

const CONSUMER_TABS = [
  { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/Stickers', label: 'Stickers', icon: Tag },
  { path: '/Leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

const FLEET_TABS = [
  { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/Stickers', label: 'Stickers', icon: Tag },
  { path: '/FleetDashboard', label: 'Fleet', icon: Truck },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const isFleet = FLEET_PLANS.includes(user?.plan_tier) || user?.role === 'fleet_admin';
  const tabs = isFleet ? FLEET_TABS : CONSUMER_TABS;

  const handleTabPress = (e, tabPath) => {
    e.preventDefault();
    // If already on this tab's root or a sub-route, navigate to root to reset
    if (location.pathname === tabPath || location.pathname.startsWith(tabPath + '/')) {
      navigate(tabPath, { replace: true });
    } else {
      navigate(tabPath);
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex safe-area-bottom select-none">
      {tabs.map((item) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
          <a
            key={item.path}
            href={item.path}
            onClick={(e) => handleTabPress(e, item.path)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className={cn('w-5 h-5', isActive && 'fill-primary/10')} />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}