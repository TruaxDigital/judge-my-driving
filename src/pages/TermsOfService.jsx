import React, { useEffect } from 'react';

const sectionStyle = { color: '#D4A017', fontWeight: 700, fontSize: '1.05rem', marginTop: '2.5rem', marginBottom: '0.75rem', fontFamily: "'DM Sans', sans-serif" };
const subSectionStyle = { color: '#FFFFFF', fontWeight: 700, fontSize: '0.97rem', marginTop: '1.5rem', marginBottom: '0.5rem' };
const pStyle = { color: '#FFFFFF', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" };
const liStyle = { color: '#FFFFFF', fontSize: '1rem', lineHeight: 1.7, marginBottom: '0.5rem' };
const boldLabel = { fontWeight: 700, color: '#FFFFFF' };

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'Terms of Service | Judge My Driving';
  }, []);

  return (
    <div style={{ background: '#0F0F0F', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap'); ul.gold-bullets li::marker { color: #D4A017; }`}</style>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid rgba(212,160,23,0.12)', padding: '16px 24px' }}>
        <a href="/get-started">
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg"
            alt="Judge My Driving"
            style={{ height: '48px', width: 'auto' }}
          />
        </a>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#D4A017', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            JUDGE MY DRIVING
          </h1>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#D4A017', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 400, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            TERMS OF SERVICE
          </h2>
          <p style={{ color: '#FFFFFF', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>Effective Date: April 1, 2026</p>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <a href="/privacy" style={{ color: '#D4A017', textDecoration: 'underline' }}>See also: Privacy Policy</a>
          </p>
        </div>

        <p style={pStyle}>These Terms of Service ("Terms") govern your access to and use of the Judge My Driving platform, including the website at app.judgemydriving.com, mobile applications, QR-coded bumper stickers, feedback forms, fleet dashboard, and all related services (collectively, the "Service"). The Service is operated by Truax Marketing Solutions, a Virginia business ("Company," "we," "us," or "our").</p>
        <p style={pStyle}>By accessing or using the Service, purchasing any product, or submitting any feedback through a QR code scan, you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>

        <h2 style={sectionStyle}>1. Definitions</h2>
        <p style={pStyle}>"Account Holder" means any individual or entity that registers for a paid subscription plan (Individual, Family, or Fleet) and maintains an account on the Service.</p>
        <p style={pStyle}>"Feedback Submitter" means any member of the public who scans a QR code on a Judge My Driving bumper sticker and submits a rating, comment, or report through the feedback form.</p>
        <p style={pStyle}>"Fleet Administrator" means any authorized representative of a business entity that holds a Fleet subscription plan (Starter, Professional, or Enterprise) and manages vehicles and driver data through the fleet dashboard.</p>
        <p style={pStyle}>"User Content" means any ratings, comments, text, or other information submitted through the Service by any user, including Feedback Submitters and Account Holders.</p>
        <p style={pStyle}>"Sticker" means the physical QR-coded bumper sticker product purchased through the Service and affixed to a vehicle.</p>

        <h2 style={sectionStyle}>2. Eligibility</h2>
        <p style={pStyle}>You must be at least 18 years old to create an account or purchase a subscription. Feedback Submitters must be at least 13 years old to submit a rating or comment through the QR code feedback form. If you are between 13 and 18 years old, you may only submit feedback with the consent of a parent or legal guardian.</p>
        <p style={pStyle}>The Service is available only to users located in the United States. We do not ship Stickers internationally and do not intentionally collect data from users outside the United States.</p>
        <p style={pStyle}>By creating an account, you represent and warrant that all registration information you provide is accurate, current, and complete, and that you will maintain the accuracy of this information.</p>

        <h2 style={sectionStyle}>3. Account Registration and Subscription Plans</h2>
        <h3 style={subSectionStyle}>3.1 Account Creation</h3>
        <p style={pStyle}>To use the Service as an Account Holder, you must register for an account and select a subscription plan. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</p>
        <h3 style={subSectionStyle}>3.2 Subscription Plans</h3>
        <p style={pStyle}>The Service offers the following subscription tiers:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Individual Plan: 1 Sticker, daily alerts, 1-year feedback history',
            'Family Plan: 3 Stickers, daily and weekly alerts, unlimited feedback history (additional vehicles available as add-ons)',
            'Starter Fleet Plan: 10 Stickers, fleet dashboard, leaderboard, incident log, 1 admin seat (additional vehicles available as add-ons)',
            'Professional Fleet Plan: 25 Stickers, corrective action tracking, insurance-ready safety reports (PDF), custom sticker branding, priority email support, 3 admin seats (additional vehicles available as add-ons)',
            'Enterprise Fleet Plan: 50+ vehicles, custom pricing, full custom branding, API access, phone support, unlimited admin seats',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <p style={pStyle}>Current pricing is published at app.judgemydriving.com/get-started and may be updated from time to time. Price changes take effect at your next billing cycle.</p>
        <h3 style={subSectionStyle}>3.3 Billing and Payments</h3>
        <p style={pStyle}>All subscriptions are billed annually through Stripe, our third-party payment processor. By subscribing, you authorize recurring charges to your designated payment method. Stripe's terms of service and privacy policy govern your payment transactions.</p>
        <p style={pStyle}>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. No prorated refunds are issued for partial billing periods.</p>
        <h3 style={subSectionStyle}>3.4 Refund Policy</h3>
        <p style={pStyle}>We offer a 30-day money-back guarantee on new subscriptions. If you are not satisfied with the Service within the first 30 days of your initial subscription, you may request a full refund by contacting us at hello@judgemydriving.com. This guarantee applies to first-time subscribers only and does not apply to subscription renewals or replacement Sticker purchases.</p>

        <h2 style={sectionStyle}>4. QR Code Feedback and User Content</h2>
        <h3 style={subSectionStyle}>4.1 Feedback Submission</h3>
        <p style={pStyle}>The Service enables members of the public to scan a QR code on a vehicle's Sticker and submit a rating and optional comment about the driver's behavior. By submitting feedback, the Feedback Submitter agrees to the following:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'All feedback must be truthful, based on a genuine observation, and submitted in good faith.',
            'Feedback must not contain threats, harassment, hate speech, obscenity, personally identifiable information about the driver, or any content that violates applicable law.',
            "The Company may collect the Feedback Submitter's approximate geolocation (if permitted by their device) and the timestamp of the submission for the purpose of providing location and time context with the feedback report.",
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <h3 style={subSectionStyle}>4.2 Content License</h3>
        <p style={pStyle}>By submitting User Content, you grant the Company a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, sublicensable license to use, reproduce, modify, adapt, publish, display, and distribute your User Content in connection with operating and improving the Service, generating reports for Account Holders, and creating aggregated or anonymized analytics.</p>
        <p style={pStyle}>You retain ownership of your User Content, but you acknowledge that the Company has no obligation to compensate you for its use.</p>
        <h3 style={subSectionStyle}>4.3 Content Moderation</h3>
        <p style={pStyle}>The Company reserves the right, but has no obligation, to review, filter, edit, or remove any User Content at its sole discretion for any reason, including content that violates these Terms or applicable law. We are not responsible for any User Content submitted by third parties.</p>
        <h3 style={subSectionStyle}>4.4 No Guarantee of Feedback Accuracy</h3>
        <p style={pStyle}>Feedback submitted through the Service reflects the subjective opinion of Feedback Submitters. The Company does not verify, endorse, or guarantee the accuracy, completeness, or reliability of any feedback. Account Holders acknowledge that feedback may include inaccurate, biased, or malicious submissions, and agree not to rely on feedback as the sole basis for employment, disciplinary, or legal decisions.</p>

        <h2 style={sectionStyle}>5. Physical Products (Stickers)</h2>
        <p style={pStyle}>Stickers are physical products manufactured by our fulfillment partner and shipped to the address you provide at checkout. Standard shipping timelines apply. The Company is not responsible for delays caused by carriers, incorrect addresses, or customs.</p>
        <p style={pStyle}>Replacement Stickers are available for purchase at the current published price. Stickers that are damaged during normal use (weather, wear) should be replaced to maintain QR code functionality.</p>
        <p style={pStyle}>You acknowledge that affixing a Sticker to a vehicle is your voluntary choice. The Company is not liable for any damage to your vehicle or any third-party vehicle resulting from the application or removal of a Sticker.</p>

        <h2 style={sectionStyle}>6. Fleet-Specific Terms</h2>
        <h3 style={subSectionStyle}>6.1 Fleet Accounts</h3>
        <p style={pStyle}>Fleet subscription plans are designed for business entities that manage multiple vehicles. The Fleet Administrator is responsible for distributing Stickers to vehicles, managing driver assignments, and overseeing all account activity.</p>
        <h3 style={subSectionStyle}>6.2 Employer Responsibility</h3>
        <p style={pStyle}>If you use the Service to monitor drivers who are employees or contractors, you are solely responsible for:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Providing notice to drivers that their vehicles will carry Stickers and that public feedback will be collected.',
            'Complying with all applicable employment, labor, and privacy laws in your jurisdiction regarding employee monitoring.',
            'Using feedback data, safety reports, and corrective action records in a manner consistent with applicable law and your own internal policies.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <p style={pStyle}>The Company does not provide legal, employment, or human resources advice. Consult qualified legal counsel regarding your obligations.</p>
        <h3 style={subSectionStyle}>6.3 Insurance-Ready Reports</h3>
        <p style={pStyle}>Professional and Enterprise Fleet plans include insurance-ready safety reports in PDF format. These reports compile feedback data, incident logs, and corrective action records. The Company does not warrant that any insurer will accept, rely upon, or provide premium adjustments based on these reports. The reports are informational tools and do not constitute professional safety assessments, insurance underwriting, or legal compliance certifications.</p>
        <h3 style={subSectionStyle}>6.4 Data Ownership</h3>
        <p style={pStyle}>Fleet Account Holders retain ownership of their fleet data, including driver assignments, vehicle records, and internal notes. The Company retains a license to use aggregated and anonymized fleet data for product improvement and industry benchmarking, with no individually identifiable information disclosed to third parties.</p>

        <h2 style={sectionStyle}>7. Prohibited Conduct</h2>
        <p style={pStyle}>You agree not to:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Submit false, fraudulent, or spam feedback through QR code scans.',
            'Use automated tools, bots, or scripts to submit feedback or interact with the Service.',
            'Attempt to reverse-engineer, decompile, or extract source code from the Service.',
            "Interfere with or disrupt the Service's infrastructure, security, or performance.",
            'Use the Service to harass, threaten, stalk, or defame any person.',
            'Impersonate another person or entity when submitting feedback or creating an account.',
            'Use the Service in violation of any applicable federal, state, or local law or regulation.',
            'Resell, redistribute, or commercially exploit the Service or any data obtained through the Service without prior written consent.',
            'Circumvent any rate limits, spam protections, or access controls implemented on the Service.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>

        <h2 style={sectionStyle}>8. Intellectual Property</h2>
        <p style={pStyle}>The Service, including its design, software, text, graphics, logos, trademarks, and all related intellectual property, is owned by or licensed to the Company. Nothing in these Terms grants you any right, title, or interest in the Company's intellectual property except the limited license to use the Service as described herein.</p>
        <p style={pStyle}>You are granted a non-exclusive, non-transferable, revocable, limited license to access and use the Service solely for your personal or internal business purposes in accordance with these Terms.</p>

        <h2 style={sectionStyle}>9. Third-Party Services</h2>
        <p style={pStyle}>The Service integrates with third-party providers, including Stripe (payment processing), Printful (Sticker fulfillment), and OpenStreetMap Nominatim (geolocation). Your use of these third-party services is subject to their respective terms and privacy policies. The Company is not responsible for the acts or omissions of any third-party service provider.</p>

        <h2 style={sectionStyle}>10. Disclaimer of Warranties</h2>
        <p style={pStyle}>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY. THE COMPANY DOES NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR AVAILABLE AT ALL TIMES.</p>
        <p style={pStyle}>THE COMPANY DOES NOT WARRANT THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY FEEDBACK OR DATA PROVIDED THROUGH THE SERVICE. FEEDBACK REFLECTS THE SUBJECTIVE OPINIONS OF THIRD-PARTY SUBMITTERS AND MAY CONTAIN ERRORS, BIAS, OR MALICIOUS CONTENT.</p>

        <h2 style={sectionStyle}>11. Limitation of Liability</h2>
        <p style={pStyle}>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE, REGARDLESS OF THE THEORY OF LIABILITY.</p>
        <p style={pStyle}>THE COMPANY'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO THE COMPANY FOR THE SERVICE DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
        <p style={pStyle}>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IN SUCH JURISDICTIONS, THE ABOVE LIMITATIONS SHALL APPLY TO THE FULLEST EXTENT PERMITTED BY LAW.</p>

        <h2 style={sectionStyle}>12. Indemnification</h2>
        <p style={pStyle}>You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Your use of the Service or violation of these Terms.',
            'Any User Content you submit.',
            'Your violation of any applicable law or the rights of any third party.',
            'Any employment or disciplinary action you take based on feedback data obtained through the Service.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>

        <h2 style={sectionStyle}>13. Dispute Resolution</h2>
        <h3 style={subSectionStyle}>13.1 Governing Law</h3>
        <p style={pStyle}>These Terms are governed by and construed in accordance with the laws of the Commonwealth of Virginia, without regard to its conflict of law principles.</p>
        <h3 style={subSectionStyle}>13.2 Informal Resolution</h3>
        <p style={pStyle}>Before filing any formal legal proceeding, you agree to attempt to resolve any dispute informally by contacting us at hello@judgemydriving.com. We will attempt to resolve the dispute within 30 days.</p>
        <h3 style={subSectionStyle}>13.3 Binding Arbitration</h3>
        <p style={pStyle}>If informal resolution fails, any dispute arising out of or relating to these Terms or the Service shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. The arbitration shall be conducted in Alexandria, Virginia. The arbitrator's decision shall be final and binding.</p>
        <h3 style={subSectionStyle}>13.4 Class Action Waiver</h3>
        <p style={pStyle}>YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDING WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.</p>
        <h3 style={subSectionStyle}>13.5 Small Claims Exception</h3>
        <p style={pStyle}>Notwithstanding the above, either party may bring an individual action in small claims court in Alexandria, Virginia, provided the claim falls within the court's jurisdictional limits.</p>

        <h2 style={sectionStyle}>14. Termination</h2>
        <p style={pStyle}>The Company may suspend or terminate your account and access to the Service at any time, with or without cause, and with or without notice. Grounds for termination include, but are not limited to, violation of these Terms, fraudulent or abusive use of the Service, or nonpayment.</p>
        <p style={pStyle}>Upon termination, your right to use the Service ceases immediately. The Company may, but is not obligated to, retain your data for a reasonable period following termination. Fleet Account Holders may request a data export within 30 days of termination by contacting sales@judgemydriving.com.</p>
        <p style={pStyle}>Sections 4.2 (Content License), 8 (Intellectual Property), 10 (Disclaimer of Warranties), 11 (Limitation of Liability), 12 (Indemnification), and 13 (Dispute Resolution) survive termination.</p>

        <h2 style={sectionStyle}>15. Modifications to These Terms</h2>
        <p style={pStyle}>The Company reserves the right to update or modify these Terms at any time. Material changes will be communicated via email to Account Holders or by posting a notice on the Service. Your continued use of the Service after the effective date of any modification constitutes your acceptance of the updated Terms.</p>
        <p style={pStyle}>We encourage you to review these Terms periodically. The "Effective Date" at the top of this document reflects the date of the most recent revision.</p>

        <h2 style={sectionStyle}>16. Miscellaneous</h2>
        <p style={pStyle}><span style={boldLabel}>Entire Agreement.</span> These Terms, together with the Privacy Policy and any applicable Fleet services agreement, constitute the entire agreement between you and the Company regarding the Service.</p>
        <p style={pStyle}><span style={boldLabel}>Severability.</span> If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</p>
        <p style={pStyle}><span style={boldLabel}>Waiver.</span> The Company's failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.</p>
        <p style={pStyle}><span style={boldLabel}>Assignment.</span> You may not assign or transfer your rights under these Terms without the Company's prior written consent. The Company may assign its rights and obligations without restriction.</p>
        <p style={pStyle}><span style={boldLabel}>Force Majeure.</span> The Company is not liable for any failure or delay in performance resulting from causes beyond its reasonable control, including natural disasters, pandemics, war, government actions, or disruptions to internet or telecommunications infrastructure.</p>

        <h2 style={sectionStyle}>17. Contact Information</h2>
        <p style={pStyle}>If you have questions about these Terms, contact us at:</p>
        <p style={{ ...pStyle, lineHeight: 2 }}>
          Judge My Driving<br />
          Truax Marketing Solutions<br />
          Alexandria, Virginia 22314<br />
          Email: <a href="mailto:hello@judgemydriving.com" style={{ color: '#D4A017' }}>hello@judgemydriving.com</a><br />
          Fleet Sales: <a href="mailto:sales@judgemydriving.com" style={{ color: '#D4A017' }}>sales@judgemydriving.com</a>
        </p>

        {/* Footer */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(212,160,23,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: '#D4A017', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}>
            ↑ Back to top
          </button>
          <p style={{ color: '#555', fontSize: '0.75rem' }}>
            <a href="/privacy" style={{ color: '#D4A017', textDecoration: 'underline' }}>Privacy Policy</a>
            {' '}|{' '}
            <a href="/terms-of-service" style={{ color: '#888', textDecoration: 'none' }}>Terms of Service</a>
            {' '}|{' '}
            © {new Date().getFullYear()} Judge My Driving
          </p>
        </div>
      </div>
    </div>
  );
}