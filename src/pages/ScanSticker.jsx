import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
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
      const code = pathParts[pathParts.length - 1];
      
      if (!code) {
        setError('No sticker code provided');
        setLoading(false);
        return;
      }

      const stickers = await base44.entities.Sticker.filter({ unique_code: code });
      
      if (stickers.length === 0) {
        setError('Sticker not found');
        setLoading(false);
        return;
      }

      const s = stickers[0];
      setSticker(s);

      if (s.status === 'deactivated') {
        setError('This sticker has been deactivated');
      } else if (!s.is_registered) {
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
        <div className="text-center mb-8">
          <h2 className="text-primary font-extrabold text-xl tracking-tight">
            JUDGE MY DRIVING
          </h2>
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
        <div className="text-center mt-12 pt-6 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Judge My Driving. Privacy-first feedback.
          </p>
        </div>
      </div>
    </div>
  );
}