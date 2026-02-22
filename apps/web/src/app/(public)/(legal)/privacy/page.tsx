import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { legalContent } from '@/config/legal';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description:
    'Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return <LegalPage {...legalContent.privacy} />;
}
