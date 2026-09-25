'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { City } from '@/lib/types';
import type { NigerianState } from '@/lib/nigerianStates';
import { MapPin } from '@/components/Icons';
import styles from './page.module.css';

interface StateExplorerProps {
  states: NigerianState[];
  cities: City[];
}

export default function StateExplorer({ states, cities }: StateExplorerProps) {
  const [openState, setOpenState] = useState<string | null>(null);

  return (
    <section className={styles.explorer} aria-label="Nigerian states">
      <div className={styles.explorerIntro}>
        <div>
          <h2>All states</h2>
          <p>Select a state to view its cities and listing counts.</p>
        </div>
        <span className={styles.explorerCount}>{states.length} locations</span>
      </div>

      <div className={styles.statesGrid}>
        {states.map((state) => {
          const liveCities = cities.filter((city) => city.stateName === state.name);
          const liveCityNames = new Set(liveCities.map((city) => city.name.toLowerCase()));
          const stateCities = [
            ...liveCities,
            ...state.cities
              .filter((cityName) => !liveCityNames.has(cityName.toLowerCase()))
              .map((cityName) => ({
                id: `${state.slug}-${cityName}`,
                name: cityName,
                slug: cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                stateId: state.slug,
                stateName: state.name,
                businessCount: 0,
              })),
          ];
          const listingCount = liveCities.reduce((total, city) => total + (city.businessCount ?? 0), 0);
          const isOpen = openState === state.slug;

          return (
            <article key={state.slug} className={`${styles.stateCard} ${isOpen ? styles.stateCardOpen : ''}`}>
              <button
                type="button"
                className={styles.stateButton}
                onClick={() => setOpenState(isOpen ? null : state.slug)}
                aria-expanded={isOpen}
                aria-controls={`state-panel-${state.slug}`}
              >
                <span className={styles.stateIcon} aria-hidden="true"><MapPin size={18} /></span>
                <span className={styles.stateDetails}>
                  <strong>{state.name}</strong>
                  <span>{stateCities.length} {stateCities.length === 1 ? 'city' : 'cities'} · {listingCount} {listingCount === 1 ? 'listing' : 'listings'}</span>
                </span>
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} aria-hidden="true">⌄</span>
              </button>

              {isOpen && (
                <div className={styles.cityWindow} id={`state-panel-${state.slug}`}>
                  <div className={styles.windowHeader}>
                    <span>{state.name} cities</span>
                    <span>{listingCount} total listings</span>
                  </div>
                  {stateCities.length > 0 ? (
                    <div className={styles.cityList}>
                      {stateCities.map((city) => (
                        liveCityNames.has(city.name.toLowerCase()) ? (
                          <Link key={city.slug} href={`/cities/${city.slug}`} className={styles.cityLink}>
                            <span>{city.name}</span>
                            <span className={styles.cityListingCount}>{city.businessCount ?? 0} listings <span aria-hidden="true">→</span></span>
                          </Link>
                        ) : (
                          <div key={city.slug} className={styles.cityLink}>
                            <span>{city.name}</span>
                            <span className={styles.cityListingCount}>{city.businessCount ?? 0} listings</span>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptyState}>No cities have listings here yet.</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}