import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { legalContent } from '@/config/legal';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = {
  title: `Terms of Service - ${siteConfig.name}`,
  description:
    'Terms of Service - Read our terms and conditions for using our platform.',
};

export default function TermsPage() {
  return <LegalPage {...legalContent.terms} />;
}
