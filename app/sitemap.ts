import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.a25.mk';

// Generated at /sitemap.xml. The site is currently a single indexable route;
// this grows as real routes are added in later phases.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
