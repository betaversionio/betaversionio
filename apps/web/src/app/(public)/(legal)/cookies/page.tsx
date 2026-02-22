import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { legalContent } from '@/config/legal';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = {
  title: `Cookie Policy - ${siteConfig.name}`,
  description:
    'Cookie Policy - Learn how we use cookies and similar technologies.',
};

export default function CookiesPage() {
  return <LegalPage {...legalContent.cookies} />;
}
