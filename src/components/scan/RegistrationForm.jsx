import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Car } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RegistrationForm({ sticker, onRegistered }) {
  const [driverLabel, setDriverLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'login'

  const handleRegister = async () => {
    setSubmitting(true);
    
    // Redirect to login - after login the user will be redirected back here
    const currentUrl = window.location.pathname + window.location.search;
    // Store the driver label in localStorage so we can use it after login
    localStorage.setItem('jmd_register_label', driverLabel);
    localStorage.setItem('jmd_register_sticker', sticker.unique_code);
    base44.auth.redirectToLogin(currentUrl);
  };

  const handleClaimWithAuth = async () => {
    setSubmitting(true);
    const user = await base44.auth.me();
    const label = driverLabel || localStorage.getItem('jmd_register_label') || 'My Vehicle';
    
    await base44.entities.Sticker.update(sticker.id, {
      owner_id: user.id,
      owner_email: user.email,
      driver_label: label,
      is_registered: true,
      status: 'active',
    });

    localStorage.removeItem('jmd_register_label');
    localStorage.removeItem('jmd_register_sticker');
    onRegistered(label);
  };

  // Check if user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      setIsLoggedIn(authed);
      if (authed && localStorage.getItem('jmd_register_sticker') === sticker.unique_code) {
        // Auto-claim after redirect back from login
        await handleClaimWithAuth();
      }
    });
  }, []);

  if (isLoggedIn === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Claim Your Sticker</h1>
          <p className="text-zinc-400">Give this sticker a nickname so you can identify it.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Driver / Vehicle Nickname</Label>
          <Input
            placeholder="e.g. Mom's Car, Teen's Truck, Fleet #14"
            value={driverLabel}
            onChange={(e) => setDriverLabel(e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-xl"
          />
        </div>

        <Button
          onClick={handleClaimWithAuth}
          disabled={submitting}
          className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Sticker'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <Car className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-white">Register Your Sticker</h1>
        <p className="text-zinc-400">
          This sticker hasn't been claimed yet. Sign in to register it and start receiving driving feedback.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-300">Driver / Vehicle Nickname</Label>
        <Input
          placeholder="e.g. Mom's Car, Teen's Truck, Fleet #14"
          value={driverLabel}
          onChange={(e) => setDriverLabel(e.target.value)}
          className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-xl"
        />
      </div>

      <Button
        onClick={handleRegister}
        disabled={submitting}
        className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In & Register'}
      </Button>
    </div>
  );
}