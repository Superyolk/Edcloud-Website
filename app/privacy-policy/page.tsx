import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageMeta } from '@/content/seo';
import { PRIVACY } from '@/content/legal';

export const metadata: Metadata = pageMeta({
  title: PRIVACY.meta.title,
  description: PRIVACY.meta.description,
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd('Privacy Policy', '/privacy-policy')} />
      <LegalPage n={PRIVACY.n} title={PRIVACY.title} blocks={PRIVACY.blocks} />
    </>
  );
}
