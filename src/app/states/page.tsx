import type { Metadata } from 'next';
import Link from 'next/link';
import { getCities } from '@/lib/data';
import { NIGERIAN_STATES } from '@/lib/nigerianStates';
import StateExplorer from './StateExplorer';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Nigerian States & Cities — NaijaList',
  description: 'Explore Nigerian states, cities, and the local businesses listed in each city.',
};

export default async function StatesPage() {
  const cities = await getCities();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>States</span>
          </nav>
          <div className={styles.headingRow}>
            <div>
              <p className={styles.kicker}>Find your next local favourite</p>
              <h1 className={styles.title}>Explore Nigeria by state</h1>
              <p className={styles.subtitle}>
                Choose a state to see its cities and the businesses listed in each one.
              </p>
            </div>
            <div className={styles.stateTotal}>
              <strong>{NIGERIAN_STATES.length}</strong>
              <span>states and FCT</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <StateExplorer states={NIGERIAN_STATES} cities={cities} />
      </main>
    </div>
  );
}