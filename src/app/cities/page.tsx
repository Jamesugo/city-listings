import type { Metadata } from 'next';
import Link from 'next/link';
import { getCities } from '@/lib/data';
import { MapPin } from '@/components/Icons';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Cities in Enugu State',
  description: 'Browse local businesses by city across Enugu State, Nigeria. Enugu, Nsukka, Awgu, Oji River, Agbani and more.',
};

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>Cities</span>
          </nav>
          <h1 className={styles.title}>Cities in Enugu State</h1>
          <p className={styles.subtitle}>
            Browse businesses by city across Enugu State
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid} role="list" aria-label="Cities">
          {cities.map((city, i) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className={styles.card}
              role="listitem"
              id={`city-page-${city.slug}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={styles.cardLeft}>
                <MapPin className={styles.cardPin} aria-hidden="true" />
                <div>
                  <h2 className={styles.cardName}>{city.name}</h2>
                  <p className={styles.cardState}>{city.stateName} State</p>
                </div>
              </div>
              <div className={styles.cardRight}>
                <span className={styles.cardCount}>
                  {city.businessCount ?? 0} businesses
                </span>
                <svg className={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
