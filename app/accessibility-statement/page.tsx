import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { ACCESSIBILITY } from '@/content/legal';

export const metadata: Metadata = { title: ACCESSIBILITY.meta.title, description: ACCESSIBILITY.meta.description };

export default function AccessibilityStatementPage() {
  return <LegalPage n={ACCESSIBILITY.n} title={ACCESSIBILITY.title} blocks={ACCESSIBILITY.blocks} />;
}
