import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getCities, getFeaturedBusinesses } from '@/lib/data';
import BusinessCardComponent from '@/components/BusinessCardComponent';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'NaijaList — Nigeria Business Directory | Find Local Businesses in Enugu',
  description:
    'Discover trusted local businesses in Enugu State, Nigeria. Restaurants, clinics, professionals, shops and more — with WhatsApp contact, verified listings, and real reviews.',
};

export default async function HomePage() {
  const categories = await getCategories();
  const cities = await getCities();
  const featured = await getFeaturedBusinesses(6);

  return (
    <>
      {/* ============================================================
          HERO SECTION
      ============================================================ */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span>🇳🇬</span> Enugu State Business Directory
          </div>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Find Any Business<br />
            <span className={styles.heroTitleGreen}>Near You in Enugu</span>
          </h1>
          <p className={styles.heroSub}>
            250+ verified local businesses — restaurants, clinics, professionals, shops, and more.
            Contact via WhatsApp in one tap.
          </p>

          {/* Search bar */}
          <form
            action="/businesses"
            method="GET"
            className={styles.searchForm}
            role="search"
            aria-label="Search businesses"
          >
            <div className={styles.searchInputWrapper}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                name="q"
                id="hero-search"
                className={`form-input ${styles.searchInput}`}
                placeholder="Search businesses, e.g. mechanic, pharmacy…"
                autoComplete="off"
                aria-label="Search for businesses"
              />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.searchBtn}`} id="hero-search-btn">
              Search
            </button>
          </form>

          {/* Quick links */}
          <div className={styles.quickLinks} aria-label="Quick category links">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={styles.quickLink}
                id={`quick-cat-${cat.slug}`}
              >
                <span aria-hidden="true">{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS BAR
      ============================================================ */}
      <div className={styles.statsBar} aria-label="Directory statistics">
        <div className={`container ${styles.statsInner}`}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>250+</span>
            <span className={styles.statLabel}>Businesses Listed</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.stat}>
            <span className={styles.statNumber}>5</span>
            <span className={styles.statLabel}>Cities in Enugu</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.stat}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>Business Categories</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.stat}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>WhatsApp-ready</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          CATEGORIES SECTION
      ============================================================ */}
      <section className={`section ${styles.categoriesSection}`} aria-labelledby="categories-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="categories-heading" className="section-title">Browse by Category</h2>
              <p className="section-subtitle">Find exactly what you&apos;re looking for</p>
            </div>
            <Link href="/categories" className="btn btn-ghost btn-sm" id="all-categories-link">
              View all →
            </Link>
          </div>

          <div className={styles.categoryGrid} role="list" aria-label="Business categories">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={styles.categoryCard}
                role="listitem"
                id={`cat-card-${cat.slug}`}
                aria-label={`${cat.name} — ${cat.businessCount ?? 0} businesses`}
              >
                <span className={styles.categoryIcon} aria-hidden="true">{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
                <span className={styles.categoryCount}>{cat.businessCount ?? 0} businesses</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED BUSINESSES
      ============================================================ */}
      <section className={`section ${styles.featuredSection}`} aria-labelledby="featured-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="featured-heading" className="section-title">⭐ Featured Businesses</h2>
              <p className="section-subtitle">Top-rated and verified businesses in Enugu State</p>
            </div>
            <Link href="/businesses?featured=true" className="btn btn-ghost btn-sm" id="all-featured-link">
              View all →
            </Link>
          </div>

          <div className="grid-auto" role="list" aria-label="Featured businesses">
            {featured.map((biz, i) => (
              <div key={biz.id} role="listitem">
                <BusinessCardComponent business={biz} priority={i < 3} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
      ============================================================ */}
      <section className={`section ${styles.howSection}`} aria-labelledby="how-heading">
        <div className="container">
          <h2 id="how-heading" className="section-title" style={{ textAlign: 'center' }}>
            How NaijaList Works
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>
            Connecting customers with local businesses — simply and fast
          </p>

          <div className={styles.stepsGrid} role="list" aria-label="How it works steps">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Search or Browse',
                desc: 'Find businesses by category, city, or search by name or service. No sign-up required.',
              },
              {
                step: '02',
                icon: '✅',
                title: 'Read & Trust',
                desc: 'Check verification badges, business hours, photos, and real customer reviews.',
              },
              {
                step: '03',
                icon: '💬',
                title: 'Contact on WhatsApp',
                desc: 'One tap connects you directly via WhatsApp — how Nigerians actually communicate.',
              },
            ].map((s) => (
              <div key={s.step} className={styles.step} role="listitem">
                <div className={styles.stepNumber} aria-hidden="true">{s.step}</div>
                <div className={styles.stepIcon} aria-hidden="true">{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CITIES SECTION
      ============================================================ */}
      <section className={`section ${styles.citiesSection}`} aria-labelledby="cities-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="cities-heading" className="section-title">Browse by City</h2>
              <p className="section-subtitle">Businesses across Enugu State</p>
            </div>
            <Link href="/cities" className="btn btn-ghost btn-sm" id="all-cities-link">
              View all →
            </Link>
          </div>
          <div className={styles.cityGrid} role="list" aria-label="Cities in Enugu State">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className={styles.cityCard}
                role="listitem"
                id={`city-card-${city.slug}`}
              >
                <span className={styles.cityPin} aria-hidden="true">📍</span>
                <div>
                  <p className={styles.cityName}>{city.name}</p>
                  <p className={styles.cityCount}>{city.businessCount ?? 0} businesses</p>
                </div>
                <svg className={styles.cityArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          LIST YOUR BUSINESS CTA
      ============================================================ */}
      <section className={styles.ctaSection} aria-labelledby="cta-heading">
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaText}>
              <h2 id="cta-heading" className={styles.ctaTitle}>
                Own a Business in Enugu?
              </h2>
              <p className={styles.ctaDesc}>
                Get discovered by thousands of customers. List your business for free — be found on WhatsApp, Google, and NaijaList.
              </p>
              <div className={styles.ctaBullets}>
                {['✅ Free basic listing', '📱 WhatsApp integration', '⭐ Customer reviews', '📊 Analytics dashboard (coming soon)'].map((b) => (
                  <span key={b} className={styles.ctaBullet}>{b}</span>
                ))}
              </div>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/admin" className="btn btn-primary btn-lg" id="cta-list-business-btn">
                List Your Business Free
              </Link>
              <p className={styles.ctaNote}>No credit card required</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
