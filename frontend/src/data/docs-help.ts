import { Book, FileText, Video } from 'lucide-react';

// FAQ 데이터
export const faqs = [
  {
    question: 'How do I start a new project?',
    answer:
      "To start a new project, navigate to the Projects page and click on the 'New Project' button. Follow the guided setup process to configure your project settings and upload your pathology images.",
  },
  {
    question: 'What file formats are supported for image upload?',
    answer:
      'PathOs supports standard whole slide image formats including .SVS, .TIFF, .NDPI, and .SCN. The maximum file size per image is 2GB, and you can upload up to 100 images per project.',
  },
  {
    question: 'How does the AI annotation assistance work?',
    answer:
      'Our AI annotation assistance uses pre-trained models to suggest annotations on your pathology images. You can accept, modify, or reject these suggestions. The system learns from your corrections to improve future suggestions.',
  },
  {
    question: 'Can I share my models with other researchers?',
    answer:
      'Yes, you can share your trained models through our Public Space. You can control the visibility and access permissions for each model you share, allowing for both private collaborations and public contributions.',
  },
  {
    question: 'What security measures are in place to protect my data?',
    answer:
      'PathOs employs end-to-end encryption, secure cloud storage, and strict access controls to protect your data. We are HIPAA compliant and follow industry best practices for medical data security and privacy.',
  },
];

// 문서 카테고리
export const docCategories = [
  {
    title: 'Getting Started',
    description:
      'Learn the basics of navigating the platform and setting up your first project',
    icon: Book,
    link: '/docs/getting-started',
  },
  {
    title: 'User Guide',
    description: 'Comprehensive documentation for using PathOs features',
    icon: FileText,
    link: '/docs/user-guide',
  },
  {
    title: 'Video Tutorials',
    description: 'Visual guides for learning PathOs features',
    icon: Video,
    link: '/docs/videos',
  },
];
