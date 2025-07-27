
import { MetadataRoute } from 'next';
import { resourcesList } from '@/resources/resourcesList';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://theinsurancehawk.com';

  // Static pages
  const staticRoutes = [
    '/',
    '',
    '/recommendations',
    '/provider-lookup',
    '/health-quotes',
    '/quotes',
    '/compare-plans',
    '/apply',
    '/documents',
    '/education',
    '/resources',
    '/settings',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1 : 0.8,
  }));

  // Dynamic article pages
  const articleRoutes = resourcesList
    .filter(resource => resource.slug)
    .map(resource => ({
      url: `${baseUrl}/resources/${resource.slug}`,
      lastModified: new Date(), // Ideally, you'd have a date in your resource data
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...articleRoutes];
}
