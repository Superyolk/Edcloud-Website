import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { PRIVACY } from '@/content/legal';

export const metadata: Metadata = { title: PRIVACY.meta.title, description: PRIVACY.meta.description };

export default function PrivacyPolicyPage() {
  return <LegalPage n={PRIVACY.n} title={PRIVACY.title} blocks={PRIVACY.blocks} />;
}
