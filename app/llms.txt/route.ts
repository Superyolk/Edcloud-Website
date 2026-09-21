import { buildLlmsTxt } from '@/content/llms';

// Rendered once at build time into out/llms.txt, like the sitemap. Without this the export
// would refuse the route.
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
