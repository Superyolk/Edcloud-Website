import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageMeta } from '@/content/seo';
import { ACCESSIBILITY } from '@/content/legal';

export const metadata: Metadata = pageMeta({
  title: ACCESSIBILITY.meta.title,
  description: ACCESSIBILITY.meta.description,
  path: '/accessibility-statement',
});

export default function AccessibilityStatementPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd('Accessibility Statement', '/accessibility-statement')} />
      <LegalPage n={ACCESSIBILITY.n} title={ACCESSIBILITY.title} blocks={ACCESSIBILITY.blocks} />
    </>
  );
}
