import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Browse Business Categories',
  description: 'Find Nigerian businesses by category — restaurants, clinics, salons, mechanics, lawyers, tech services and more across Enugu State.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>Categories</span>
          </nav>
          <h1 className={styles.title}>Browse by Category</h1>
          <p className={styles.subtitle}>
            {categories.length} categories covering every type of business in Enugu State
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid} role="list" aria-label="Business categories">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={styles.card}
              role="listitem"
              id={`cat-page-${cat.slug}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <i className={`${styles.cardIcon} ${cat.icon}`} aria-hidden="true" />
              <div className={styles.cardBody}>
                <h2 className={styles.cardName}>{cat.name}</h2>
                <p className={styles.cardDesc}>{cat.description}</p>
                <span className={styles.cardCount}>
                  {cat.businessCount ?? 0} {(cat.businessCount ?? 0) === 1 ? 'business' : 'businesses'}
                </span>
              </div>
              <svg className={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
