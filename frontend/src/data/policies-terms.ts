import { CheckCircle, Clock, HelpCircle } from 'lucide-react';

export const policiesTermsData = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'May 13, 2025',
    icon: 'FileText',
    sections: [
      {
        heading: '1. Purpose',
        body: 'This agreement defines the rights, obligations, and responsibilities between PathOs and users in relation to the use of the Human-in-the-loop based end-to-end no-code pathology AI service provided by PathOs.',
      },
      {
        heading: '2. Definitions',
        body: 'Key terms include Service (the AI platform provided), User (anyone using the service), Member (registered user), WSI (Whole Slide Images), Annotation (manual region labeling), and Custom Model (trained segmentation model).',
      },
      {
        heading: '3. Service Provision and Changes',
        body: 'PathOs provides project management, annotation, and model training tools via a front-end interface. The service may change or be discontinued with prior notice. The company is not liable for losses due to changes.',
      },
      {
        heading: '4. Membership and Account',
        body: 'Users must register truthfully. Members are responsible for account security and should report misuse immediately.',
      },
      {
        heading: '5. Fees',
        body: 'Core features are free. Advanced features (large file support, priority support) may be charged. Separate pricing and refund policies apply.',
      },
      {
        heading: '6. User Obligations',
        body: 'Users must not misuse the service, provide false data, violate rights, or upload illegal content. They are responsible for all activity under their account.',
      },
      {
        heading: '7. Intellectual Property',
        body: 'All service content and software belong to PathOs. Users must not reuse content commercially without permission.',
      },
      {
        heading: '8. Personal Data',
        body: 'User data is managed according to the Privacy Policy. This includes collection, use, retention, and disposal.',
      },
      {
        heading: '9. Disclaimer',
        body: 'PathOs is not responsible for force majeure, user fault, data loss, or disputes between users.',
      },
      {
        heading: '10. Suspension & Termination',
        body: 'Violation of the terms may result in suspension or account termination. Users may withdraw via the member withdrawal feature.',
      },
      {
        heading: '11. Dispute Resolution',
        body: "Disputes are subject to Korean law and jurisdiction lies with the company's headquarters.",
      },
      {
        heading: '12. Miscellaneous',
        body: 'This agreement is subject to Korean law. Matters not specified are governed by relevant laws and customs. Changes will be announced.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'May 13, 2025',
    icon: 'Lock',
    sections: [
      {
        heading: '1. Collected Information',
        body: 'We collect name, email, institution, IP address, WSI images, and usage data.',
      },
      {
        heading: '2. Purpose of Use',
        body: 'Data is used for annotation, model training, platform enhancement, and user support.',
      },
      {
        heading: '3. Storage & Security',
        body: 'Data is encrypted via TLS 1.3 during transfer and AES-256 at rest, stored on AWS.',
      },
      {
        heading: '4. User Rights',
        body: 'Users can request access, updates, or deletion of their data via privacy@pathos.com.',
      },
      {
        heading: '5. Sharing & Disclosure',
        body: 'Data may be shared with subprocessors or legally required authorities. All transfers follow data protection standards.',
      },
      {
        heading: '6. Policy Updates',
        body: 'Privacy Policy may change. Users will be notified of material changes via the platform or email.',
      },
    ],
  },
  data: {
    title: 'Data Processing Agreement',
    lastUpdated: 'May 13, 2025',
    icon: 'Users',
    sections: [
      {
        heading: '1. Roles & Responsibilities',
        body: 'The user acts as Data Controller and PathOs acts as Data Processor under this agreement.',
      },
      {
        heading: '2. Scope of Processing',
        body: 'Data is processed only as necessary to deliver the services, including annotation storage, model training, and analysis.',
      },
      {
        heading: '3. Confidentiality',
        body: 'Personnel involved in data processing are bound by confidentiality agreements or statutory duties.',
      },
      {
        heading: '4. Sub-processors',
        body: 'We use authorized sub-processors such as AWS. Users are informed of changes, and data protection agreements are enforced.',
      },
      {
        heading: '5. Data Subject Requests',
        body: 'PathOs supports the Controller in fulfilling obligations to data subjects under applicable laws.',
      },
      {
        heading: '6. Termination & Deletion',
        body: 'Upon request or termination, personal data will be deleted unless retention is legally required.',
      },
    ],
  },
  security: {
    title: 'Security Policy',
    lastUpdated: 'May 13, 2025',
    icon: 'Shield',
    sections: [
      {
        heading: '1. Infrastructure',
        body: 'PathOs operates on secure AWS infrastructure with dedicated EC2 instances and S3 for storage.',
      },
      {
        heading: '2. Encryption',
        body: 'All data in transit is encrypted via TLS 1.3; data at rest is encrypted using AES-256.',
      },
      {
        heading: '3. Access Control',
        body: 'Strict access control policies apply. Internal systems require MFA and least-privilege access.',
      },
      {
        heading: '4. Monitoring & Response',
        body: 'System activity is logged, and anomalies are monitored. Incident response protocols are in place.',
      },
      {
        heading: '5. Employee Training',
        body: 'All staff receive regular security and privacy training, including secure coding practices.',
      },
      {
        heading: '6. Compliance',
        body: 'PathOs is designed to align with GDPR, HIPAA, and other relevant regulations.',
      },
    ],
  },
};

export const policyInfoCardData = [
  {
    icon: Clock,
    title: 'Policy Updates',
    description:
      'We regularly review and update our policies to ensure they remain current with the latest regulations and best practices.',
    haveButton: false,
  },
  {
    icon: CheckCircle,
    title: 'Compliance',
    description:
      'PathOs is compliant with HIPAA, GDPR, and other relevant regulations to ensure the highest standards of data protection.',
    haveButton: false,
  },
  {
    icon: HelpCircle,
    title: 'Questions?',
    description:
      'If you have any questions about our policies or terms, our team is here to help.',
    haveButton: true,
  },
];
