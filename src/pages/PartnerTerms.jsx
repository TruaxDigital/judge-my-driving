import React from 'react';
import { FileText } from 'lucide-react';

const SECTIONS = [
  {
    preamble: `These Partner Program Terms and Conditions ("Agreement") constitute a legally binding contract between you ("Partner," "you," or "your") and Judge My Driving ("Company," "JMD," "we," "us," or "our"). By enrolling in the Judge My Driving Partner Program ("Program"), you acknowledge that you have read, understood, and agree to be bound by this Agreement in its entirety.`,
    warning: `If you do not agree to these terms, do not enroll in the Program.`,
  },
  {
    title: '1. Definitions',
    defs: [
      { term: '"Consumer Referral"', def: 'means a referral of a new customer who (a) is referred by Partner through a unique Partner Referral Link or Referral Code provided by JMD, (b) completes a paid subscription to an Individual Plan or Family Plan on app.judgemydriving.com, (c) is not an existing JMD customer at the time of signup, (d) does not request a refund or initiate a chargeback within thirty (30) days of purchase, and (e) is not the Partner themselves or any entity controlled by, affiliated with, or related to the Partner.' },
      { term: '"Fleet Referral"', def: 'means a referral of a prospective fleet customer submitted by Partner through the Fleet Referral form on the Partner Dashboard, containing the contact name, company name, and email address of the prospective customer. A Fleet Referral is not a Consumer Referral and does not earn any commission upon submission. Commission eligibility for Fleet Referrals is governed exclusively by Section 4.' },
      { term: '"Consumer Commission"', def: 'means the flat fee of ten dollars ($10.00) per Consumer Referral, as described in Section 4.' },
      { term: '"Fleet Commission"', def: 'means the flat fee of one hundred dollars ($100.00) per Fleet Referral that meets all conditions described in Section 4, unless adjusted by JMD in its sole discretion for a specific referral.' },
      { term: '"Commission"', def: 'means, collectively, Consumer Commissions and Fleet Commissions.' },
      { term: '"Partner Portal"', def: 'means the self-service dashboard through which Partners can track referrals, view commission balances, submit Fleet Referrals, and manage account information. The Partner Portal is accessible at partners.judgemydriving.com for external Partners and through the Partner Dashboard toggle within app.judgemydriving.com for in-app Partners.' },
      { term: '"Partner Dashboard"', def: 'means the partner-specific view within app.judgemydriving.com, accessible via a navigation toggle by users who have opted into the Program from their account Settings page.' },
      { term: '"Referral Link"', def: 'means the unique URL containing a tracking parameter (?ref=) assigned to Partner upon enrollment, used to attribute Consumer Referrals to Partner\'s account.' },
      { term: '"Referral Code"', def: 'means the unique alphanumeric code assigned to Partner upon enrollment, which may be appended to URLs or used for tracking purposes.' },
      { term: '"Payout Period"', def: 'means each calendar quarter (January–March, April–June, July–September, October–December).' },
      { term: '"Fleet Hold Period"', def: 'means the ninety (90) calendar day period beginning on the date of the fleet customer\'s first payment to JMD (the "Stripe Payment Date"), during which the Fleet Commission remains subject to forfeiture as described in Section 4.' },
    ],
  },
  {
    title: '2. Program Enrollment and Eligibility',
    items: [
      { sub: '2.1', label: 'Eligibility.', body: 'To participate in the Program, you must be (a) at least eighteen (18) years of age, (b) a legal resident of the United States or a business entity organized under the laws of a U.S. state, (c) not an employee, officer, director, or contractor of JMD, and (d) in compliance with all applicable federal, state, and local laws.' },
      { sub: '2.2', label: 'Enrollment Methods.', body: 'Enrollment in the Program may be completed through either of the following methods:', list: [
        'External Enrollment: Through the Partner signup portal at partners.judgemydriving.com or /partner-signup.',
        'In-App Enrollment: Through the Partner Program section on the Settings page within an existing JMD account at app.judgemydriving.com. Existing JMD subscribers (Individual, Family, or Fleet plan holders) may opt into the Program from their Settings page by completing the partner enrollment form and agreeing to this Agreement.',
      ]},
      { sub: '', label: '', body: 'Both enrollment methods produce the same Partner status, the same Referral Code, and the same rights and obligations under this Agreement. There is no distinction in Program terms between external Partners and in-app Partners.' },
      { sub: '2.3', label: 'Enrollment Not Guaranteed.', body: 'Submission of an enrollment application through either method does not guarantee acceptance. JMD reserves the sole and absolute discretion to approve, deny, or revoke any Partner application or membership for any reason or no reason, with or without notice.' },
      { sub: '2.4', label: 'Account Information.', body: 'You are responsible for providing accurate and current information during enrollment and maintaining the accuracy of your account information throughout your participation. This includes payout method, payout details, and contact information. Providing false, misleading, or fraudulent information is grounds for immediate termination and forfeiture of unpaid commissions.' },
      { sub: '2.5', label: 'One Account Per Partner.', body: 'Each individual or business entity may maintain only one Partner account. Creating multiple accounts, creating multiple JMD user accounts to obtain multiple Partner enrollments, or otherwise manipulating referral tracking, inflating commissions, or circumventing any Program rule is strictly prohibited and constitutes grounds for immediate termination and forfeiture of all unpaid commissions.' },
      { sub: '2.6', label: 'Dual Role Acknowledgment.', body: 'Partners who are also JMD subscribers acknowledge that their subscription relationship and their Partner relationship are governed by separate terms. This Agreement governs the Partner relationship only. Termination of a JMD subscription does not automatically terminate Partner status, and termination of Partner status does not automatically terminate a JMD subscription. However, JMD reserves the right to terminate either or both at its discretion.' },
    ],
  },
  {
    title: '3. Referral Tracking and Attribution',
    subsections: [
      {
        subtitle: 'Consumer Referrals',
        items: [
          { sub: '3.1', label: 'Referral Link Required.', body: 'Consumer Commissions are earned only when a Consumer Referral is attributed to your unique Referral Link or Referral Code. You are solely responsible for distributing and using your Referral Link correctly. JMD is not responsible for commissions lost due to improper link usage, browser settings, cookie clearing, or any other technical factor outside JMD\'s control.' },
          { sub: '3.2', label: 'Attribution Window.', body: 'A Consumer Referral is attributed to the Partner whose Referral Link was last clicked by the customer prior to completing a purchase. JMD uses a thirty (30) day cookie attribution window. If a customer clicks multiple Partner Referral Links, the last click within the attribution window receives credit. JMD\'s attribution records are final and binding.' },
          { sub: '3.3', label: 'No Retroactive Credit.', body: 'JMD does not provide retroactive commission credit for referrals that were not properly tracked through your Referral Link at the time of purchase, regardless of the reason for the tracking failure.' },
        ],
      },
      {
        subtitle: 'Fleet Referrals',
        items: [
          { sub: '3.4', label: 'Fleet Referral Submission.', body: 'Fleet Referrals are submitted exclusively through the Fleet Referral form on the Partner Dashboard. Fleet Referrals are not tracked via Referral Links. A Fleet Referral is attributed to the Partner who submits the form.' },
          { sub: '3.5', label: 'No Duplicate Fleet Referrals.', body: 'If multiple Partners submit Fleet Referrals for the same prospective fleet customer (determined by company name, contact email, or other identifying information at JMD\'s sole discretion), only the first submission receives attribution. JMD\'s determination of which submission was first is final and binding.' },
          { sub: '3.6', label: 'Fleet Referral Is an Introduction Only.', body: 'Submission of a Fleet Referral constitutes an introduction of a prospective customer to JMD. Partner acknowledges and agrees that:', list: [
            'All fleet sales, negotiations, pricing, contracting, and customer relationship management are handled exclusively by JMD\'s internal sales team.',
            'Partner has no role, authority, or involvement in the fleet sales process after submission.',
            'Partner shall not contact the referred fleet prospect to discuss pricing, terms, features, or any other aspect of JMD\'s fleet offering unless expressly authorized by JMD in writing.',
            'Partner shall not make representations, promises, or commitments to the referred fleet prospect regarding JMD\'s products, pricing, delivery timelines, or capabilities.',
            'JMD has no obligation to pursue, contact, or close any Fleet Referral. JMD may decline to engage with any referred prospect for any reason.',
          ]},
          { sub: '3.7', label: 'Fleet Referral Status.', body: 'Partners may view the status of their submitted Fleet Referrals on the Partner Dashboard. Status categories include: Submitted, Contacted, Deal Closed, 90-Day Hold, Commission Approved, Paid, and Rejected. JMD updates statuses at its sole discretion and is not obligated to provide reasons for status changes or for a Rejected determination.' },
          { sub: '3.8', label: 'Fleet Referral Data.', body: 'Once a Fleet Referral is submitted, it cannot be edited or deleted by the Partner. All information submitted becomes the property of JMD and may be used for sales, marketing, and business development purposes regardless of whether the referral results in a closed deal or commission payment.' },
        ],
      },
      {
        subtitle: 'General',
        items: [
          { sub: '3.9', label: 'Disputes.', body: 'Any dispute regarding referral attribution (Consumer or Fleet) must be submitted in writing to partners@judgemydriving.com within thirty (30) days of the transaction date or status change. JMD will review disputes in good faith but retains sole discretion over final attribution and status decisions.' },
        ],
      },
    ],
  },
  {
    title: '4. Commission Structure and Payment',
    subsections: [
      {
        subtitle: 'Consumer Commissions',
        items: [
          { sub: '4.1', label: 'Consumer Commission Rate.', body: 'Partner earns a flat Consumer Commission of ten dollars ($10.00) per Consumer Referral who subscribes to an Individual Plan ($49/year) or Family Plan ($99/year).' },
          { sub: '4.2', label: 'One-Time Commission.', body: 'Consumer Commissions are earned on the initial subscription purchase only. No commission is earned on subscription renewals, plan upgrades, plan downgrades, add-on vehicle purchases, replacement sticker purchases, or any other transaction beyond the initial qualifying purchase.' },
          { sub: '4.3', label: 'Consumer Commission Hold Period.', body: 'All Consumer Commissions are subject to a thirty (30) day hold period from the date of the qualifying purchase. If the referred customer cancels, requests a refund, or initiates a chargeback during the hold period, the commission is voided and will not be paid.' },
        ],
      },
      {
        subtitle: 'Fleet Commissions',
        items: [
          { sub: '4.4', label: 'Fleet Commission Rate.', body: 'Partner earns a flat Fleet Commission of one hundred dollars ($100.00) per Fleet Referral, subject to all of the following conditions being met:', list: [
            'The Fleet Referral results in a closed and paid fleet subscription (Starter Fleet, Professional Fleet, or Enterprise Fleet) between the referred prospect and JMD.',
            "JMD's internal sales team closes the deal. Partner's sole contribution is the initial introduction via the Fleet Referral form.",
            'The fleet customer completes their first payment to JMD.',
            "The fleet customer's subscription remains active and in good standing for the full Fleet Hold Period of ninety (90) calendar days following the first payment date.",
            'The fleet customer does not cancel, request a refund, initiate a chargeback, or default on payment at any time during the Fleet Hold Period.',
            'JMD, in its sole discretion, approves the Fleet Commission by advancing the Fleet Referral status to "Commission Approved."',
          ]},
          { sub: '', label: '', body: 'All six conditions must be satisfied. Failure of any single condition voids the Fleet Commission entirely.' },
          { sub: '4.5', label: 'Fleet Commission Is Not Automatic.', body: 'Submission of a Fleet Referral does not create an entitlement to a Fleet Commission. A Fleet Commission is earned only upon JMD\'s affirmative approval after all conditions in Section 4.4 are satisfied. JMD\'s decision to approve or deny a Fleet Commission is final and not subject to appeal.' },
          { sub: '4.6', label: 'Fleet Commission Amount.', body: 'The default Fleet Commission is one hundred dollars ($100.00). JMD reserves the right to adjust the commission amount for a specific Fleet Referral at its sole discretion, including but not limited to situations involving unusually small fleet deals, partial closings, or deals that deviate materially from standard fleet pricing.' },
          { sub: '4.7', label: 'No Commission on Direct-to-Consumer Plans via Fleet Referrals.', body: 'If a fleet prospect referred through the Fleet Referral form ultimately subscribes to an Individual or Family plan instead of a Fleet plan, no Fleet Commission is earned. A Consumer Commission is earned only if the prospect completed their purchase through the Partner\'s Referral Link within the attribution window described in Section 3.2.' },
          { sub: '4.8', label: 'Fleet Commission Forfeiture.', body: 'A Fleet Commission that has been credited to Partner\'s balance but not yet paid is subject to forfeiture if, at any time before payout, JMD determines that (a) the fleet customer cancels or defaults, (b) the referral involved fraud, misrepresentation, or a violation of this Agreement, or (c) the fleet deal is reversed, voided, or materially modified.' },
        ],
      },
      {
        subtitle: 'General Payment Terms',
        items: [
          { sub: '4.9', label: 'Payout Schedule.', body: 'All Commissions (Consumer and Fleet) are paid quarterly, within thirty (30) days following the end of each Payout Period (i.e., payments are issued no later than January 30, April 30, July 30, and October 30 for the preceding quarter).' },
          { sub: '4.10', label: 'Minimum Payout Threshold.', body: 'A minimum balance of twenty-five dollars ($25.00) in earned commissions (Consumer and Fleet combined) is required to trigger a payout. If your balance is below the minimum threshold at the end of a Payout Period, the balance rolls forward to the next Payout Period. Unpaid balances below the minimum threshold that remain inactive (no new Consumer Referrals or Fleet Referrals) for twelve (12) consecutive months are forfeited.' },
          { sub: '4.11', label: 'Payment Method.', body: 'Commissions are paid via Venmo, PayPal, electronic funds transfer (EFT/ACH), or another method designated by JMD at its discretion. Partner is responsible for selecting a payout method and providing accurate payout details during enrollment or through account settings. JMD is not liable for payments delayed or lost due to inaccurate payment information provided by Partner.' },
          { sub: '4.12', label: 'Currency.', body: 'All commissions are denominated and paid in U.S. dollars.' },
          { sub: '4.13', label: 'No Advances.', body: 'JMD does not provide commission advances, guaranteed minimums, or draws against future commissions.' },
          { sub: '4.14', label: 'Commission Adjustments.', body: 'JMD reserves the right to deduct, withhold, or claw back commissions previously credited or paid if JMD determines, in its sole discretion, that (a) a referral does not meet the applicable qualification criteria, (b) the commission was paid in error, (c) the referred customer\'s transaction is reversed, refunded, or charged back, (d) a fleet customer cancels or defaults after the Fleet Hold Period but before the commission is paid, or (e) the Partner violated any term of this Agreement. Partner agrees to promptly return any overpayment upon written notice from JMD.' },
          { sub: '4.15', label: 'Commission Consolidation.', body: 'Consumer Commissions and Fleet Commissions are combined into a single commission balance. There is no separate balance or payout schedule for each commission type. All commissions are subject to the same payout schedule, minimum threshold, and payment method.' },
        ],
      },
    ],
  },
  {
    title: '5. Tax Obligations',
    items: [
      { sub: '5.1', label: 'Independent Contractor.', body: 'Partner\'s relationship with JMD under this Agreement is that of an independent contractor, not an employee, agent, joint venturer, or legal partner. Partner is solely responsible for all tax obligations arising from commissions earned under this Program, including both Consumer Commissions and Fleet Commissions.' },
      { sub: '5.2', label: 'W-9 Requirement.', body: 'JMD requires a completed IRS Form W-9 (Request for Taxpayer Identification Number and Certification) from each Partner before any commission payout is processed. No payout will be issued until a valid W-9 is on file. It is Partner\'s responsibility to submit an updated W-9 if any information changes.' },
      { sub: '5.3', label: '1099-NEC Reporting.', body: 'JMD will issue an IRS Form 1099-NEC to any Partner who earns six hundred dollars ($600.00) or more in total commissions (Consumer and Fleet combined) during a calendar year, as required by federal tax law. Partner acknowledges that JMD may report commission payments to the Internal Revenue Service regardless of the amount.' },
      { sub: '5.4', label: 'Tax Withholding.', body: 'JMD does not withhold federal, state, or local income taxes, Social Security, Medicare, or any other taxes from commission payments. Partner is solely responsible for paying all applicable taxes on commission income.' },
      { sub: '5.5', label: 'Backup Withholding.', body: 'If Partner fails to provide a valid W-9 or if the IRS notifies JMD that Partner is subject to backup withholding, JMD will withhold the applicable percentage from commission payments as required by federal law.' },
    ],
  },
  {
    title: '6. Partner Conduct and Restrictions',
    items: [
      { sub: '6.1', label: 'Permitted Activities.', body: 'Partner may promote JMD through lawful means, including but not limited to personal recommendations, social media posts, blog content, email newsletters to Partner\'s own opt-in subscriber lists, and in-person conversations. All promotional activities must comply with this Agreement, applicable law, and FTC disclosure requirements.' },
      { sub: '6.2', label: 'Prohibited Activities.', body: 'Partner shall NOT:', list: [
        'Make false, misleading, deceptive, or unsubstantiated claims about JMD, its products, pricing, features, or performance.',
        'Represent or imply any affiliation with, endorsement by, or employment with JMD beyond participation in the Partner Program.',
        'Use paid search advertising (Google Ads, Bing Ads, or any search engine marketing platform) that bids on the terms "Judge My Driving," "JMD," "judgemydriving.com," or any variation or misspelling thereof.',
        'Register, purchase, or use any domain name, social media handle, or online property that contains "Judge My Driving," "JMD," or any confusingly similar variation.',
        'Send unsolicited commercial email (spam), unsolicited text messages, or make unsolicited phone calls to promote JMD in violation of the CAN-SPAM Act, the Telephone Consumer Protection Act (TCPA), or any applicable state or federal law.',
        'Use any form of cookie stuffing, click fraud, bot traffic, incentivized clicks, or artificial inflation of referral activity.',
        'Self-refer or refer entities owned, controlled, or affiliated with Partner for the purpose of earning commissions.',
        'Submit Fleet Referrals for fictitious persons, fictitious companies, or contacts who have not expressed interest in fleet monitoring.',
        'Submit Fleet Referrals for prospects already in active conversation or a contractual relationship with JMD.',
        'Contact, solicit, negotiate with, or make commitments to a fleet prospect after submitting a Fleet Referral, unless expressly authorized by JMD in writing.',
        'Represent to any prospective customer that JMD guarantees insurance premium reductions, specific safety outcomes, or any particular results.',
        'Engage in any activity that is unlawful, unethical, or that could damage JMD\'s brand, reputation, or goodwill.',
        'Modify, alter, or create derivative works from JMD\'s trademarks, logos, or marketing materials without prior written approval.',
        'Target minors (persons under 18) directly in any promotional activity.',
        'Use JMD\'s name, likeness, or brand in connection with any political, religious, or otherwise controversial content without prior written consent.',
      ]},
      { sub: '6.3', label: 'FTC Compliance.', body: 'Partner must comply with the Federal Trade Commission\'s Guides Concerning the Use of Endorsements and Testimonials in Advertising (16 CFR Part 255). This includes clearly and conspicuously disclosing the material connection between Partner and JMD in any promotional content. Example disclosures include "I earn a commission if you sign up through my link" or "#ad #affiliate." Failure to make required disclosures is a material breach of this Agreement.' },
      { sub: '6.4', label: 'Compliance Monitoring.', body: 'JMD reserves the right to monitor Partner\'s promotional activities for compliance with this Agreement. Partner agrees to provide JMD with copies of or access to any promotional materials upon request within five (5) business days.' },
    ],
  },
  {
    title: '7. Intellectual Property',
    items: [
      { sub: '7.1', label: 'Limited License.', body: 'Subject to the terms of this Agreement, JMD grants Partner a limited, non-exclusive, non-transferable, revocable license to use JMD\'s approved trademarks, logos, and marketing materials solely for the purpose of promoting JMD under the Program. This license terminates immediately upon termination of this Agreement or Partner\'s participation in the Program.' },
      { sub: '7.2', label: 'Brand Guidelines.', body: 'Partner must use JMD trademarks and logos only in the form provided by JMD and in compliance with any brand guidelines JMD provides. Partner shall not modify, distort, or alter the appearance of JMD trademarks or logos.' },
      { sub: '7.3', label: 'Ownership.', body: 'All JMD trademarks, logos, trade names, copyrights, and other intellectual property remain the sole and exclusive property of JMD. Nothing in this Agreement grants Partner any ownership interest in JMD\'s intellectual property.' },
      { sub: '7.4', label: 'Partner Content.', body: "Any promotional content created by Partner that incorporates JMD's intellectual property shall be subject to JMD's right to request removal or modification at any time. Partner will comply with such requests within forty-eight (48) hours." },
    ],
  },
  {
    title: '8. Confidentiality',
    items: [
      { sub: '8.1', label: 'Confidential Information.', body: 'Partner acknowledges that information obtained through participation in the Program, including but not limited to commission rates, referral data, conversion rates, Fleet Referral statuses, fleet prospect information, deal values, internal communications, and business strategies, constitutes confidential information of JMD ("Confidential Information").' },
      { sub: '8.2', label: 'Fleet Referral Data.', body: 'Partner shall not disclose Fleet Referral statuses, deal details, commission amounts for specific Fleet Referrals, or any information obtained through the Partner Dashboard regarding fleet prospects to any third party. This includes the referred fleet prospect themselves.' },
      { sub: '8.3', label: 'Non-Disclosure.', body: 'Partner shall not disclose Confidential Information to any third party without JMD\'s prior written consent. Partner may disclose general commission rates and general Program terms to the extent necessary for FTC compliance disclosures.' },
      { sub: '8.4', label: 'Survival.', body: 'This confidentiality obligation survives termination of this Agreement for a period of two (2) years.' },
    ],
  },
  {
    title: '9. Fleet Referral Data and Prospect Relationships',
    items: [
      { sub: '9.1', label: 'Ownership of Fleet Referral Data.', body: 'All information submitted through the Fleet Referral form, including contact names, company names, email addresses, phone numbers, estimated fleet sizes, and notes, becomes the sole property of JMD upon submission. Partner retains no ownership interest, intellectual property claim, or other right to any Fleet Referral data.' },
      { sub: '9.2', label: 'No Exclusive Rights.', body: 'Submission of a Fleet Referral does not grant Partner exclusive rights to the referred prospect. JMD may already be in contact with the prospect, may receive referrals for the same prospect from other sources, or may engage the prospect through its own outreach. JMD\'s determination of referral priority and attribution is final.' },
      { sub: '9.3', label: 'No Customer Relationship.', body: 'The fleet prospect is JMD\'s prospective customer, not Partner\'s. Partner has no customer relationship, contractual privity, or ongoing role with respect to any fleet prospect or fleet customer, whether or not the referral results in a closed deal.' },
      { sub: '9.4', label: 'Data Use.', body: 'JMD may use Fleet Referral data for any lawful business purpose, including sales, marketing, analytics, and business development, regardless of referral status or commission outcome. JMD is not required to delete, return, or restrict use of Fleet Referral data upon termination of this Agreement or at Partner\'s request.' },
      { sub: '9.5', label: 'Privacy Compliance.', body: 'Partner represents and warrants that any personal information submitted through the Fleet Referral form (a) was obtained lawfully, (b) is submitted in good faith as a business introduction, and (c) is not submitted in violation of any privacy law, confidentiality agreement, or non-solicitation obligation binding on Partner. Partner shall indemnify JMD against any claim arising from Partner\'s submission of personal data in violation of this Section.' },
    ],
  },
  {
    title: '10. Representations and Warranties',
    body: 'Partner represents and warrants that:',
    list: [
      'Partner has full legal authority to enter into this Agreement.',
      "Partner's participation in the Program and promotional activities will comply with all applicable federal, state, and local laws, rules, and regulations.",
      'Partner will not engage in any fraudulent, deceptive, or misleading practices.',
      'All information provided to JMD, including Fleet Referral data, is truthful, accurate, and complete.',
      "Partner's promotional activities will not infringe upon the intellectual property rights, privacy rights, or other rights of any third party.",
      "Partner has not entered into any agreement that would prevent or restrict Partner's participation in this Program or submission of Fleet Referrals.",
      "Fleet Referrals submitted by Partner represent genuine business introductions of prospects who, to Partner's knowledge, have a legitimate interest in or potential need for fleet driver feedback services.",
    ],
  },
  {
    title: '11. Disclaimer of Warranties',
    caps: 'THE PROGRAM IS PROVIDED "AS IS" AND "AS AVAILABLE." JMD MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. JMD DOES NOT WARRANT THAT THE PROGRAM, PARTNER PORTAL, OR PARTNER DASHBOARD WILL BE UNINTERRUPTED, ERROR-FREE, OR AVAILABLE AT ALL TIMES. JMD DOES NOT GUARANTEE ANY LEVEL OF COMMISSION EARNINGS, REFERRAL VOLUME, CONVERSION RATES, OR FLEET DEAL CLOSURES. JMD MAKES NO REPRESENTATION THAT ANY FLEET REFERRAL WILL RESULT IN A CLOSED DEAL OR COMMISSION PAYMENT.',
  },
  {
    title: '12. Limitation of Liability',
    items: [
      { sub: '12.1', label: 'Cap on Liability.', caps: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, JMD'S TOTAL AGGREGATE LIABILITY TO PARTNER UNDER THIS AGREEMENT, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, SHALL NOT EXCEED THE TOTAL COMMISSIONS ACTUALLY PAID TO PARTNER IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM." },
      { sub: '12.2', label: 'Exclusion of Damages.', caps: 'IN NO EVENT SHALL JMD BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF DATA, LOSS OF BUSINESS OPPORTUNITIES, LOSS OF EXPECTED COMMISSIONS (INCLUDING FLEET COMMISSIONS FOR REFERRALS IN PROGRESS), OR COST OF SUBSTITUTE SERVICES, REGARDLESS OF WHETHER JMD HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.' },
      { sub: '12.3', label: 'No Liability for Fleet Sales Outcomes.', caps: "JMD SHALL HAVE NO LIABILITY TO PARTNER FOR (A) JMD'S DECISION NOT TO PURSUE, CONTACT, OR CLOSE A FLEET REFERRAL, (B) THE OUTCOME OF ANY FLEET SALES PROCESS, (C) A FLEET CUSTOMER'S CANCELLATION OR DEFAULT DURING OR AFTER THE FLEET HOLD PERIOD, OR (D) JMD'S DECISION TO APPROVE OR DENY A FLEET COMMISSION." },
      { sub: '12.4', label: 'Essential Basis.', caps: 'THE LIMITATIONS AND EXCLUSIONS IN THIS SECTION REFLECT A REASONABLE ALLOCATION OF RISK AND ARE A FUNDAMENTAL ELEMENT OF THE BASIS OF THE BARGAIN BETWEEN THE PARTIES. JMD WOULD NOT ENTER INTO THIS AGREEMENT WITHOUT THESE LIMITATIONS.' },
    ],
  },
  {
    title: '13. Indemnification',
    items: [
      { sub: '13.1', label: 'Partner Indemnification.', body: 'Partner shall indemnify, defend, and hold harmless JMD, its officers, directors, employees, agents, successors, and assigns from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys\' fees) arising out of or related to:', list: [
        "Partner's breach of any term of this Agreement.",
        "Partner's promotional activities or marketing practices.",
        "Partner's violation of any applicable law, rule, or regulation.",
        "Any claim that Partner's promotional content infringes or violates the rights of any third party.",
        "Partner's submission of Fleet Referral data, including any claim by a referred prospect or third party that Partner's submission violated privacy laws, confidentiality agreements, or non-solicitation obligations.",
        "Partner's unauthorized contact with or representations to a fleet prospect.",
        "Partner's negligence or willful misconduct.",
      ]},
      { sub: '13.2', label: 'Procedure.', body: 'JMD will provide Partner with prompt written notice of any claim for which indemnification is sought. JMD reserves the right to assume exclusive control of the defense of any claim at its own expense. Partner shall cooperate fully with JMD in the defense of any such claim.' },
    ],
  },
  {
    title: '14. Term and Termination',
    items: [
      { sub: '14.1', label: 'Term.', body: 'This Agreement is effective upon Partner\'s enrollment in the Program (whether through external enrollment or in-app opt-in) and continues until terminated by either party.' },
      { sub: '14.2', label: 'Termination by Partner.', body: 'Partner may terminate this Agreement at any time by providing written notice to partners@judgemydriving.com. Upon termination:', list: [
        'Consumer Commissions for Consumer Referrals that have cleared the thirty (30) day hold period and meet the minimum payout threshold will be paid on the next scheduled quarterly payout date.',
        'Fleet Commissions for Fleet Referrals that have already reached "Commission Approved" status and meet the minimum payout threshold will be paid on the next scheduled quarterly payout date.',
        'Fleet Referrals that have not yet reached "Commission Approved" status at the time of termination are forfeited. No Fleet Commission will be paid for referrals still in Submitted, Contacted, Deal Closed, or 90-Day Hold status at the time of Partner\'s voluntary termination.',
      ]},
      { sub: '14.3', label: 'Termination by JMD.', body: 'JMD may terminate this Agreement or suspend Partner\'s participation at any time, for any reason or no reason, with or without cause, and with or without notice. JMD may immediately terminate this Agreement without notice for:', list: [
        'Breach of any term of this Agreement.',
        'Fraudulent, deceptive, or illegal activity.',
        'Submission of fraudulent or fictitious Fleet Referrals.',
        'Unauthorized contact with or representations to fleet prospects.',
        "Conduct that harms or threatens to harm JMD's brand, reputation, or business interests.",
        'Inactivity (no Consumer Referrals or Fleet Referrals) for twelve (12) consecutive months.',
      ]},
      { sub: '14.4', label: 'Effect of Termination.', body: 'Upon termination:', list: [
        "Partner's Referral Link and Referral Code are immediately deactivated.",
        "Partner's license to use JMD intellectual property is immediately revoked.",
        "Partner's access to the Partner Portal and Partner Dashboard is immediately revoked.",
        'Partner must immediately cease all promotional activities on behalf of JMD and remove or disable all JMD promotional content within ten (10) business days.',
        'Commissions for Consumer Referrals that have cleared the hold period and Fleet Referrals that have reached "Commission Approved" status, provided they meet the minimum payout threshold, will be paid on the next scheduled quarterly payout date, except as provided in (f).',
        'If terminated for cause under Section 14.3(a), (b), (c), (d), or (e), JMD reserves the right to forfeit all unpaid commissions, including both Consumer Commissions and Fleet Commissions.',
      ]},
      { sub: '14.5', label: 'Effect of Termination on In-App Partners.', body: 'For Partners who enrolled via the in-app opt-in (Section 2.2(b)), termination of Partner status removes the Partner Dashboard toggle and revokes access to all Partner features. The Partner\'s underlying JMD subscription (Individual, Family, or Fleet) is unaffected unless separately terminated.' },
      { sub: '14.6', label: 'Program Discontinuation.', body: 'JMD reserves the right to discontinue the entire Partner Program at any time with thirty (30) days written notice to active Partners. In the event of Program discontinuation, JMD will pay all Consumer Commissions earned and cleared and all Fleet Commissions that have reached "Commission Approved" status prior to the discontinuation date, on the next scheduled quarterly payout.' },
    ],
  },
  {
    title: '15. Modifications',
    items: [
      { sub: '15.1', label: 'Right to Modify.', body: 'JMD reserves the right to modify this Agreement, commission rates (Consumer and Fleet), payout thresholds, payout schedules, hold periods, Program rules, and any other aspect of the Program at any time. Modifications will be communicated via email to the address on file in Partner\'s account or posted on the Partner Portal or Partner Dashboard.' },
      { sub: '15.2', label: 'Acceptance of Modifications.', body: "Continued participation in the Program after notification of modifications constitutes acceptance of the modified terms. If Partner does not agree to the modified terms, Partner's sole remedy is to terminate participation in the Program pursuant to Section 14.2." },
      { sub: '15.3', label: 'Commission Rate Changes.', body: 'Changes to commission rates apply to referrals occurring after the effective date of the change. For Fleet Referrals, the commission rate in effect at the time of Fleet Referral submission governs the commission amount for that referral, regardless of when the deal closes or commission is approved.' },
    ],
  },
  {
    title: '16. Dispute Resolution',
    items: [
      { sub: '16.1', label: 'Governing Law.', body: 'This Agreement shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia, without regard to its conflict of law principles.' },
      { sub: '16.2', label: 'Informal Resolution.', body: 'Before initiating any formal dispute resolution, the parties shall attempt in good faith to resolve any dispute through informal negotiation. The party raising the dispute shall send a written notice describing the dispute to the other party. The parties shall have thirty (30) days from receipt of the notice to attempt resolution.' },
      { sub: '16.3', label: 'Binding Arbitration.', body: 'If informal resolution fails, any dispute, claim, or controversy arising out of or relating to this Agreement shall be resolved by binding arbitration administered by the American Arbitration Association ("AAA") under its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator in Alexandria, Virginia. The arbitrator\'s award shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.' },
      { sub: '16.4', label: 'Class Action Waiver.', caps: 'PARTNER AGREES THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. PARTNER WAIVES THE RIGHT TO PARTICIPATE IN OR BRING CLAIMS AS A MEMBER OF A CLASS OR IN ANY PURPORTED CLASS ACTION OR REPRESENTATIVE PROCEEDING.' },
      { sub: '16.5', label: 'Costs.', body: "Each party shall bear its own costs and attorneys' fees in connection with any dispute, unless the arbitrator determines that a party's claims or defenses were frivolous, in which case the arbitrator may award reasonable attorneys' fees to the prevailing party." },
      { sub: '16.6', label: 'Injunctive Relief.', body: 'Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights or confidential information without first submitting to arbitration.' },
      { sub: '16.7', label: 'Statute of Limitations.', body: 'Any claim arising under this Agreement must be brought within one (1) year of the date the claimant knew or should have known of the claim, or the claim is permanently barred.' },
    ],
  },
  {
    title: '17. General Provisions',
    items: [
      { sub: '17.1', label: 'Entire Agreement.', body: 'This Agreement constitutes the entire agreement between the parties with respect to the Program and supersedes all prior or contemporaneous communications, representations, and agreements, whether oral or written.' },
      { sub: '17.2', label: 'Severability.', body: 'If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.' },
      { sub: '17.3', label: 'Waiver.', body: 'The failure of JMD to enforce any right or provision of this Agreement shall not constitute a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative of JMD.' },
      { sub: '17.4', label: 'Assignment.', body: "Partner may not assign or transfer this Agreement or any rights or obligations hereunder without JMD's prior written consent. JMD may assign this Agreement without restriction, including in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of its assets." },
      { sub: '17.5', label: 'No Third-Party Beneficiaries.', body: 'This Agreement does not create any third-party beneficiary rights. Fleet prospects referred by Partner are not third-party beneficiaries of this Agreement and have no rights or claims under it.' },
      { sub: '17.6', label: 'Notices.', body: 'Notices to JMD shall be sent to partners@judgemydriving.com. Notices to Partner shall be sent to the email address on file in Partner\'s account. Email notice is deemed received twenty-four (24) hours after sending.' },
      { sub: '17.7', label: 'Force Majeure.', body: 'JMD shall not be liable for any failure or delay in performing its obligations under this Agreement due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, pandemics, government actions, internet outages, or third-party service provider failures.' },
      { sub: '17.8', label: 'Relationship of Parties.', body: 'Nothing in this Agreement creates a partnership, joint venture, employment, franchise, or agency relationship between Partner and JMD. Partner has no authority to bind JMD to any contract, obligation, or commitment. Partner has no authority to negotiate, accept, or modify terms on behalf of JMD with any third party, including fleet prospects.' },
      { sub: '17.9', label: 'Headings.', body: 'Section headings are for convenience only and shall not affect the interpretation of this Agreement.' },
      { sub: '17.10', label: 'Survival.', body: 'Sections 5, 7.3, 8, 9, 11, 12, 13, 16, and 17 shall survive termination of this Agreement.' },
    ],
  },
];

function ItemBlock({ item }) {
  if (!item.sub && !item.label) {
    return <p className="text-zinc-300 text-sm leading-relaxed ml-6 mt-1">{item.body}</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-zinc-300 text-sm leading-relaxed">
        {item.sub && <span className="text-zinc-500 font-semibold mr-2">{item.sub}</span>}
        {item.label && <span className="text-zinc-200 font-semibold">{item.label}</span>}
        {item.body && <span className="text-zinc-300"> {item.body}</span>}
        {item.caps && <span className="block mt-1 text-zinc-400 text-xs font-mono leading-relaxed">{item.caps}</span>}
      </p>
      {item.list && (
        <ul className="space-y-2 text-zinc-300 text-sm leading-relaxed list-none ml-6">
          {item.list.map((li, j) => (
            <li key={j} className="flex gap-3">
              <span className="text-primary font-bold shrink-0">({String.fromCharCode(97 + j)})</span>
              <span>{li}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionBlock({ section }) {
  if (section.preamble) {
    return (
      <div className="space-y-3">
        <p className="text-zinc-300 text-sm leading-relaxed">{section.preamble}</p>
        {section.warning && (
          <p className="text-primary font-semibold text-sm border border-primary/30 bg-primary/10 rounded-lg px-4 py-3">
            {section.warning}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {section.title && (
        <h2 className="text-base font-bold text-primary uppercase tracking-wide">
          {section.title}
        </h2>
      )}
      {section.body && <p className="text-zinc-300 text-sm leading-relaxed">{section.body}</p>}
      {section.caps && <p className="text-zinc-400 text-xs leading-relaxed font-mono">{section.caps}</p>}
      {section.defs && (
        <div className="space-y-3">
          {section.defs.map((d, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-primary font-bold shrink-0">{d.term}</span>
              <span className="text-zinc-300 leading-relaxed">{d.def}</span>
            </div>
          ))}
        </div>
      )}
      {section.list && (
        <ul className="space-y-2 text-zinc-300 text-sm leading-relaxed list-none">
          {section.list.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span className="text-primary font-bold shrink-0">{j + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {section.items && (
        <div className="space-y-4">
          {section.items.map((item, i) => <ItemBlock key={i} item={item} />)}
        </div>
      )}
      {section.subsections && (
        <div className="space-y-5">
          {section.subsections.map((sub, i) => (
            <div key={i} className="space-y-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">{sub.subtitle}</p>
              <div className="space-y-4">
                {sub.items.map((item, j) => <ItemBlock key={j} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PartnerTerms() {
  return (
    <div className="min-h-screen bg-zinc-900 font-inter px-5 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <img
            src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg"
            alt="Judge My Driving"
            className="h-28 w-auto"
          />
          <div className="flex items-start gap-3">
            <FileText className="w-7 h-7 text-primary shrink-0 mt-0.5" />
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Partner Program Terms and Conditions
              </h1>
              <p className="text-zinc-500 text-xs mt-1">Effective Date: April 2, 2026 · Last Updated: April 2, 2026</p>
            </div>
          </div>
        </div>

        {SECTIONS.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}

        <div className="pt-4 space-y-3 border-t border-zinc-800">
          <p className="text-primary font-semibold text-sm">
            By enrolling in the Judge My Driving Partner Program, whether through external signup or in-app opt-in, you acknowledge that you have read this Agreement in its entirety, understand its terms, and agree to be legally bound by it.
          </p>
          <p className="text-zinc-500 text-sm">
            Questions? <a href="mailto:partners@judgemydriving.com" className="text-primary hover:underline">partners@judgemydriving.com</a>
          </p>
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Judge My Driving. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}