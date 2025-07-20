
import { MetadataRoute } from 'next';
import { resourcesList } from '@/resources/resourcesList';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hawknest.com'; // Replace with your actual domain

  // Static pages
  const staticRoutes = [
    '/',
    '/dashboard',
    '/dashboard/recommendations',
    '/dashboard/provider-lookup',
    '/dashboard/health-quotes',
    '/dashboard/quotes',
    '/dashboard/compare-plans',
    '/dashboard/apply',
    '/dashboard/documents',
    '/dashboard/education',
    '/dashboard/resources',
    '/dashboard/settings',
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
      url: `${baseUrl}/dashboard/resources/${resource.slug}`,
      lastModified: new Date(), // Ideally, you'd have a date in your resource data
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...articleRoutes];
}
