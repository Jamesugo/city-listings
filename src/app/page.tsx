import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getFeaturedBusinesses, getRecentReviews } from '@/lib/data';
import BusinessCardComponent from '@/components/BusinessCardComponent';
import HeroSlider from '@/components/HeroSlider';
import StatesDropdown from '@/components/StatesDropdown';
import RecentActivity from '@/components/RecentActivity';
import { Star } from '@/components/Icons';
import { CATEGORIES } from '@/lib/mock-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'NaijaList — Nigeria Business Directory | Find Local Businesses Across Nigeria',
  description:
    'Discover trusted local businesses across Nigeria. Restaurants, clinics, professionals, shops and more — with WhatsApp contact, verified listings, and real reviews.',
};

export default async function HomePage() {
  const categories = await getCategories();
  const featured = await getFeaturedBusinesses(6);
  const recentReviews = await getRecentReviews(6);
  const browseCategories = Array.from(
    new Map([...categories, ...CATEGORIES].map((category) => [category.slug, category])).values()
  ).slice(0, 6);

  return (
    <>
      {/* ============================================================
          HERO SECTION
      ============================================================ */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <HeroSlider businesses={featured.slice(0, 5)} />
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
            {browseCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={styles.categoryCard}
                role="listitem"
                id={`cat-card-${cat.slug}`}
                aria-label={`${cat.name} — ${cat.businessCount ?? 0} businesses`}
              >
                <i className={`${styles.categoryIcon} ${cat.icon}`} aria-hidden="true" />
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
              <h2 id="featured-heading" className="section-title">
                <Star size={32} style={{ marginRight: '0.5rem', display: 'inline' }} /> Featured Businesses
              </h2>
              <p className="section-subtitle">Top-rated and verified businesses across Nigeria</p>
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
          RECENT ACTIVITY
      ============================================================ */}
      <RecentActivity reviews={recentReviews} />

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
                iconClass: 'fa-solid fa-magnifying-glass',
                title: 'Search or Browse',
                desc: 'Find businesses by category, city, or search by name or service. No sign-up required.',
              },
              {
                step: '02',
                iconClass: 'fa-solid fa-circle-check',
                title: 'Read & Trust',
                desc: 'Check verification badges, business hours, photos, and real customer reviews.',
              },
              {
                step: '03',
                iconClass: 'fa-brands fa-whatsapp',
                title: 'Contact on WhatsApp',
                desc: 'One tap connects you directly via WhatsApp — how Nigerians actually communicate.',
              },
            ].map((s) => (
              <div key={s.step} className={styles.step} role="listitem">
                <div className={styles.stepNumber} aria-hidden="true">{s.step}</div>
                <div className={styles.stepIcon} aria-hidden="true"><i className={s.iconClass} /></div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
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
                {[
                  { icon: 'fa-solid fa-circle-check', text: 'Free basic listing' },
                  { icon: 'fa-brands fa-whatsapp', text: 'WhatsApp integration' },
                  { icon: 'fa-solid fa-star', text: 'Customer reviews' },
                  { icon: 'fa-solid fa-chart-column', text: 'Analytics dashboard (coming soon)' },
                ].map((b) => (
                  <span key={b.text} className={styles.ctaBullet}>
                    <i className={b.icon} style={{ marginRight: '0.35rem' }} />{b.text}
                  </span>
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
