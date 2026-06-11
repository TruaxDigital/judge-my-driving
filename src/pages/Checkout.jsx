import React, { useEffect, useState } from 'react';
import { appParams } from '@/lib/app-params';
import { isInIframe } from '@/lib/utils';

const VALID_PLANS = {
  'individual':        'individual',
  'family':            'family',
  'starter-fleet':     'starter_fleet',
  'professional-fleet':'professional_fleet',
};

export default function Checkout() {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isInIframe()) {
      setError('Checkout is only available from the published app. Please open the app directly.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const planTier = VALID_PLANS[planParam];

    if (!planTier) {
      window.location.replace('/get-started#pricing');
      return;
    }

    // Collect attribution params
    const attribution = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'].forEach(key => {
      const val = params.get(key);
      if (val) attribution[key] = val;
    });

    (async () => {
      try {
        const baseUrl = appParams.appBaseUrl || '';
        const appId = appParams.appId || '';
        const fnUrl = `${baseUrl}/api/apps/${appId}/functions/createGuestCheckoutSession`;
        const res = await fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_tier: planTier, ...attribution }),
        });
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          setError(data?.error || 'Could not start checkout. Please try again.');
        }
      } catch (err) {
        console.error('Checkout deep-link error:', err);
        setError('Could not start checkout. Please try again.');
      }
    })();
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#0F0F0F', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', Inter, system-ui, sans-serif", padding: 24, gap: 20,
      }}>
        <p style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center', maxWidth: 420, margin: 0 }}>
          {error}
        </p>
        <a
          href="/get-started#pricing"
          style={{
            display: 'inline-block', backgroundColor: '#D4A017', color: '#0F0F0F',
            fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          View plans
        </a>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0F0F0F', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', Inter, system-ui, sans-serif", gap: 20,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(212,160,23,0.2)',
        borderTopColor: '#D4A017',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#D4A017', fontSize: 18, fontWeight: 600, margin: 0 }}>
        Taking you to secure checkout...
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}