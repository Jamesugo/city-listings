'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../app/businesses/page.module.css';

export default function BusinessSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current values
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const minRating = searchParams.get('minRating') || '';
  const openNow = searchParams.get('openNow') === 'true';

  const hasFilters = q || category || city || minRating || openNow || searchParams.has('lat');

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page on filter change
    params.delete('page');
    router.push(`/businesses?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/businesses');
  };

  return (
    <div className={styles.filterBarWrapper}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          updateFilters('q', formData.get('q') as string);
        }}
        className={styles.filterBar} 
        role="search"
      >
        <div className={styles.searchGroup}>
          <input
            type="search"
            name="q"
            defaultValue={q}
            id="businesses-search"
            className={`form-input ${styles.searchInput}`}
            placeholder="Search businesses…"
            aria-label="Search businesses"
          />
          <button type="submit" className="btn btn-primary" id="businesses-search-btn">
            Search
          </button>
        </div>

        <div className={styles.advancedFilters}>
          <select 
            value={minRating} 
            onChange={(e) => updateFilters('minRating', e.target.value)}
            className="form-input"
            aria-label="Filter by Rating"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>

          <label className={styles.toggleLabel}>
            <input 
              type="checkbox" 
              checked={openNow}
              onChange={(e) => updateFilters('openNow', e.target.checked ? 'true' : '')}
            />
            Open Now
          </label>

          {hasFilters && (
            <button type="button" onClick={clearFilters} className="btn btn-ghost btn-sm" id="clear-filters-btn">
              Clear all
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
