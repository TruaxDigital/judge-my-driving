import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import FeedbackForm from '../components/scan/FeedbackForm';
import RegistrationForm from '../components/scan/RegistrationForm';
import ThankYouScreen from '../components/scan/ThankYouScreen';
import RegisteredConfirmation from '../components/scan/RegisteredConfirmation';

export default function ScanSticker() {
  const [sticker, setSticker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(null); // 'register', 'feedback', 'thankyou', 'registered'
  const [thankYouData, setThankYouData] = useState({});
  const [registeredLabel, setRegisteredLabel] = useState('');

  useEffect(() => {
    const loadSticker = async () => {
      const pathParts = window.location.pathname.split('/');
      const code = pathParts[pathParts.length - 1]?.toUpperCase();
      
      if (!code) {
        setError('No sticker code provided');
        setLoading(false);
        return;
      }

      let s = null;
      try {
        const res = await base44.functions.invoke('getStickerByCode', { code });
        if (res.data?.error || !res.data?.sticker) {
          setError(res.data?.error || 'Sticker not found');
          setLoading(false);
          return;
        }
        s = res.data.sticker;
      } catch (err) {
        setError('Could not load sticker. Please try again.');
        setLoading(false);
        return;
      }
      
      setSticker(s);

      if (s.status === 'deactivated') {
        setError('This sticker has been deactivated');
      } else if (!s.owner_id) {
        setView('register');
      } else {
        setView('feedback');
      }
      setLoading(false);
    };

    loadSticker();
  }, []);

  const handleFeedbackSubmitted = (rating, safetyFlag) => {
    setThankYouData({ rating, safetyFlag });
    setView('thankyou');
  };

  const handleRegistered = (label) => {
    setRegisteredLabel(label);
    setView('registered');
  };

  return (
    <div className="min-h-screen bg-zinc-900 font-inter">
      <div className="max-w-md mx-auto px-5 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo theme="white" className="h-10 w-auto" />
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 space-y-4">
            <p className="text-zinc-400 text-lg">{error}</p>
            <a href="https://judgemydriving.com" className="text-primary underline text-sm">
              Visit judgemydriving.com
            </a>
          </div>
        )}

        {view === 'register' && sticker && (
          <RegistrationForm sticker={sticker} onRegistered={handleRegistered} />
        )}

        {view === 'feedback' && sticker && (
          <FeedbackForm sticker={sticker} onSubmitted={handleFeedbackSubmitted} />
        )}

        {view === 'thankyou' && (
          <ThankYouScreen rating={thankYouData.rating} safetyFlag={thankYouData.safetyFlag} />
        )}

        {view === 'registered' && (
          <RegisteredConfirmation driverLabel={registeredLabel} />
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-zinc-800 space-y-1">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Judge My Driving. Privacy-first feedback.
          </p>
          <p className="text-zinc-700 text-xs">
            <a href="/terms-of-service" className="hover:text-zinc-500 transition-colors">Terms of Service</a>
            {' | '}
            <a href="/privacy" className="hover:text-zinc-500 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}