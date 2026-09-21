import type { Metadata } from 'next';
import Link from 'next/link';
import { getBusinesses, getBusinessCount } from '@/lib/data';
import BusinessCardComponent from '@/components/BusinessCardComponent';
import BusinessSearchFilters from '@/components/BusinessSearchFilters';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'All Businesses in Enugu State',
  description: 'Browse all verified local businesses in Enugu State, Nigeria. Filter by category, city, and more.',
};

interface SearchParams {
  q?: string;
  category?: string;
  city?: string;
  featured?: string;
  page?: string;
  lat?: string;
  lng?: string;
  minRating?: string;
  openNow?: string;
}

const PAGE_SIZE = 24;

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, category, city, featured, page: pageParam, lat, lng, minRating, openNow } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const [businesses, totalCount] = await Promise.all([
    getBusinesses({
      categorySlug: category,
      citySlug: city,
      featured: featured === 'true' ? true : undefined,
      searchQuery: q?.trim() || undefined,
      page,
      limit: PAGE_SIZE,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      openNow: openNow === 'true',
    }),
    getBusinessCount({
      categorySlug: category,
      citySlug: city,
      searchQuery: q?.trim() || undefined,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filterLabel = category
    ? category.replace(/-/g, ' ')
    : city
    ? `in ${city.replace(/-/g, ' ')}`
    : 'All Businesses';

  // Build base query string (without page) for pagination links
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (featured) params.set('featured', featured);
    if (lat) params.set('lat', lat);
    if (lng) params.set('lng', lng);
    if (minRating) params.set('minRating', minRating);
    if (openNow) params.set('openNow', openNow);
    params.set('page', String(p));
    return `/businesses?${params.toString()}`;
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>Businesses</span>
          </nav>
          <h1 className={styles.title} style={{ textTransform: 'capitalize' }}>
            {filterLabel}
          </h1>
          <p className={styles.count}>
            {totalCount} {totalCount === 1 ? 'business' : 'businesses'} found
            {q ? ` for "${q}"` : ''}
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search bar */}
        <BusinessSearchFilters />

        {/* Results */}
        {businesses.length > 0 ? (
          <>
            <div className="grid-auto" role="list" aria-label="Business listings">
              {businesses.map((biz, i) => (
                <div key={biz.id} role="listitem" className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <BusinessCardComponent business={biz} priority={i < 3} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Pagination">
                {page > 1 && (
                  <Link href={buildPageUrl(page - 1)} className="btn btn-outline btn-sm" id="pagination-prev">
                    ← Previous
                  </Link>
                )}
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={buildPageUrl(page + 1)} className="btn btn-outline btn-sm" id="pagination-next">
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">🔍</span>
            <p className="empty-state__title">No businesses found</p>
            <p className="empty-state__desc">
              Try a different search term or{' '}
              <Link href="/businesses" style={{ color: 'var(--color-primary)' }}>
                browse all businesses
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
