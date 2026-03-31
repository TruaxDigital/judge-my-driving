import React, { useEffect } from 'react';
import useSEO from '@/hooks/useSEO';
import { ShieldAlert } from 'lucide-react';

const SECTIONS = [
  {
    title: null,
    body: `Do not use this service while operating a vehicle. Texting, browsing, or interacting with a mobile device while driving is illegal in most U.S. states and jurisdictions. If you wish to leave feedback, pull over to a safe, legal stopping location before using your device, or ask a passenger to submit the review on your behalf.`,
  },
  {
    title: null,
    body: `Judge My Driving is committed to road safety. By using this platform, you acknowledge and agree that:`,
    list: [
      'You will not access, browse, or submit feedback on this site while actively operating a motor vehicle.',
      'You are solely responsible for complying with all applicable federal, state, and local laws regarding mobile device use while driving.',
      "Judge My Driving, its owners, officers, employees, directors, agents, and affiliates assume no liability for any accidents, injuries, property damage, traffic violations, or legal consequences arising from a user's decision to access this platform while driving or while otherwise in control of a vehicle.",
      'This platform is intended to promote safer driving. Any misuse of this service that compromises road safety is strictly prohibited.',
      'All feedback submitted through this platform reflects the personal opinion of the submitting user. Judge My Driving does not verify, endorse, or assume responsibility for the accuracy of any user-submitted feedback or ratings.',
    ],
  },
  {
    title: 'INDEMNIFICATION',
    body: `Without limiting any applicable law, you agree to indemnify and hold harmless Judge My Driving, its parent company, subsidiaries, affiliates, employees, officers, directors, and agents from and against all claims, damages, expenses, losses, and liabilities arising as a result of your use of this platform or your violation of these terms. This includes, but is not limited to, any claims resulting from your use of a mobile device while operating a vehicle, any feedback you submit, or any action taken in reliance on feedback provided through this platform. Given that this service is provided free of charge to reviewers, this indemnity is intended to cover all expenses, payments, losses, loss of profits, or any other damage, whether direct or indirect, monetary or non-monetary, incurred by Judge My Driving or its employees, officers, directors, or agents, including but not limited to legal expenses and attorney fees.`,
  },
  {
    title: 'DATA COLLECTION AND PRIVACY',
    body: 'By accessing or using this platform, you acknowledge and consent to the following data practices:',
  },
  {
    title: 'Information We Collect',
    body: 'When you submit feedback, scan a QR code, or create an account, Judge My Driving may collect the following categories of information:',
    list: [
      'Device and browser information. Device type, operating system, browser type, screen resolution, and unique device identifiers.',
      'Location data. Approximate or precise geolocation at the time of feedback submission, if permitted by your device settings. Location data is used to associate feedback with a general area and is not used to track or identify individual reviewers.',
      'Feedback content. Star ratings, written comments, safety concern flags, and timestamps you submit through the platform.',
      'Account information. For registered users (sticker purchasers, fleet managers, and individual account holders): name, email address, payment information, and vehicle or fleet identifiers.',
      'Usage data. Pages visited, time spent on the platform, referring URLs, IP addresses, and interaction patterns.',
      'Cookies and similar technologies. We use cookies, pixels, and similar tracking technologies to operate the platform, remember preferences, and analyze usage patterns.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: 'Judge My Driving uses collected data for the following purposes:',
    list: [
      'To deliver feedback and ratings to registered sticker owners and fleet managers.',
      'To operate, maintain, and improve the platform.',
      'To process transactions and send service-related communications.',
      'To detect and prevent fraud, abuse, or misuse of the platform.',
      'To comply with legal obligations and respond to lawful requests from public authorities.',
      'To generate aggregated, de-identified analytics that cannot be traced back to an individual user.',
    ],
  },
  {
    title: 'How We Share Your Information',
    body: 'Judge My Driving does not sell your personal information to third parties. We may share your information in the following circumstances:',
    list: [
      'With sticker owners and fleet managers. Feedback content, ratings, timestamps, and general location data are shared with the registered owner of the sticker associated with the vehicle you reviewed. Your name and contact information are never shared with the driver or sticker owner.',
      'With service providers. We share data with third-party vendors who help us operate the platform (hosting, payment processing, email delivery, analytics). These providers are contractually required to protect your data and may only use it to perform services on our behalf.',
      'For legal compliance. We may disclose information when required by law, subpoena, court order, or governmental request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.',
      'In a business transfer. If Judge My Driving is acquired, merged, or sells substantially all of its assets, user data may be transferred as part of that transaction. We will notify users of any such change in ownership or control.',
    ],
  },
  {
    title: 'Reviewer Anonymity',
    body: 'Reviewers who submit feedback without creating an account remain anonymous to the driver and sticker owner. Judge My Driving retains device and location metadata for fraud prevention and platform integrity purposes only.',
  },
  {
    title: 'Data Retention',
    body: 'We retain personal information for as long as necessary to fulfill the purposes described above, or as required by law. Aggregated and de-identified data may be retained indefinitely for analytical purposes.',
  },
  {
    title: 'Your Rights and Choices',
    list: [
      'You may disable location services on your device at any time. Some platform features may be limited without location data.',
      'Registered users may request access to, correction of, or deletion of their personal data by contacting hello@judgemydriving.com.',
      'You may opt out of non-essential cookies through your browser settings.',
      'If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA). Contact us for details.',
      'If you are a Virginia resident, you may have additional rights under the Virginia Consumer Data Protection Act (VCDPA). Contact us for details.',
    ],
  },
  {
    title: "Children's Privacy",
    body: "Judge My Driving is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided personal information, we will take steps to delete that information promptly.",
  },
  {
    title: 'Security',
    body: 'We implement commercially reasonable technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. No method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: 'Changes to Data Practices',
    body: 'Judge My Driving reserves the right to update these data practices at any time. Material changes will be communicated through the platform or via email to registered users. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.',
  },
  {
    title: 'Contact',
    body: 'For questions about data collection, privacy, or to exercise your rights, contact us at hello@judgemydriving.com.',
  },
];

export default function Liability() {
  useSEO({
    title: 'Fleet Safety Documentation & Liability | Judge My Driving',
    description: "Judge My Driving generates insurance-ready safety reports and corrective action records. Document your fleet's safety program and protect against liability claims.",
    canonical: 'https://app.judgemydriving.com/liability',
  });

  return (
    <div className="min-h-screen bg-zinc-900 font-inter px-5 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
            alt="Judge My Driving"
            className="h-28 w-auto"
          />
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-primary shrink-0" />
            <h1 className="text-2xl font-extrabold text-white">
              Safety Notice, Liability Disclaimer, Indemnification, and Data Practices
            </h1>
          </div>
        </div>

        {SECTIONS.map((section, i) => (
          <div key={i} className="space-y-3">
            {section.title && (
              <h2 className="text-base font-bold text-primary uppercase tracking-wide">
                {section.title}
              </h2>
            )}
            {section.body && (
              <p className="text-zinc-300 text-sm leading-relaxed">{section.body}</p>
            )}
            {section.list && (
              <ul className="space-y-3 text-zinc-300 text-sm leading-relaxed list-none">
                {section.list.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="text-primary font-bold shrink-0">{j + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="pt-4 space-y-3 border-t border-zinc-800">
          <p className="text-zinc-300 text-sm leading-relaxed">
            If you witness a genuine emergency or dangerous driving situation, contact local law enforcement or call 911 immediately. Do not attempt to use this platform as a substitute for emergency services.
          </p>
          <p className="text-primary font-semibold text-sm">Driver safety is our number one priority.</p>
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Judge My Driving</p>
        </div>
      </div>
    </div>
  );
}