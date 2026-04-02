import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitMerge } from 'lucide-react';

const PARTNER_PATH = '/PartnerPortal';

export default function PartnerToggle({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user?.is_partner) return null;

  const isOnPartnerPortal = location.pathname === PARTNER_PATH;

  return (
    <button
      onClick={() => navigate(isOnPartnerPortal ? '/Dashboard' : PARTNER_PATH)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all whitespace-nowrap"
    >
      <GitMerge className="w-3.5 h-3.5" />
      {isOnPartnerPortal ? 'My Account' : 'Partner Dashboard'}
    </button>
  );
}