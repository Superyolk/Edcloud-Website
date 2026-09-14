import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/seo';

// `output: 'export'` needs the route pinned to build time.
export const dynamic = 'force-static';

/**
 * Generates /sitemap.xml at build time, so `lastModified` is the date the site was actually
 * deployed rather than a hand-maintained value that quietly goes stale.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '/', changeFrequency: 'monthly', priority: 1 },
    { path: '/services-and-results', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/accessibility-statement', changeFrequency: 'yearly', priority: 0.2 },
  ];
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
