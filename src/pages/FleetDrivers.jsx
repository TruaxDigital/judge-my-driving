import React, { useState } from 'react';
import useSEO from '@/hooks/useSEO';
import { base44 } from '@/api/base44Client';

const mobileStyles = `
  @media (max-width: 768px) {
    .fd-nav-links { display: none !important; }
    .fd-nav-cta { padding: 9px 16px !important; font-size: 0.78rem !important; }
    .fd-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .fd-hero-mock { display: none !important; }
    .fd-section-pad { padding: 60px 20px !important; }
    .fd-section-pad-sm { padding: 32px 20px !important; }
    .fd-insurance-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .fd-lead-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .fd-stat-bar { gap: 8px !important; }
    .fd-stat-bar > div { width: calc(50% - 4px) !important; flex: none !important; }
    .fd-footer-inner { flex-direction: column !important; align-items: flex-start !important; }
  }
`;

const FLEET_SIZE_OPTIONS = ['1-9 vehicles', '10-24 vehicles', '25-49 vehicles', '50+ vehicles'];
const INDUSTRY_OPTIONS = ['HVAC', 'Plumbing', 'Electrical', 'Landscaping', 'Delivery / Courier', 'Property Management', 'Pest Control', 'Cleaning Services', 'Construction', 'Towing', 'Mobile Healthcare', 'Waste Management', 'Other'];

export default function FleetDrivers() {
  useSEO({
    title: 'Fleet Driver Feedback Stickers | Insurance-Ready Safety Reports',
    description: 'QR-coded bumper stickers for your entire fleet. Real-time public ratings, corrective action tracking, and insurance-ready PDF reports. Plans from $999/yr.',
    canonical: 'https://app.judgemydriving.com/fleet-drivers',
  });

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', fleetSize: '', industry: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.fleetSize) {
      setError('Please fill in all required fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.phone && form.phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('submitEnterpriseLead', {
      ...form,
      company: form.company || '',
      inquiryType: 'demo',
      planContext: 'Fleet Landing Page',
    });
    if (res.data?.success) {
      setSuccess(true);
    } else {
      setError(res.data?.error || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const faqs = [
    { q: 'Does JMD replace GPS or dash cams?', a: 'No. JMD captures different data. GPS tracks location, speed, and routes. Dash cams record video. JMD captures how the public perceives your drivers — which no internal tool can measure. Many fleets use JMD as their only monitoring tool. Fleets that already have GPS or dash cams add JMD as a complementary layer.' },
    { q: 'How do insurance-ready safety reports work?', a: 'Professional Fleet and Enterprise plans include an export feature that generates PDF safety reports. The report compiles driver ratings, incident logs, corrective action records, hazard reports, and your fleet safety score. Download it and hand it to your broker at renewal.' },
    { q: 'Can this actually help lower my fleet insurance premiums?', a: 'Documented safety programs strengthen your negotiating position at renewal. JMD provides community feedback scores, incident logs, corrective action records, and fleet safety reports. No specific reduction is guaranteed, but commercial auto premiums range from $8,000 to $50,000+/year. Even a modest reduction can offset the cost of a JMD subscription.' },
    { q: 'What is corrective action tracking?', a: 'When a safety concern is reported, you get an immediate alert. From your dashboard, flag the issue, investigate it, document your response, and close it out. This creates a timestamped record of proactive safety management. Available on Professional Fleet and Enterprise plans.' },
    { q: "What's the difference between Starter and Professional Fleet?", a: 'Starter Fleet ($999/yr, 10 stickers, 1 admin seat) includes fleet dashboard, leaderboard, safety incident log, and email support. Professional Fleet ($1,999/yr, 25 stickers, 3 admin seats) adds insurance-ready safety reports, corrective action tracking, custom sticker branding, and priority support.' },
    { q: 'Do I need to install any hardware?', a: 'No. JMD uses weatherproof vinyl bumper stickers (15" × 3.75") with QR codes. Peel, stick on a clean surface, done. UV-resistant. Removable without damage. Five minutes per vehicle. No wiring, no technician visits.' },
    { q: 'How do I add more vehicles to my plan?', a: 'Add vehicles anytime from your dashboard. Starter Fleet: $89/yr each. Professional Fleet: $79/yr each. Enterprise: custom pricing. Replacement stickers are $19.00 flat.' },
    { q: 'Is community feedback reliable?', a: 'Feedback is tagged with time and location. The system includes device-based usage limits and spam blocking to prevent abuse. All data flows to your fleet dashboard in real time for review and action.' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#0A0A0A', color: '#fff', minHeight: '100vh' }}>
      <style>{mobileStyles}</style>

      {/* NAV */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(212,160,23,0.08)', padding: '0 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/get-started">
            <img
              src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
              alt="Judge My Driving"
              style={{ height: '48px', width: 'auto' }}
            />
          </a>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div className="fd-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <a href="#how-it-works" style={{ color: '#8A8680', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>How It Works</a>
              <a href="#insurance" style={{ color: '#8A8680', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>Insurance</a>
              <a href="#pricing" style={{ color: '#8A8680', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>Pricing</a>
              <a href="#faq" style={{ color: '#8A8680', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>FAQ</a>
            </div>
            <a className="fd-nav-cta" href="#get-demo" style={{ background: 'linear-gradient(135deg,#D4A017,#B8860B)', color: '#0A0A0A', padding: '10px 22px', borderRadius: 4, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>Request a Demo</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingTop: 160, paddingBottom: 100, paddingLeft: 28, paddingRight: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 700, height: 700, borderRadius: '50%', background: '#D4A017', filter: 'blur(130px)', opacity: 0.06, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="fd-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 72, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '7px 18px 7px 12px', background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.12)', borderRadius: 100 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D4A017', boxShadow: '0 0 12px #D4A017' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#D4A017', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Fleet Safety Platform</span>
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', fontWeight: 400, lineHeight: 1.08, marginBottom: 24, letterSpacing: '-0.01em' }}>
                You know where your trucks go.<br />
                <span style={{ color: '#D4A017', fontStyle: 'italic' }}>Do you know what impression they leave?</span>
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#8A8680', lineHeight: 1.8, marginBottom: 14, maxWidth: 560, fontWeight: 300 }}>
                Judge My Driving is a community-powered fleet feedback platform. QR-coded bumper stickers let anyone on the road rate your drivers in real time. Ratings, incident logs, corrective action tracking, and insurance-ready safety reports flow into a fleet dashboard built for operators who manage drivers they can't ride with.
              </p>
              <p style={{ fontSize: '1rem', color: '#B0ADA4', lineHeight: 1.75, marginBottom: 36, maxWidth: 560, fontWeight: 300 }}>
                The only fleet tool that captures how the public actually perceives your drivers. Works standalone or alongside GPS and dash cams. No hardware. No install. From $999/year for 10 vehicles.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="#get-demo" style={{ background: 'linear-gradient(135deg,#D4A017,#B8860B)', color: '#0A0A0A', padding: '15px 34px', borderRadius: 4, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>Request a Demo</a>
                <a href="#pricing" style={{ background: 'transparent', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)', padding: '15px 32px', borderRadius: 4, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>View Fleet Pricing</a>
              </div>
              <div style={{ display: 'flex', gap: 0, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[['$999', '/yr', 'Starter Fleet, 10 vehicles'], ['Zero', '', 'Hardware to install'], ['5 min', '', 'Setup per vehicle']].map(([val, sup, lbl], i) => (
                  <div key={lbl} style={{ flex: 1, textAlign: 'center', padding: '0 20px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.7rem', color: '#D4A017', fontWeight: 600, lineHeight: 1 }}>
                      {val}<small style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#6B675F', fontWeight: 400, marginLeft: 2 }}>{sup}</small>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6B675F', marginTop: 5, lineHeight: 1.4 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DASHBOARD MOCK */}
            <div className="fd-hero-mock" style={{ background: 'rgba(20,19,18,0.9)', border: '1px solid rgba(212,160,23,0.12)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,160,23,0.08)', background: 'rgba(212,160,23,0.02)' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#D4A017' }}>Fleet Dashboard</span>
                <span style={{ fontSize: '0.58rem', fontWeight: 600, color: '#4CAF6A' }}>● Live</span>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ textAlign: 'center', padding: '18px 0 22px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '3.6rem', color: '#fff', lineHeight: 1, fontWeight: 600 }}>4.6</div>
                  <div style={{ fontSize: '0.68rem', color: '#6B675F', marginTop: 6, letterSpacing: '0.05em' }}>Fleet Safety Score</div>
                  <div style={{ height: 3, background: '#1E1D1B', borderRadius: 4, marginTop: 14, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '92%', background: 'linear-gradient(90deg,#B8860B,#D4A017,#4CAF6A)', borderRadius: 4 }} />
                  </div>
                </div>
                {[['Active Vehicles', '18', '#fff'], ['Feedback This Month', '47', '#D4A017'], ['Open Safety Issues', '2', '#C45C4A']].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.8rem' }}>
                    <span style={{ color: '#6B675F' }}>{label}</span>
                    <span style={{ color, fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', fontSize: '0.8rem' }}>
                  <span style={{ color: '#6B675F' }}>Insurance Report</span>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: 'rgba(76,175,106,0.15)', color: '#4CAF6A' }}>Ready to Export</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ borderTop: '1px solid rgba(212,160,23,0.06)', borderBottom: '1px solid rgba(212,160,23,0.06)', padding: '28px', background: 'linear-gradient(180deg,rgba(212,160,23,0.02) 0%,transparent 100%)' }}>
        <div className="fd-stat-bar" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          {[['Zero hardware', 'Peel, stick, monitor'], ['Insurance reports', 'PDF export for your broker'], ['Works with GPS', 'Complementary, not competitive'], ['5 min setup', 'Per vehicle, no tools needed']].map(([strong, rest]) => (
            <div key={strong} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.08)', borderRadius: 6, fontSize: '0.78rem', color: '#B0ADA4' }}>
              <strong style={{ color: '#D4A017', fontFamily: 'Georgia, serif' }}>{strong}</strong> {rest}
            </div>
          ))}
        </div>
      </div>

      {/* WHO IT'S FOR */}
      <div className="fd-section-pad-sm" style={{ padding: '44px 28px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ color: '#8A8680', maxWidth: 760, margin: '0 auto', fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.8 }}>
          <strong style={{ color: '#fff', fontWeight: 600 }}>Built for fleet operators with 5–50+ vehicles</strong> in HVAC, plumbing, electrical, landscaping, delivery, property management, pest control, cleaning, construction, towing, and mobile healthcare. If your company name is on a truck and you manage drivers you can't ride with, this is for you.
        </p>
      </div>

      {/* PAIN */}
      <section className="fd-section-pad" style={{ background: '#F5F3EE', padding: '100px 28px', color: '#0A0A0A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#C45C4A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: '#C45C4A' }} /> The Problem
            </p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: 14 }}>Your drivers represent your company on every road, every day. Here's what goes wrong.</h2>
            <p style={{ fontSize: '1rem', color: '#6B675F', lineHeight: 1.75, fontWeight: 300, maxWidth: 600 }}>Every vehicle with your name on it is a moving brand touchpoint. And you have almost zero visibility into the impression it leaves behind.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              ['01', 'The call that comes too late', 'A customer calls to say your driver blew through a stop sign in their neighborhood. You had no idea. Now you\'re doing damage control instead of running your business.'],
              ['02', 'No visibility into public perception', 'You know your trucks ran their routes today. You don\'t know if a driver tailgated someone, cut off a school bus, or made a customer feel unsafe.'],
              ['03', 'A one-star review nobody saw coming', '"Your truck cut me off on Main Street." That\'s a public Google review attached to your business. You found out three days later.'],
              ['04', 'Insurance renewal with nothing to prove', 'You\'re writing a check for $25,000 in commercial auto premiums. Your broker asks what you\'ve done to improve driver safety. You have no documented program.'],
              ['05', 'Good drivers get no recognition', 'Your best drivers are invisible. They drive safely, represent your company well. Nobody tells them. Nobody tells you. There\'s no reward system.'],
            ].map(([num, title, body]) => (
              <div key={num} style={{ background: '#fff', borderRadius: 12, padding: '28px 22px', border: '1px solid #E8E6E1', transition: 'box-shadow 0.3s' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', color: '#E8E6E1', fontStyle: 'italic', lineHeight: 1, marginBottom: 14 }}>{num}</div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#0A0A0A', marginBottom: 10, lineHeight: 1.3, fontWeight: 600 }}>{title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6B675F', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="fd-section-pad" style={{ background: '#0A0A0A', padding: '100px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 56, maxWidth: 660 }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#D4A017', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: '#D4A017' }} /> The Solution
            </p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: 14 }}>Real-time community feedback. Insurance-ready reports. Driver accountability that works.</h2>
            <p style={{ fontSize: '1rem', color: '#6B675F', lineHeight: 1.75, fontWeight: 300 }}>Judge My Driving turns every person on the road into a feedback source for your fleet. Then turns that feedback into safety documentation, driver leaderboards, and reports your insurance broker can use.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[
              ['Community Feedback', 'Know how the public actually perceives your drivers', 'QR-coded bumper stickers let anyone on the road rate your drivers. You get real-time alerts and analytics in your fleet dashboard. This is the one data source no internal tool can give you: external perception from the people who share the road with your fleet.'],
              ['Insurance Reporting', 'Safety reports your broker can use at renewal', 'Professional Fleet plans generate exportable PDF reports: driver ratings, incident logs, corrective action records, fleet safety scores. Hand them to your broker. Documented safety programs strengthen your position when premiums are negotiated.'],
              ['Corrective Action', 'Flag it, investigate it, document it', 'Safety concern reported? Get an alert. Open the dashboard, investigate, document your response. That timestamped paper trail is what insurance carriers and brokers look for.'],
              ['Driver Recognition', 'Leaderboards that turn safe driving into a competition', 'Internal company leaderboards rank your drivers by safety score. Opt-in public leaderboards let them compete locally and statewide. Top-rated drivers become a recruiting tool and a retention perk.'],
            ].map(([label, title, body]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,160,23,0.08)', borderRadius: 14, padding: '32px 26px' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#D4A017', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ display: 'inline-block', width: 18, height: 1, background: '#D4A017' }} /> {label}
                </p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#fff', marginBottom: 12, lineHeight: 1.25 }}>{title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#6B675F', lineHeight: 1.7, fontWeight: 300 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="fd-section-pad" style={{ background: '#F5F3EE', padding: '100px 28px', color: '#0A0A0A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 72px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#D4A017', marginBottom: 16 }}>How It Works</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: 12 }}>Set up your entire fleet in one afternoon.</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B675F', lineHeight: 1.7, fontWeight: 300 }}>No hardware. No software installs. No training manuals. No conflicts with existing tools.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40 }}>
            {[
              ['1', 'Order your stickers', 'Pick your fleet plan. Choose from 15 standard designs or get custom branding (Professional Fleet and above). Stickers ship direct.'],
              ['2', 'Stick and drive', 'Peel and apply to each vehicle. Weatherproof, UV-resistant vinyl. Removable without damage. Visible from 10+ feet.'],
              ['3', 'Monitor and report', 'Real-time ratings, driver leaderboards, incident logs, and corrective actions in your dashboard. Export insurance reports anytime.'],
            ].map(([num, title, body]) => (
              <div key={num} style={{ textAlign: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid #D4A017', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: '#fff', boxShadow: '0 0 40px rgba(212,160,23,0.08)' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', color: '#D4A017', fontStyle: 'italic', fontWeight: 600 }}>{num}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: 10, color: '#0A0A0A', fontWeight: 600 }}>{title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#6B675F', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSURANCE */}
      <section id="insurance" className="fd-section-pad" style={{ background: '#0A0A0A', padding: '100px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="fd-insurance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 72, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#D4A017', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: '#D4A017' }} /> Insurance Reporting Tool
              </p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
                Your broker asks what you've done to improve driver safety. <span style={{ color: '#D4A017', fontStyle: 'italic' }}>Now you have an answer.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: '#6B675F', lineHeight: 1.75, fontWeight: 300, marginBottom: 40 }}>Professional Fleet and Enterprise plans generate insurance-ready PDF reports with community feedback scores, incident logs, corrective action documentation, and fleet safety scores. Hand them to your broker at renewal.</p>
              <div style={{ listStyle: 'none', padding: 0 }}>
                {[
                  ['Exportable PDF safety reports', 'Driver ratings, incident logs, corrective actions, hazard reports, fleet safety score. One document for your broker.'],
                  ['Corrective action documentation', 'Investigate and document every flagged safety concern. Creates the proactive record carriers look for.'],
                  ['External validation from the community', 'Internal reports show what you track. Community feedback shows what the public sees. Insurance carriers increasingly value external perception data.'],
                  ['Automated reporting (Enterprise)', 'Scheduled reports, auto-generated summaries, direct broker sharing. Set it up once.'],
                ].map(([title, body]) => (
                  <div key={title} style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: '0.65rem', color: '#D4A017', fontWeight: 700 }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', marginBottom: 5 }}>{title}</h4>
                      <p style={{ fontSize: '0.82rem', color: '#6B675F', lineHeight: 1.7, fontWeight: 300 }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MATH CARD */}
            <div style={{ background: 'rgba(20,19,18,0.9)', border: '1px solid rgba(212,160,23,0.12)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(212,160,23,0.08)', background: 'rgba(212,160,23,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#D4A017' }}>The Math: 10-Vehicle Fleet</span>
                <span style={{ fontSize: '0.62rem', color: '#4A4842' }}>Hypothetical example</span>
              </div>
              <div style={{ padding: 24 }}>
                {[['Annual fleet insurance premium', '$25,000', '#fff'], ['Conservative reduction (5%)', '-$1,250', '#4CAF6A']].map(([lbl, val, color]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '0.84rem' }}>
                    <span style={{ color: '#6B675F' }}>{lbl}</span>
                    <span style={{ color, fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
                <div style={{ background: 'rgba(212,160,23,0.05)', border: '1px solid rgba(212,160,23,0.12)', borderRadius: 10, padding: '14px 16px', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#B0ADA4', fontWeight: 500, fontSize: '0.84rem' }}>Annual insurance savings</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', color: '#D4A017', fontWeight: 600 }}>$1,250</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                {[['JMD Starter Fleet (10 vehicles)', '$999/yr'], ['JMD Professional Fleet (25 vehicles)', '$1,999/yr']].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '0.84rem' }}>
                    <span style={{ color: '#6B675F' }}>{lbl}</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid #D4A017', paddingTop: 16, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.84rem' }}>Net cost after insurance savings</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#4CAF6A', fontWeight: 600 }}>-$251/yr</span>
                </div>
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.68rem', color: '#4A4842', lineHeight: 1.65 }}>
                * Starter Fleet includes incident logging but not full insurance reports. Professional Fleet ($1,999/yr) includes the full Insurance Reporting Tool. JMD does not guarantee specific premium reductions.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="fd-section-pad" style={{ background: '#F5F3EE', padding: '100px 28px', color: '#0A0A0A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#B8860B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: '#B8860B' }} /> Fleet Tool Landscape
            </p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: 12 }}>Different tools capture different data.</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B675F', lineHeight: 1.7, fontWeight: 300, maxWidth: 600 }}>JMD works standalone or alongside any combination of these tools. Most small-to-mid fleets use JMD as their primary driver feedback tool.</p>
          </div>
          <div style={{ borderRadius: 14, border: '1px solid #E8E6E1', overflow: 'hidden', background: '#fff', overflowX: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, fontSize: '0.84rem' }}>
              <thead style={{ background: '#0A0A0A' }}>
                <tr>
                  {['Capability', 'GPS / Telematics', 'Dash Cams', 'JMD (Community Feedback)'].map((h, i) => (
                    <th key={h} style={{ padding: '16px 18px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: i === 3 ? '#D4A017' : '#8A8680', textTransform: 'uppercase', letterSpacing: '0.1em', background: i === 3 ? 'rgba(212,160,23,0.06)' : 'transparent' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Vehicle location and routing', 'Yes', 'No', 'No'],
                  ['Speed and hard braking data', 'Yes', 'Partial', 'No'],
                  ['Video incident review', 'No', 'Yes', 'No'],
                  ['Public perception of driver behavior', 'No', 'No', '✓ Yes'],
                  ['Community safety feedback', 'No', 'No', '✓ Yes'],
                  ['Insurance-ready PDF safety reports', 'No', 'No', '✓ Yes (Professional+)'],
                  ['Corrective action documentation', 'No', 'No', '✓ Yes (Professional+)'],
                  ['Driver leaderboard', 'No', 'No', '✓ Yes'],
                  ['Hardware required', 'Yes (per vehicle)', 'Yes (per vehicle)', 'None (bumper sticker)'],
                  ['Annual cost for 10 vehicles', '$2,400–$4,800', '$3,600–$7,200', '$999–$1,999'],
                ].map(([cap, gps, cam, jmd], ri) => (
                  <tr key={cap} style={{ background: ri % 2 === 0 ? '#fff' : '#FDFCF9' }}>
                    <td style={{ padding: '12px 18px', color: '#4A4842', borderBottom: '1px solid #E8E6E1', fontWeight: cap.startsWith('Public') || cap.startsWith('Community') || cap.startsWith('Insurance') || cap.startsWith('Corrective') || cap.startsWith('Driver') ? 600 : 400 }}>{cap}</td>
                    <td style={{ padding: '12px 18px', color: gps === 'Yes' ? '#4CAF6A' : '#B0ADA4', borderBottom: '1px solid #E8E6E1', fontWeight: gps === 'Yes' ? 700 : 400 }}>{gps}</td>
                    <td style={{ padding: '12px 18px', color: cam === 'Yes' ? '#4CAF6A' : '#B0ADA4', borderBottom: '1px solid #E8E6E1', fontWeight: cam === 'Yes' ? 700 : 400 }}>{cam}</td>
                    <td style={{ padding: '12px 18px', color: jmd.startsWith('✓') ? '#4CAF6A' : jmd.includes('$999') ? '#D4A017' : '#4A4842', borderBottom: '1px solid #E8E6E1', fontWeight: jmd.startsWith('✓') || jmd.includes('$999') ? 700 : 400, background: 'rgba(212,160,23,0.03)' }}>{jmd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="fd-section-pad" style={{ background: '#FDFCF9', padding: '100px 28px', color: '#0A0A0A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#B8860B', marginBottom: 16 }}>Fleet Pricing</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: 12 }}>Simple pricing. No hardware fees.</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B675F', lineHeight: 1.7 }}>All fleet plans include opt-in local and state leaderboards. Replacement stickers: $19.00 flat.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
            {[
              {
                tier: 'Starter Fleet', price: '$999', period: '/yr', meta: '10 stickers included\nAdditional vehicles: $89/yr each',
                features: ['Fleet analytics dashboard', 'Driver leaderboard (internal + public opt-in)', 'Safety incident log', 'Real-time notifications', 'Email support', '1 admin seat', '15 standard sticker designs'],
                cta: 'Get Started', ctaHref: '/Pricing', featured: false,
              },
              {
                tier: 'Professional Fleet', price: '$1,999', period: '/yr', meta: '25 stickers included\nAdditional vehicles: $79/yr each',
                features: ['Everything in Starter Fleet', 'Insurance-ready safety reports (PDF)', 'Corrective action tracking', 'Custom sticker branding', 'Priority email support', '3 admin seats'],
                cta: 'Get Started', ctaHref: '/Pricing', featured: true,
              },
              {
                tier: 'Enterprise Fleet', price: '$3,499+', period: '/yr', meta: '50+ vehicles\nCustom pricing',
                features: ['Everything in Professional Fleet', 'Full custom branding', 'API access', 'Automated insurance reporting', 'Phone support', 'Unlimited admin seats'],
                cta: 'Contact Sales', ctaHref: '#get-demo', featured: false,
              },
            ].map(plan => (
              <div key={plan.tier} style={{ border: plan.featured ? '2px solid #D4A017' : '1px solid #E8E6E1', borderRadius: 16, padding: '34px 26px', background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: plan.featured ? '0 0 60px rgba(212,160,23,0.06)' : 'none' }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#D4A017,#B8860B)', color: '#0A0A0A', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', padding: '5px 18px', borderRadius: 4, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 10 }}>{plan.tier}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.6rem', color: '#0A0A0A', lineHeight: 1, marginBottom: 6, fontWeight: 600 }}>{plan.price}<span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 400, color: '#8A8680' }}>{plan.period}</span></div>
                <p style={{ fontSize: '0.78rem', color: '#6B675F', marginBottom: 26, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{plan.meta}</p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: '0.82rem', color: '#4A4842', padding: '5px 0', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.4 }}>
                      <span style={{ color: '#D4A017', fontWeight: 800, flexShrink: 0, fontSize: '0.72rem', marginTop: 2 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href={plan.ctaHref} style={{ display: 'block', textAlign: 'center', padding: '14px 20px', borderRadius: 4, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', background: plan.featured ? 'linear-gradient(135deg,#D4A017,#B8860B)' : '#1E1D1B', color: plan.featured ? '#0A0A0A' : '#fff', border: plan.featured ? 'none' : '1px solid #333' }}>{plan.cta}</a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 32, fontSize: '0.82rem', color: '#6B675F' }}>
            Annual billing via Stripe. Looking for personal or family plans? <a href="/Pricing" style={{ color: '#B8860B', textDecoration: 'none', fontWeight: 600 }}>View personal pricing</a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="fd-section-pad" style={{ background: '#0A0A0A', padding: '100px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto 48px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#D4A017', marginBottom: 16 }}>FAQ</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 400, lineHeight: 1.15 }}>Common questions from fleet managers</h2>
          </div>
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            {faqs.map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '22px 0', fontSize: '0.95rem', fontWeight: 600, color: openFaq === i ? '#D4A017' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, lineHeight: 1.4 }}>
                  {item.q}
                  <span style={{ fontSize: '1.3rem', color: '#D4A017', flexShrink: 0, fontWeight: 300 }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: '0.86rem', color: '#8A8680', lineHeight: 1.75, fontWeight: 300, paddingBottom: 22 }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="get-demo" className="fd-section-pad" style={{ background: '#0A0A0A', padding: '100px 28px', borderTop: '1px solid rgba(212,160,23,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="fd-lead-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 72, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)', fontWeight: 400, lineHeight: 1.12, marginBottom: 18 }}>
                Find out what impression your fleet <span style={{ color: '#D4A017', fontStyle: 'italic' }}>is actually leaving on the road.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: '#6B675F', lineHeight: 1.75, fontWeight: 300, marginBottom: 36 }}>Community-powered driver feedback. Insurance-ready safety reports. Driver leaderboards. Corrective action tracking. $999/year for 10 vehicles. Set up in an afternoon.</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['10-minute demo, no commitment', 'Custom pricing for your fleet size', 'Insurance savings walkthrough', 'Live dashboard preview'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.88rem', color: '#B0ADA4' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.15)', color: '#D4A017', fontSize: '0.62rem', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(20,19,18,0.9)', border: '1px solid rgba(212,160,23,0.12)', borderRadius: 16, padding: '36px 30px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>✓</div>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#D4A017', marginBottom: 10 }}>We got your request.</h3>
                  <p style={{ fontSize: '0.88rem', color: '#8A8680' }}>Someone from JMD will reach out within one business day with your custom fleet pricing and demo link.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.35rem', color: '#fff', marginBottom: 6 }}>Request a fleet demo</h3>
                  <p style={{ fontSize: '0.82rem', color: '#6B675F', marginBottom: 24, lineHeight: 1.65 }}>We'll walk you through the fleet dashboard, insurance reporting, and build your custom pricing based on fleet size.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    {[['firstName', 'First Name', 'First name', 'text'], ['lastName', 'Last Name', 'Last name', 'text']].map(([field, label, placeholder, type]) => (
                      <div key={field}>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#6B675F', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>{label} *</label>
                        <input type={type} placeholder={placeholder} value={form[field]} onChange={set(field)} style={{ width: '100%', padding: '12px 14px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                  {[['company', 'Company', 'Company name', 'text'], ['email', 'Work Email', 'you@company.com', 'email'], ['phone', 'Phone', '(555) 555-5555', 'tel']].map(([field, label, placeholder, type]) => (
                    <div key={field} style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#6B675F', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>{label}{field !== 'phone' ? ' *' : ''}</label>
                      <input type={type} placeholder={placeholder} value={form[field] || ''} onChange={set(field)} style={{ width: '100%', padding: '12px 14px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#6B675F', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>Fleet Size *</label>
                      <select value={form.fleetSize} onChange={set('fleetSize')} style={{ width: '100%', padding: '12px 14px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: form.fleetSize ? '#fff' : '#4A4842', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}>
                        <option value="">Select</option>
                        {FLEET_SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#6B675F', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>Industry</label>
                      <select value={form.industry} onChange={set('industry')} style={{ width: '100%', padding: '12px 14px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: form.industry ? '#fff' : '#4A4842', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}>
                        <option value="">Select</option>
                        {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  {error && <p style={{ fontSize: '0.78rem', color: '#C45C4A', marginBottom: 12, textAlign: 'center' }}>{error}</p>}
                  <div style={{ background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B675F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>What you'll get:</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {['Custom fleet pricing', 'Insurance savings estimate', 'Live dashboard preview'].map(item => (
                        <span key={item} style={{ fontSize: '0.74rem', color: '#B0ADA4', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#D4A017', fontWeight: 700, fontSize: '0.62rem' }}>✓</span> {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px 22px', background: 'linear-gradient(135deg,#D4A017,#B8860B)', color: '#0A0A0A', fontSize: '0.88rem', fontWeight: 700, border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '0.04em' }}>
                    {loading ? 'Submitting…' : 'See How Your Fleet Saves'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.68rem', color: '#4A4842', marginTop: 12 }}>No commitment. We'll respond within one business day.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '40px 28px' }}>
        <div className="fd-footer-inner" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ fontSize: '0.76rem', color: '#4A4842', lineHeight: 1.7 }}>
            © 2026 Judge My Driving, a product of Truax Marketing Solutions. Alexandria, VA.<br />
            <a href="mailto:hello@judgemydriving.com" style={{ color: '#B8860B', textDecoration: 'none' }}>hello@judgemydriving.com</a>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Dashboard', 'https://app.judgemydriving.com'], ['Contact', 'mailto:hello@judgemydriving.com']].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: '0.76rem', color: '#4A4842', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}