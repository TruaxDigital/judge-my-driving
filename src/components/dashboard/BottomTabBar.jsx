import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Tag, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const TAB_ITEMS = [
  { path: '/Dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/MapView', label: 'Map', icon: Map },
  { path: '/Stickers', label: 'Stickers', icon: Tag },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex safe-area-bottom select-none">
      {TAB_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className={cn('w-5 h-5', isActive && 'fill-primary/10')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}