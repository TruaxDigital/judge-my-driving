import React, { useEffect } from 'react';

const sectionStyle = { color: '#D4A017', fontWeight: 700, fontSize: '1.05rem', marginTop: '2.5rem', marginBottom: '0.75rem', fontFamily: "'DM Sans', sans-serif" };
const subSectionStyle = { color: '#FFFFFF', fontWeight: 700, fontSize: '0.97rem', marginTop: '1.5rem', marginBottom: '0.5rem' };
const pStyle = { color: '#FFFFFF', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" };
const liStyle = { color: '#FFFFFF', fontSize: '1rem', lineHeight: 1.7, marginBottom: '0.5rem' };
const boldLabel = { fontWeight: 700, color: '#FFFFFF' };

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy | Judge My Driving';
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
            PRIVACY POLICY
          </h2>
          <p style={{ color: '#FFFFFF', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>Effective Date: April 1, 2026</p>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <a href="/terms-of-service" style={{ color: '#D4A017', textDecoration: 'underline' }}>See also: Terms of Service</a>
          </p>
        </div>

        <p style={pStyle}>This Privacy Policy describes how Truax Marketing Solutions, doing business as Judge My Driving ("Company," "we," "us," or "our"), collects, uses, discloses, and protects information when you use the Judge My Driving platform at app.judgemydriving.com, our mobile applications, QR-coded bumper stickers, feedback forms, fleet dashboard, and all related services (collectively, the "Service").</p>
        <p style={pStyle}>This Policy applies to all users of the Service, including Account Holders (individuals and fleet operators who maintain a paid subscription), Feedback Submitters (members of the public who scan a QR code and submit a rating), and visitors to our website.</p>
        <p style={pStyle}>By using the Service, you consent to the data practices described in this Privacy Policy. If you do not agree, please do not use the Service.</p>

        <h2 style={sectionStyle}>1. Information We Collect</h2>
        <p style={pStyle}>We collect information in three categories: information you provide directly, information collected automatically, and information from third parties.</p>
        <h3 style={subSectionStyle}>1.1 Information You Provide Directly</h3>
        <p style={pStyle}><span style={boldLabel}>Account Registration:</span> When you create an account, we collect your name, email address, phone number (optional), business name (for fleet accounts), billing address, and payment information (processed by Stripe; we do not store full credit card numbers).</p>
        <p style={pStyle}><span style={boldLabel}>Feedback Submissions:</span> When a Feedback Submitter scans a QR code and submits a rating, we collect the star rating, optional text comment, safety concern flag (if selected), and the timestamp of submission.</p>
        <p style={pStyle}><span style={boldLabel}>Fleet Data:</span> Fleet Administrators may input driver names, vehicle identifiers, driver assignments, and corrective action notes through the fleet dashboard.</p>
        <p style={pStyle}><span style={boldLabel}>Customer Support:</span> If you contact us, we collect the information you provide in your communications, including your name, email address, and the content of your message.</p>
        <h3 style={subSectionStyle}>1.2 Information Collected Automatically</h3>
        <p style={pStyle}><span style={boldLabel}>Device and Browser Information:</span> We collect your IP address, browser type and version, operating system, device type, and screen resolution when you access the Service.</p>
        <p style={pStyle}><span style={boldLabel}>Geolocation Data:</span> With the Feedback Submitter's device permission, we collect approximate geolocation at the time a feedback submission is made. This location data is used to provide geographic context with feedback reports. Feedback Submitters can deny location access, and the submission will still be processed without location data.</p>
        <p style={pStyle}><span style={boldLabel}>Usage Data:</span> We collect information about how you interact with the Service, including pages visited, features used, timestamps of activity, and referring URLs.</p>
        <p style={pStyle}><span style={boldLabel}>Cookies and Similar Technologies:</span> We use cookies, local storage, and similar technologies to maintain session state, remember preferences, and support analytics. See Section 7 for details.</p>
        <h3 style={subSectionStyle}>1.3 Information from Third Parties</h3>
        <p style={pStyle}><span style={boldLabel}>Payment Processor:</span> Stripe provides us with limited transaction information, including confirmation of payment, subscription status, and the last four digits of the payment method. We do not receive or store full payment card numbers.</p>
        <p style={pStyle}><span style={boldLabel}>Fulfillment Partner:</span> Printful provides us with shipping and delivery status information related to Sticker orders.</p>
        <p style={pStyle}><span style={boldLabel}>Geolocation Service:</span> OpenStreetMap Nominatim provides reverse-geocoded location names based on coordinates submitted during feedback.</p>

        <h2 style={sectionStyle}>2. How We Use Your Information</h2>
        <p style={pStyle}>We use the information we collect for the following purposes:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'To operate, maintain, and improve the Service.',
            'To process and fulfill Sticker orders and subscription payments.',
            'To deliver feedback ratings, comments, and reports to Account Holders.',
            'To generate fleet safety reports, leaderboards, incident logs, and corrective action records for Fleet Administrators.',
            'To generate insurance-ready safety reports in PDF format for qualifying Fleet plans.',
            'To send transactional emails (order confirmations, feedback alerts, account notifications).',
            'To send marketing communications to Account Holders (with opt-out available).',
            'To detect and prevent fraud, spam, and abuse of the feedback system.',
            'To create aggregated, anonymized analytics for product improvement and industry benchmarking.',
            'To comply with legal obligations and respond to lawful requests from government authorities.',
            'To enforce our Terms of Service and protect the rights, property, and safety of the Company and its users.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>

        <h2 style={sectionStyle}>3. How We Share Your Information</h2>
        <p style={pStyle}>We do not sell your personal information. We share information only in the following circumstances:</p>
        <p style={pStyle}><span style={boldLabel}>With Account Holders:</span> Feedback submitted through QR code scans (ratings, comments, timestamps, and approximate location) is delivered to the Account Holder associated with that Sticker. Feedback Submitters' personal information (name, email, etc.) is not collected or shared, as feedback submission does not require an account.</p>
        <p style={pStyle}><span style={boldLabel}>With Fleet Administrators:</span> Fleet Administrators can view feedback data, safety reports, and corrective action records for vehicles and drivers within their fleet account.</p>
        <p style={pStyle}><span style={boldLabel}>With Service Providers:</span> We share information with third-party vendors who perform services on our behalf, including Stripe (payments), Printful (fulfillment), and hosting/infrastructure providers. These providers are contractually obligated to use your information only for the services they provide to us.</p>
        <p style={pStyle}><span style={boldLabel}>For Legal Compliance:</span> We may disclose information if required by law, subpoena, court order, or government request, or if we believe disclosure is necessary to protect the rights, property, or safety of the Company, its users, or the public.</p>
        <p style={pStyle}><span style={boldLabel}>In a Business Transfer:</span> If the Company is involved in a merger, acquisition, sale of assets, or bankruptcy, your information may be transferred as part of that transaction. We will notify affected Account Holders of any such transfer.</p>
        <p style={pStyle}><span style={boldLabel}>With Consent:</span> We may share information with your explicit consent for purposes not described in this Policy.</p>

        <h2 style={sectionStyle}>4. Feedback Submitter Privacy</h2>
        <p style={pStyle}>Judge My Driving is designed so that Feedback Submitters can provide ratings anonymously. Submitting feedback does not require creating an account, providing a name, or providing an email address.</p>
        <p style={pStyle}>The information collected from Feedback Submitters is limited to:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Star rating (1-5)',
            'Optional text comment',
            'Safety concern flag (optional checkbox)',
            'Timestamp of submission',
            'Approximate geolocation (only if device permission is granted)',
            'IP address (collected automatically for spam prevention)',
            'Device and browser metadata (collected automatically)',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <p style={pStyle}>We do not attempt to identify Feedback Submitters by name, and we do not link feedback submissions to any personal account or profile.</p>

        <h2 style={sectionStyle}>5. Data Retention</h2>
        <p style={pStyle}>We retain your information for as long as necessary to provide the Service and fulfill the purposes described in this Policy. Specific retention periods:</p>
        <p style={pStyle}><span style={boldLabel}>Account Data:</span> Retained for the duration of your active subscription and for up to 12 months after account closure or cancellation, after which it is deleted or anonymized.</p>
        <p style={pStyle}><span style={boldLabel}>Feedback Data:</span> Individual plan feedback is retained for up to 1 year. Family plan and Fleet plan feedback is retained for the duration of the subscription plus 12 months.</p>
        <p style={pStyle}><span style={boldLabel}>Fleet Safety Reports:</span> Retained for the duration of the Fleet subscription plus 24 months to support insurance and compliance use cases.</p>
        <p style={pStyle}><span style={boldLabel}>Payment Records:</span> Retained for up to 7 years as required for tax, accounting, and legal compliance.</p>
        <p style={pStyle}><span style={boldLabel}>Feedback Submitter Data:</span> IP addresses collected for spam prevention are retained for no more than 90 days. Geolocation data is stored only as part of the feedback record associated with the Account Holder's vehicle.</p>

        <h2 style={sectionStyle}>6. Your Rights and Choices</h2>
        <h3 style={subSectionStyle}>6.1 All Users</h3>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'You may opt out of marketing emails at any time by clicking the unsubscribe link in any marketing email.',
            'You may disable cookies through your browser settings, though this may affect Service functionality.',
            'You may deny geolocation access on your device when submitting feedback.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <h3 style={subSectionStyle}>6.2 Account Holders</h3>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'You may access and update your account information through your account settings.',
            'You may request deletion of your account by contacting us at hello@judgemydriving.com. Account deletion is processed within 30 days, subject to our retention obligations described in Section 5.',
            'You may export your data by contacting us. Fleet Account Holders may request a data export within 30 days of account termination.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <h3 style={subSectionStyle}>6.3 California Residents (CCPA/CPRA Rights)</h3>
        <p style={pStyle}>If you are a California resident, you may have the following rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA):</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Right to Know: You may request information about the categories and specific pieces of personal information we have collected about you, the purposes for collection, and the categories of third parties with whom we share it.',
            'Right to Delete: You may request that we delete your personal information, subject to certain legal exceptions.',
            'Right to Correct: You may request that we correct inaccurate personal information.',
            'Right to Opt-Out of Sale/Sharing: We do not sell personal information. We do not share personal information for cross-context behavioral advertising.',
            'Right to Non-Discrimination: We will not discriminate against you for exercising your CCPA rights.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <p style={pStyle}>To exercise any of these rights, contact us at hello@judgemydriving.com with the subject line "CCPA Request." We will verify your identity before processing the request and respond within 45 days.</p>
        <h3 style={subSectionStyle}>6.4 Virginia Residents (VCDPA Rights)</h3>
        <p style={pStyle}>If you are a Virginia resident, you may have the following rights under the Virginia Consumer Data Protection Act (VCDPA):</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Right to access, correct, delete, and obtain a copy of your personal data.',
            'Right to opt out of the processing of personal data for targeted advertising, sale, or profiling.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <p style={pStyle}>To exercise these rights, contact us at hello@judgemydriving.com. We will respond within 45 days. You may appeal a denied request by contacting us with the subject line "VCDPA Appeal."</p>

        <h2 style={sectionStyle}>7. Cookies and Tracking Technologies</h2>
        <p style={pStyle}>We use the following types of cookies and similar technologies:</p>
        <p style={pStyle}><span style={boldLabel}>Strictly Necessary Cookies:</span> Required for the Service to function, including session management, authentication, and security. These cannot be disabled.</p>
        <p style={pStyle}><span style={boldLabel}>Analytics Cookies:</span> Used to understand how users interact with the Service, measure performance, and identify areas for improvement. We may use third-party analytics providers.</p>
        <p style={pStyle}><span style={boldLabel}>HubSpot Tracking:</span> Our marketing pages use HubSpot tracking scripts to attribute website visitors and measure the effectiveness of marketing campaigns. HubSpot sets cookies on your device. See HubSpot's privacy policy for details.</p>
        <p style={pStyle}>You can manage cookie preferences through your browser settings. Disabling cookies may affect the functionality of the Service.</p>

        <h2 style={sectionStyle}>8. Data Security</h2>
        <p style={pStyle}>We implement reasonable administrative, technical, and physical safeguards to protect your information from unauthorized access, use, alteration, and destruction. These measures include:</p>
        <ul className="gold-bullets" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          {[
            'Encryption of data in transit using TLS/SSL.',
            'Secure storage of data with access controls limited to authorized personnel.',
            'Regular review of security practices and vendor security posture.',
            'PCI DSS compliance managed by Stripe for payment data.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <p style={pStyle}>No method of electronic transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.</p>

        <h2 style={sectionStyle}>9. Children's Privacy</h2>
        <p style={pStyle}>The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. The QR code feedback form requires that submitters be at least 13 years old.</p>
        <p style={pStyle}>If we learn that we have collected personal information from a child under 13, we will delete that information promptly. If you believe a child under 13 has provided personal information to us, please contact us at hello@judgemydriving.com.</p>
        <p style={pStyle}>Account creation and subscription purchases require users to be at least 18 years old. The Service may be used to monitor teen drivers (ages 16-17), but the account is held and managed by a parent or legal guardian who is at least 18 years old.</p>

        <h2 style={sectionStyle}>10. International Users</h2>
        <p style={pStyle}>The Service is operated in the United States and intended for users located in the United States. We do not ship Stickers internationally or intentionally collect data from users outside the United States. If you access the Service from outside the United States, you do so at your own risk, and your information will be transferred to and processed in the United States.</p>

        <h2 style={sectionStyle}>11. Do Not Track Signals</h2>
        <p style={pStyle}>Some browsers transmit "Do Not Track" (DNT) signals. There is no industry-standard response to DNT signals. We do not currently respond to DNT signals. However, we do not engage in cross-site tracking or sell personal information.</p>

        <h2 style={sectionStyle}>12. Changes to This Privacy Policy</h2>
        <p style={pStyle}>We may update this Privacy Policy from time to time. Material changes will be communicated to Account Holders via email and by posting a notice on the Service. The "Effective Date" at the top of this Policy reflects the date of the most recent revision.</p>
        <p style={pStyle}>We encourage you to review this Privacy Policy periodically. Continued use of the Service after any changes constitutes acceptance of the updated Policy.</p>

        <h2 style={sectionStyle}>13. Contact Information</h2>
        <p style={pStyle}>If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us at:</p>
        <p style={{ ...pStyle, lineHeight: 2 }}>
          Judge My Driving<br />
          Truax Marketing Solutions<br />
          Alexandria, Virginia 22314<br />
          Email: <a href="mailto:hello@judgemydriving.com" style={{ color: '#D4A017' }}>hello@judgemydriving.com</a><br />
          Fleet Sales: <a href="mailto:sales@judgemydriving.com" style={{ color: '#D4A017' }}>sales@judgemydriving.com</a>
        </p>
        <p style={pStyle}>For CCPA or VCDPA requests, use the subject line "Privacy Rights Request."</p>

        {/* Footer */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(212,160,23,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: '#D4A017', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}>
            ↑ Back to top
          </button>
          <p style={{ color: '#555', fontSize: '0.75rem' }}>
            <a href="/terms-of-service" style={{ color: '#D4A017', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}|{' '}
            <a href="/privacy" style={{ color: '#888', textDecoration: 'none' }}>Privacy Policy</a>
            {' '}|{' '}
            © {new Date().getFullYear()} Judge My Driving
          </p>
        </div>
      </div>
    </div>
  );
}