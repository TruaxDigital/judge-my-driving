import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackForm from '../components/scan/FeedbackForm';
import RegistrationForm from '../components/scan/RegistrationForm';
import ThankYouScreen from '../components/scan/ThankYouScreen';
import RegisteredConfirmation from '../components/scan/RegisteredConfirmation';

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2, ease: 'easeIn' } },
};

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
        // Fire scan tracking event (non-blocking)
        base44.functions.invoke('recordStickerScan', {
          event_type: 'scan',
          sticker_id: s.id,
          sticker_code: s.unique_code,
          design_id: s.design_id || null,
          owner_id: s.owner_id || null,
        }).catch(() => {});
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
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
            alt="Judge My Driving"
            className="h-24 w-auto mx-auto"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-zinc-500 text-sm animate-pulse">Looking up sticker…</p>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              {...pageVariants}
              className="text-center py-20 space-y-4"
            >
              <p className="text-zinc-400 text-lg">{error}</p>
              <a href="https://judgemydriving.com" className="text-primary underline text-sm">
                Visit judgemydriving.com
              </a>
            </motion.div>
          )}

          {view === 'register' && sticker && (
            <motion.div key="register" {...pageVariants}>
              <RegistrationForm sticker={sticker} onRegistered={handleRegistered} />
            </motion.div>
          )}

          {view === 'feedback' && sticker && (
            <motion.div key="feedback" {...pageVariants}>
              <FeedbackForm sticker={sticker} onSubmitted={handleFeedbackSubmitted} />
            </motion.div>
          )}

          {view === 'thankyou' && (
            <motion.div key="thankyou" {...pageVariants}>
              <ThankYouScreen rating={thankYouData.rating} safetyFlag={thankYouData.safetyFlag} sticker={sticker} />
            </motion.div>
          )}

          {view === 'registered' && (
            <motion.div key="registered" {...pageVariants}>
              <RegisteredConfirmation driverLabel={registeredLabel} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 pt-6 border-t border-zinc-800 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Judge My Driving. Privacy-first feedback.
          </p>
          <p className="text-zinc-700 text-xs">
            <a href="/terms-of-service" className="hover:text-zinc-500 transition-colors">Terms of Service</a>
            {' | '}
            <a href="/privacy" className="hover:text-zinc-500 transition-colors">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}