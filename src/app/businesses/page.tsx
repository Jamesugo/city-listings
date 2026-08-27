import type { Metadata } from 'next';
import Link from 'next/link';
import { getBusinesses } from '@/lib/data';
import BusinessCardComponent from '@/components/BusinessCardComponent';
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
}

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, category, city, featured } = await searchParams;

  let businesses = await getBusinesses({
    categorySlug: category,
    citySlug: city,
    featured: featured === 'true' ? true : undefined,
  });

  // Client-side text filter (search)
  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    businesses = businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.categoryName.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query) ||
        b.cityName.toLowerCase().includes(query)
    );
  }

  const filterLabel = category
    ? category.replace(/-/g, ' ')
    : city
    ? `in ${city.replace(/-/g, ' ')}`
    : 'All Businesses';

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
            {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
            {q ? ` for "${q}"` : ''}
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search bar */}
        <form action="/businesses" method="GET" className={styles.filterBar} role="search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            id="businesses-search"
            className={`form-input ${styles.searchInput}`}
            placeholder="Search businesses…"
            aria-label="Search businesses"
          />
          {category && <input type="hidden" name="category" value={category} />}
          {city && <input type="hidden" name="city" value={city} />}
          <button type="submit" className="btn btn-primary" id="businesses-search-btn">
            Search
          </button>
          {(q || category || city) && (
            <Link href="/businesses" className="btn btn-ghost btn-sm" id="clear-filters-btn">
              Clear filters
            </Link>
          )}
        </form>

        {/* Results */}
        {businesses.length > 0 ? (
          <div className="grid-auto" role="list" aria-label="Business listings">
            {businesses.map((biz, i) => (
              <div key={biz.id} role="listitem" className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <BusinessCardComponent business={biz} priority={i < 3} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">🔍</span>
            <p className="empty-state__title">No businesses found</p>
            <p className="empty-state__desc">
              Try a different search term or{' '}
              <Link href="/businesses" style={{ color: 'var(--color-primary)' }}>
                browse all businesses
              </Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
