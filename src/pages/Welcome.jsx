import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function Welcome() {
  const [status, setStatus] = useState('loading');
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        setStatus('no_session');
        return;
      }

      // Fetch session details from backend (trusted source for amount)
      try {
        const res = await base44.functions.invoke('getStripeSession', { session_id: sessionId });
        const data = res.data;

        if (data?.amount_total) {
          const value = data.amount_total / 100;
          const plan = data.plan_name || '';

          setPlanName(plan);

          // Fire browser Purchase event (deduplicates with server CAPI via eventID)
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value,
              currency: 'USD',
              content_name: plan,
            }, { eventID: sessionId });
          }
        }
      } catch (err) {
        console.error('Failed to fetch session details for Purchase event:', err);
      }

      // Check auth state to route appropriately
      const isAuthed = await base44.auth.isAuthenticated();

      if (isAuthed) {
        // Logged in — claim and redirect
        setStatus('claiming');
        try {
          const claimRes = await base44.functions.invoke('claimPurchase', {});
          if (claimRes.data?.claimed) {
            setStatus('claimed');
            setTimeout(() => { window.location.href = '/Stickers'; }, 2000);
          } else {
            // No pending purchase (already claimed or direct auth purchase)
            setTimeout(() => { window.location.href = '/Stickers'; }, 500);
          }
        } catch {
          setTimeout(() => { window.location.href = '/Stickers'; }, 500);
        }
      } else {
        // Guest — show create-account prompt (same as Claim page)
        setStatus('unauthenticated');
      }
    })();
  }, []);

  const handleCreateAccount = () => {
    window.location.href = '/register?next=/claim';
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0F0F0F', color: '#FFFFFF',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <a href="/get-started" style={{ marginBottom: 48 }}>
        <img
          src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
          alt="Judge My Driving"
          style={{ height: 48, width: 'auto' }}
        />
      </a>

      <div style={{
        backgroundColor: '#1A1A1A', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '48px 40px', maxWidth: 520, width: '100%', textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(212,160,23,0.2)', borderTopColor: '#D4A017',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <p style={{ color: '#B8B8B8', fontSize: 16 }}>Finalizing your order…</p>
          </>
        )}

        {/* No session_id in URL — this shouldn't happen normally */}
        {status === 'no_session' && (
          <>
            <div style={{ fontSize: 32, marginBottom: 20 }}>🔍</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No order found</h2>
            <p style={{ color: '#B8B8B8', fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
              If you just completed a purchase, give it a moment and refresh. If the problem persists, contact{' '}
              <a href="mailto:hello@judgemydriving.com" style={{ color: '#D4A017' }}>hello@judgemydriving.com</a>.
            </p>
            <a href="/get-started#pricing" style={{
              display: 'inline-block', color: '#D4A017', fontSize: 14,
              border: '1px solid rgba(212,160,23,0.3)', borderRadius: 8, padding: '10px 20px',
              textDecoration: 'none',
            }}>
              Back to pricing
            </a>
          </>
        )}

        {/* Unauthenticated — show create account prompt */}
        {status === 'unauthenticated' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 24,
            }}>
              ✓
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
              Payment received.{' '}
              <span style={{ color: '#D4A017' }}>Let's set up your dashboard.</span>
            </h1>
            {planName && (
              <p style={{ color: '#7A7A7A', fontSize: 14, marginBottom: 8 }}>{planName} plan</p>
            )}
            <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Create your login with the same email you used at checkout and your stickers will be waiting.
            </p>
            <button
              onClick={handleCreateAccount}
              style={{
                width: '100%', backgroundColor: '#D4A017', color: '#0F0F0F',
                fontWeight: 700, fontSize: 16, padding: '15px 24px', borderRadius: 12,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(212,160,23,0.25)',
              }}
            >
              Create my account
            </button>
            <p style={{ fontSize: 13, color: '#7A7A7A', marginTop: 16 }}>
              Already have an account?{' '}
              <a href="/login?next=/claim" style={{ color: '#D4A017', textDecoration: 'none' }}>Sign in</a>
            </p>
          </>
        )}

        {/* Claiming in progress */}
        {status === 'claiming' && (
          <>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(212,160,23,0.2)', borderTopColor: '#D4A017',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <p style={{ color: '#B8B8B8', fontSize: 16 }}>Activating your plan…</p>
          </>
        )}

        {/* Claimed — redirecting */}
        {status === 'claimed' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: 'rgba(74,197,106,0.12)', border: '1px solid rgba(74,197,106,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 24, color: '#4CAF6A',
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#4CAF6A', marginBottom: 12 }}>You're all set!</h2>
            <p style={{ color: '#B8B8B8', fontSize: 16 }}>Taking you to your stickers…</p>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}