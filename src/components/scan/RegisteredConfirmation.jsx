import React from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function RegisteredConfirmation({ driverLabel, email }) {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-400" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Sticker Registered!</h1>
        <p className="text-zinc-400 text-lg">
          Your sticker "<span className="text-white font-medium">{driverLabel}</span>" is now active.
        </p>
      </div>
      <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6 space-y-3">
        <Mail className="w-6 h-6 text-primary mx-auto" />
        <p className="text-zinc-300 text-sm">
          You'll receive feedback notifications at your registered email. Stick it on your vehicle and drive!
        </p>
      </div>
      <Link to="/Dashboard">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}