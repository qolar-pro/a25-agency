import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.a25.mk';

// Generated at /robots.txt. Allow all crawlers now that real per-route HTML
// is server-rendered, and point them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The lead archive and the per-client tracking pages list real people.
      // They're behind auth / an unguessable token respectively, but keeping
      // them out of the crawl removes any chance of a URL leaking into an index.
      disallow: ['/admin', '/admin/', '/track/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
