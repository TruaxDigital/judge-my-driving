import React from 'react';
import { Truck, MessageSquare, Star, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FleetStatCards({ totalDrivers, totalScans, avgRating, safetyIncidents }) {
  const stats = [
    { label: 'Total Drivers', value: totalDrivers, icon: Truck, color: 'text-primary' },
    { label: 'Total Scans', value: totalScans, icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Fleet Avg Rating', value: avgRating, icon: Star, color: 'text-primary' },
    { label: 'Safety Incidents', value: safetyIncidents, icon: ShieldAlert, color: safetyIncidents > 0 ? 'text-red-500' : 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}