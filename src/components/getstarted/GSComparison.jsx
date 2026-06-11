import React from 'react';
import { Check, X } from 'lucide-react';

const ROWS = [
  { feature: 'Annual cost (1 vehicle)', jmd: '$49', gps: '$240 to $480', dash: '$360 to $720' },
  { feature: 'Tells you how the public sees the driver', jmd: true, gps: false, dash: false },
  { feature: 'Hardware to install', jmd: 'None', gps: 'Per vehicle', dash: 'Per vehicle' },
  { feature: 'Setup time', jmd: '2 minutes', gps: '30 to 60 min', dash: '30 to 60 min' },
  { feature: 'Captures real-time public ratings', jmd: true, gps: false, dash: false },
  { feature: 'Driver privacy impact', jmd: 'Low', gps: 'High', dash: 'Very high' },
  { feature: 'Works without an app on the driver\'s phone', jmd: true, gps: false, dash: 'Sometimes' },
];

function Cell({ val, highlight }) {
  const base = { padding: '14px 16px', fontSize: 14, verticalAlign: 'middle', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#B8B8B8' };
  const style = highlight ? { ...base, color: '#FFFFFF', fontWeight: 600 } : base;

  if (val === true) return <td style={style}><Check size={16} color="#22C55E" /></td>;
  if (val === false) return <td style={style}><X size={16} color="#EF4444" /></td>;
  return <td style={style}>{val}</td>;
}

export default function GSComparison() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
          Why a sticker, not a tracker
        </h2>
        <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, maxWidth: 640, marginBottom: 48 }}>
          GPS tells you where the truck is. A dash cam records what the driver did. Neither one tells you what the public actually thinks of how your driver is treating the road.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Feature
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(212,160,23,0.06)' }}>
                  Judge My Driving
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  GPS Tracker
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Dash Cam
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ feature, jmd, gps, dash }) => (
                <tr key={feature}>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#FFFFFF', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'middle' }}>
                    {feature}
                  </td>
                  <Cell val={jmd} highlight />
                  <Cell val={gps} />
                  <Cell val={dash} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: '#7A7A7A', fontSize: 13, marginTop: 16, lineHeight: 1.5 }}>
          Judge My Driving is not a GPS replacement. It is a different data layer. Many fleet customers run both.
        </p>
      </div>
    </section>
  );
}