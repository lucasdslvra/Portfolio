import type { MetadataRoute } from 'next';
import { CATEGORIES, getProjects } from '@/lib/projects';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects();
  const latest = projects.reduce((max, p) => (p.date > max ? p.date : max), projects[0]?.date ?? new Date().toISOString());
  const usedCategories = CATEGORIES.filter((c) => projects.some((p) => p.category === c.key));

  return [
    { url: `${SITE_URL}/`, lastModified: latest, priority: 1 },
    { url: `${SITE_URL}/projets`, lastModified: latest, priority: 0.8 },
    ...usedCategories.map((c) => ({ url: `${SITE_URL}/projets?cat=${c.key}`, lastModified: latest, priority: 0.4 })),
    ...projects.map((p) => ({ url: `${SITE_URL}${p.href}`, lastModified: p.date, priority: 0.7 })),
    { url: `${SITE_URL}/contact`, lastModified: latest, priority: 0.5 },
  ];
}
