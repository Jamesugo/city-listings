import type { Metadata } from 'next';
import Link from 'next/link';
import { getCities } from '@/lib/data';
import { NIGERIAN_STATES, groupStatesByLetter } from '@/lib/nigerianStates';
import { MapPin } from '@/components/Icons';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Browse by State & City — NaijaList Nigeria Directory',
  description:
    'Browse local businesses by state and city across Nigeria. Find businesses in Lagos, Enugu, Abuja, Kano, Rivers and all 36 states.',
};

export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state: stateSlug } = await searchParams;
  const cities = await getCities();
  const selectedState = NIGERIAN_STATES.find((state) => state.slug === stateSlug);
  const visibleCities = selectedState
    ? cities.filter((city) => city.stateName === selectedState.name)
    : cities;

  // Group cities by state name for matching
  const citiesByState = new Map<string, typeof cities>();
  for (const city of visibleCities) {
    const key = city.stateName || '';
    if (!citiesByState.has(key)) citiesByState.set(key, []);
    citiesByState.get(key)!.push(city);
  }

  const grouped = groupStatesByLetter(selectedState ? [selectedState] : NIGERIAN_STATES);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>{selectedState ? `${selectedState.name} State` : 'States & Cities'}</span>
          </nav>
          <h1 className={styles.title}>{selectedState ? `${selectedState.name} State Cities` : 'Browse by State & City'}</h1>
          <p className={styles.subtitle}>
            Explore businesses across all 36 Nigerian states and FCT Abuja
          </p>
        </div>
      </div>

      <div className="container">
        {/* Alphabetical letter groups */}
        {Array.from(grouped.entries()).map(([letter, states]) => (
          <div key={letter} className={styles.letterSection}>
            <div className={styles.letterHeader}>
              <span className={styles.letterBadge}>{letter}</span>
            </div>

            <div className={styles.statesGrid}>
              {states.map((state) => {
                const stateCities = citiesByState.get(state.name) || [];
                const totalBusinesses = stateCities.reduce(
                  (sum, c) => sum + (c.businessCount ?? 0),
                  0
                );

                return (
                  <div key={state.slug} className={styles.stateCard} id={`state-${state.slug}`}>
                    <div className={styles.stateHeader}>
                      <div className={styles.stateInfo}>
                        <h2 className={styles.stateName}>{state.name} State</h2>
                        <span className={styles.stateMeta}>
                          {stateCities.length} {stateCities.length === 1 ? 'city' : 'cities'} · {totalBusinesses} {totalBusinesses === 1 ? 'business' : 'businesses'}
                        </span>
                      </div>
                      <MapPin className={styles.statePin} aria-hidden="true" />
                    </div>

                    {stateCities.length > 0 ? (
                      <div className={styles.cityList}>
                        {stateCities.map((city) => (
                          <Link
                            key={city.slug}
                            href={`/cities/${city.slug}`}
                            className={styles.cityItem}
                            id={`city-${city.slug}`}
                          >
                            <span className={styles.cityDot} aria-hidden="true" />
                            <span className={styles.cityName}>{city.name}</span>
                            <span className={styles.cityCount}>
                              {city.businessCount ?? 0}
                            </span>
                            <svg
                              className={styles.cityArrow}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.comingSoon}>
                        <span className={styles.comingSoonIcon}>🚀</span>
                        <span>Coming soon</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
