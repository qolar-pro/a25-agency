import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.a25.mk';

// Generated at /robots.txt. Allow all crawlers now that real per-route HTML
// is server-rendered, and point them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
