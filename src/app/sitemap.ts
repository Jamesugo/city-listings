import type { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/build-client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://naijalist.com.ng';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createBuildClient();

  const [businesses, categories, cities] = await Promise.all([
    supabase.from('businesses').select('slug, updated_at').eq('is_active', true),
    supabase.from('categories').select('slug'),
    supabase.from('cities').select('slug'),
  ]);

  const businessEntries: MetadataRoute.Sitemap = (businesses.data ?? []).map((b) => ({
    url: `${BASE_URL}/businesses/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories.data ?? []).map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const cityEntries: MetadataRoute.Sitemap = (cities.data ?? []).map((c) => ({
    url: `${BASE_URL}/cities/${c.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/businesses`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/cities`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/list-business`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  return [...staticPages, ...businessEntries, ...categoryEntries, ...cityEntries];
}
