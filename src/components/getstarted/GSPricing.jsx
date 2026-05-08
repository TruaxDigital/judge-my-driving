import React, { useState } from 'react';
import { Check, Lock, MapPin, RefreshCw, Mail, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isInIframe } from '@/lib/utils';

const INDIVIDUAL_FEATURES = [
  '1 QR-coded bumper sticker',
  'Real-time email alert on every scan',
  'Daily summary digest',
  '1-year feedback history',
  'Replace your sticker anytime for $19',
  '30-day money back',
];

const FAMILY_FEATURES = [
  '3 QR-coded bumper stickers',
  'Real-time email alerts on every scan',
  'Daily and weekly digest',
  'Unlimited feedback history',
  'Family leaderboard and gamification',
  'Add more vehicles for $39 a year each',
  '30-day money back',
];

const TRUST_CHIPS = [
  { icon: Lock, label: 'Secure checkout via Stripe' },
  { icon: MapPin, label: 'Ships in the United States' },
  { icon: RefreshCw, label: 'Cancel anytime' },
  { icon: Mail, label: 'Email support 7 days a week' },
];

export default function GSPricing() {
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    if (isInIframe()) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      base44.auth.redirectToLogin(`/get-started?plan=${planId}`);
      return;
    }
    setLoading(planId);
    const res = await base44.functions.invoke('createCheckoutSession', { plan_tier: planId, mode: 'subscription' });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert('Could not start checkout. Please try again.');
    }
    setLoading(null);
  };

  return (
    <section style={{ backgroundColor: '#0F0F0F', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            Simple annual pricing
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6 }}>
            No monthly fees. Cancel any time. 30-day full refund if it is not the right fit.
          </p>
        </div>

        <div className="gs-pricing-grid">
          {/* Individual */}
          <div style={{
            backgroundColor: '#1A1A1A', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: 40,
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.07)',
                borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#B8B8B8', marginBottom: 12,
              }}>
                For one driver
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Individual</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 56, fontWeight: 700, color: '#D4A017', lineHeight: 1 }}>$49</span>
                <span style={{ fontSize: 14, color: '#7A7A7A' }}>/year</span>
              </div>
              <p style={{ color: '#B8B8B8', fontSize: 15, margin: 0 }}>
                Personal accountability for one driver, one vehicle.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, flex: 1 }}>
              {INDIVIDUAL_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Check size={16} color="#D4A017" strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: '#FFFFFF' }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleCheckout('individual')}
              disabled={!!loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', backgroundColor: '#D4A017', color: '#0F0F0F',
                fontWeight: 700, fontSize: 16, padding: '14px 24px', borderRadius: 12,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(212,160,23,0.25)', marginTop: 'auto',
                opacity: loading && loading !== 'individual' ? 0.6 : 1,
              }}
            >
              {loading === 'individual' ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Account & Subscribe — $49/yr'}
            </button>
          </div>

          {/* Family */}
          <div style={{
            backgroundColor: '#1A1A1A', borderRadius: 16,
            border: '2px solid #D4A017',
            padding: 40,
            position: 'relative',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Most popular ribbon */}
            <div style={{
              position: 'absolute', top: -1, right: 24,
              backgroundColor: '#D4A017', color: '#0F0F0F',
              fontSize: 12, fontWeight: 700,
              padding: '6px 14px', borderRadius: '0 0 10px 10px',
            }}>
              Most popular
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'inline-block', backgroundColor: 'rgba(212,160,23,0.12)',
                border: '1px solid rgba(212,160,23,0.3)',
                borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#D4A017', marginBottom: 12,
              }}>
                For 2 to 3 drivers
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Family</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 56, fontWeight: 700, color: '#D4A017', lineHeight: 1 }}>$99</span>
                <span style={{ fontSize: 14, color: '#7A7A7A' }}>/year</span>
              </div>
              <p style={{ color: '#B8B8B8', fontSize: 15, margin: 0 }}>
                Three stickers, one shared dashboard, every driver in the household covered.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, flex: 1 }}>
              {FAMILY_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Check size={16} color="#D4A017" strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: '#FFFFFF' }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleCheckout('family')}
              disabled={!!loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', backgroundColor: '#D4A017', color: '#0F0F0F',
                fontWeight: 700, fontSize: 16, padding: '14px 24px', borderRadius: 12,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(212,160,23,0.25)', marginTop: 'auto',
                opacity: loading && loading !== 'family' ? 0.6 : 1,
              }}
            >
              {loading === 'family' ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Account & Subscribe — $99/yr'}
            </button>
          </div>
        </div>

        {/* Fleet teaser */}
        <p style={{ textAlign: 'center', color: '#B8B8B8', fontSize: 15, marginTop: 40 }}>
          Running 5 or more vehicles?{' '}
          <a href="/fleet-drivers" style={{ color: '#D4A017', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            See the fleet plans
          </a>
        </p>

        {/* Trust chips */}
        <div className="gs-trust-chips">
          {TRUST_CHIPS.map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 999,
              padding: '8px 16px', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Icon size={14} color="#D4A017" strokeWidth={1.75} />
              <span style={{ fontSize: 13, color: '#B8B8B8', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .gs-pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 1080px;
          margin: 0 auto;
          align-items: stretch;
        }
        .gs-trust-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-top: 40px;
        }
        @media (max-width: 768px) {
          .gs-pricing-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}