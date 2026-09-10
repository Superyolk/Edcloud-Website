// Privacy Policy and Accessibility Statement — the live edcloud.org copy, verbatim.
export type LegalBlock = { tag: 'h3'; text: string } | { tag: 'p'; text: string } | { tag: 'ul'; items: string[] };

export const PRIVACY = {
  meta: { title: 'Privacy Policy | EdCloud Venture Partners', description: 'How EdCloud Venture Partners collects, uses, shares, and protects information, and your rights.' },
  n: '01',
  title: 'Privacy Policy',
  blocks: [
    { tag: 'h3', text: 'Information we collect' },
    { tag: 'ul', items: [
      'Information you provide: contact details, company information, messages, and content you submit via forms, email, or meetings.',
      'Automatic data: IP address, device/browser type, pages viewed, and engagement data collected via cookies or similar technologies.',
      'Business contacts: professional details we receive from referrals, events, or public sources (e.g., LinkedIn) to communicate about our services.',
    ] },
    { tag: 'h3', text: 'How we use information' },
    { tag: 'ul', items: [
      'Provide, maintain, and improve the website and our services',
      'Respond to inquiries, schedule meetings, and deliver proposals',
      'Analyze site traffic and measure the effectiveness of our content',
      'Detect, prevent, and address security or technical issues',
      'Comply with legal obligations',
    ] },
    { tag: 'h3', text: 'Cookies and analytics' },
    { tag: 'p', text: 'We use cookies and similar technologies for site functionality and analytics (e.g., to understand which pages are most useful). You can control cookies through your browser settings. If we use third-party analytics providers, they may process limited personal data on our behalf in accordance with their own policies.' },
    { tag: 'h3', text: 'Sharing of information' },
    { tag: 'p', text: 'We do not sell personal information. We share information only with:' },
    { tag: 'ul', items: [
      'Service providers/contractors who perform services for us (hosting, analytics, communications) under appropriate confidentiality terms;',
      'Professional advisors (legal, accounting) as needed;',
      'Authorities when required by law or to protect rights, safety, or security;',
      'Business transfers in the event of a merger, acquisition, or similar transaction.',
    ] },
    { tag: 'h3', text: 'Data retention' },
    { tag: 'p', text: 'We retain information as long as necessary for the purposes above, to comply with legal obligations, resolve disputes, and enforce agreements.' },
    { tag: 'h3', text: 'Your rights' },
    { tag: 'p', text: 'Depending on your location, you may have rights to access, correct, or delete personal information, to object to or restrict processing, or to request portability. California residents may have additional rights under the CCPA/CPRA. To exercise rights, contact us at privacy@edcloud.org.' },
    { tag: 'h3', text: 'International transfers' },
    { tag: 'p', text: 'If you access the site from outside the United States, your information may be processed in the U.S. We use appropriate safeguards where required by law.' },
    { tag: 'h3', text: 'Security' },
    { tag: 'p', text: 'We employ reasonable administrative, technical, and physical safeguards designed to protect information. No system is perfectly secure.' },
    { tag: 'h3', text: 'Children’s privacy' },
    { tag: 'p', text: 'Our site and services are intended for business and government use and are not directed to children under 18.' },
    { tag: 'h3', text: 'Changes to this Policy' },
    { tag: 'p', text: 'We may update this Policy from time to time. The “Effective date” reflects the latest version.' },
    { tag: 'h3', text: 'Contact' },
    { tag: 'p', text: 'Questions? Email privacy@edcloud.org' },
  ] as LegalBlock[],
};

export const ACCESSIBILITY = {
  meta: { title: 'Accessibility Statement | EdCloud Venture Partners', description: 'EdCloud is committed to providing a website that is accessible to the widest possible audience, conforming to WCAG 2.2 Level AA.' },
  n: '01',
  title: 'Accessibility Statement',
  blocks: [
    { tag: 'p', text: 'This statement was last updated on September 3, 2025' },
    { tag: 'p', text: 'EdCloud is committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability. We strive to conform to WCAG 2.2 Level AA standards.' },
    { tag: 'h3', text: 'What we’re doing' },
    { tag: 'ul', items: [
      'Designing with semantic HTML, proper headings, and descriptive link text',
      'Providing text alternatives for non-text content (alt text, captions where applicable)',
      'Ensuring sufficient color contrast and keyboard navigability',
      'Avoiding content that flashes or causes seizures',
      'Testing changes against accessibility guidelines and assistive technologies',
    ] },
    { tag: 'h3', text: 'Compatibility' },
    { tag: 'p', text: 'Our site is designed to work with current versions of major browsers. Some features may degrade gracefully in older browsers.' },
    { tag: 'h3', text: 'Known limitations' },
    { tag: 'p', text: 'Despite our best efforts, some content may not yet meet all accessibility requirements (e.g., legacy images without alt text or third-party embeds). We are actively improving these areas.' },
    { tag: 'h3', text: 'Feedback' },
    { tag: 'p', text: 'If you experience any difficulty accessing content on edcloud.org, please contact us: accessibility@edcloud.org. Please include the page URL and a description of the problem, and we’ll do our best to resolve it promptly.' },
    { tag: 'h3', text: 'Formal approval' },
    { tag: 'p', text: 'This statement was prepared by EdCloud and is reviewed periodically as our site evolves.' },
  ] as LegalBlock[],
};
