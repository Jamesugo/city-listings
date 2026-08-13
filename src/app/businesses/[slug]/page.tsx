import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getBusinessBySlug, getRelatedBusinesses, BUSINESSES } from '@/lib/data';
import type { Business, BusinessHours } from '@/lib/types';
import VerifiedBadge from '@/components/VerifiedBadge';
import StarRating from '@/components/StarRating';
import BusinessCardComponent from '@/components/BusinessCardComponent';
import styles from './page.module.css';

// Memoize data fetch so it only runs once per request even if called
// from both generateMetadata and the page component
const getBusiness = cache(async (slug: string): Promise<Business | undefined> => {
  return getBusinessBySlug(slug);
});

// Generate static paths at build time for all active businesses
export async function generateStaticParams() {
  return BUSINESSES.filter((b) => b.isActive).map((b) => ({ slug: b.slug }));
}

// Per-listing dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const biz = await getBusiness(slug);
  if (!biz) return { title: 'Business Not Found' };

  return {
    title: `${biz.name} — ${biz.categoryName} in ${biz.cityName}`,
    description: `Contact ${biz.name} on WhatsApp. Find address, hours, and reviews for this ${biz.categoryName.toLowerCase()} in ${biz.cityName}, ${biz.stateName}, Nigeria on NaijaList.`,
    openGraph: {
      title: `${biz.name} | NaijaList`,
      description: biz.description.slice(0, 160),
      type: 'website',
    },
    alternates: {
      canonical: `/businesses/${biz.slug}`,
    },
  };
}

// Schema.org LocalBusiness JSON-LD
function LocalBusinessJsonLd({ biz }: { biz: Business }) {
  const hoursSpec = biz.hours
    ? Object.entries(biz.hours as BusinessHours).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${day}day`,
        description: hours,
      }))
    : [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz.address,
      addressLocality: biz.cityName,
      addressRegion: biz.stateName,
      addressCountry: 'NG',
    },
    telephone: biz.phone,
    url: biz.website ?? undefined,
    openingHoursSpecification: hoursSpec,
    image: biz.coverImageUrl ?? undefined,
    aggregateRating:
      biz.averageRating !== undefined
        ? {
            '@type': 'AggregateRating',
            ratingValue: biz.averageRating,
            reviewCount: biz.reviewCount ?? 0,
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const DAY_ORDER: (keyof BusinessHours)[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const CATEGORY_EMOJI: Record<string, string> = {
  'food-restaurants': '🍽️', 'retail-shopping': '🛍️', 'health-wellness': '🏥',
  'professional-services': '💼', 'auto-transport': '🚗', 'home-services': '🏠',
  'beauty-personal-care': '💅', 'education-tutoring': '📚', 'hotels-lodging': '🏨',
  'events-entertainment': '🎉', 'finance-insurance': '🏦', 'tech-digital': '💻',
};

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const biz = await getBusiness(slug);
  if (!biz) notFound();

  const related = getRelatedBusinesses(biz, 3);
  const waUrl = biz.whatsapp ? `https://wa.me/${biz.whatsapp}?text=Hello%20${encodeURIComponent(biz.name)}%2C%20I%20found%20you%20on%20NaijaList%20and%20would%20like%20to%20enquire%20about%20your%20services.` : null;
  const emoji = CATEGORY_EMOJI[biz.categorySlug] ?? '🏢';

  return (
    <>
      <LocalBusinessJsonLd biz={biz} />

      {/* Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/businesses">Businesses</Link>
            <span aria-hidden="true">›</span>
            <Link href={`/categories/${biz.categorySlug}`}>{biz.categoryName}</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{biz.name}</span>
          </nav>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        {/* LEFT / Main content */}
        <main className={styles.main}>
          {/* Hero image / placeholder */}
          <div className={styles.heroImage}>
            <div className={styles.heroPlaceholder} aria-hidden="true">
              <span className={styles.heroEmoji}>{emoji}</span>
            </div>
            {biz.isFeatured && (
              <span className={styles.featuredChip}>⭐ Featured</span>
            )}
          </div>

          {/* Header */}
          <div className={styles.bizHeader}>
            <div className={styles.bizMeta}>
              <Link href={`/categories/${biz.categorySlug}`} className="badge badge-green">
                {biz.categoryName}
              </Link>
              <VerifiedBadge tier={biz.verificationTier} />
            </div>
            <h1 className={styles.bizName}>{biz.name}</h1>
            {biz.averageRating !== undefined && (
              <StarRating rating={biz.averageRating} reviewCount={biz.reviewCount} size="md" />
            )}
            <div className={styles.bizLocation}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <address style={{ fontStyle: 'normal' }}>
                {biz.address}, <Link href={`/cities/${biz.citySlug}`} className={styles.cityLink}>{biz.cityName}</Link>, {biz.stateName} State
              </address>
            </div>
            {biz.lastConfirmedAt && (
              <p className={styles.lastConfirmed}>
                ✓ Last confirmed active: {formatDate(biz.lastConfirmedAt)}
              </p>
            )}
          </div>

          {/* Description */}
          <section className={styles.section} aria-labelledby="desc-heading">
            <h2 id="desc-heading" className={styles.sectionTitle}>About This Business</h2>
            <p className={styles.description}>{biz.description}</p>
          </section>

          {/* Hours */}
          {biz.hours && (
            <section className={styles.section} aria-labelledby="hours-heading">
              <h2 id="hours-heading" className={styles.sectionTitle}>Business Hours</h2>
              <dl className={styles.hoursGrid}>
                {DAY_ORDER.map((day) => {
                  const h = (biz.hours as BusinessHours)[day];
                  return (
                    <div key={day} className={styles.hoursRow}>
                      <dt className={styles.hoursDay}>{DAY_NAMES[day]}</dt>
                      <dd className={`${styles.hoursTime} ${h === 'Closed' ? styles.hoursClosed : ''}`}>
                        {h ?? 'Not specified'}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          )}

          {/* Reviews placeholder */}
          <section className={styles.section} aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className={styles.sectionTitle}>Customer Reviews</h2>
            <div className={styles.reviewsPlaceholder}>
              <span className={styles.reviewsIcon} aria-hidden="true">⭐</span>
              <p className={styles.reviewsTitle}>
                {biz.reviewCount && biz.reviewCount > 0
                  ? `${biz.reviewCount} review${biz.reviewCount !== 1 ? 's' : ''} — more details coming soon`
                  : 'Be the first to review this business'}
              </p>
              <p className={styles.reviewsDesc}>
                Reviews and ratings will be enabled in Phase 2. Contact the business on WhatsApp to share your experience.
              </p>
            </div>
          </section>
        </main>

        {/* RIGHT / Sidebar / Contact card */}
        <aside className={styles.sidebar} aria-label="Contact information">
          <div className={styles.contactCard}>
            <h2 className={styles.contactTitle}>Contact {biz.name}</h2>

            {/* WhatsApp — PRIMARY CTA */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-whatsapp ${styles.contactBtn}`}
                id="biz-whatsapp-cta"
                aria-label={`Chat with ${biz.name} on WhatsApp`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            )}

            {/* Phone */}
            <a
              href={`tel:${biz.phone}`}
              className={`btn btn-outline ${styles.contactBtn}`}
              id="biz-call-cta"
              aria-label={`Call ${biz.name}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.25 1.13 2 2 0 012.23 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.57-1.57a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              📞 {biz.phone}
            </a>

            {/* Email */}
            {biz.email && (
              <a
                href={`mailto:${biz.email}`}
                className={`btn btn-ghost ${styles.contactBtn}`}
                id="biz-email-cta"
                aria-label={`Email ${biz.name}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
                </svg>
                ✉️ Send Email
              </a>
            )}

            {/* Website */}
            {biz.website && (
              <a
                href={biz.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-ghost ${styles.contactBtn}`}
                id="biz-website-cta"
                aria-label={`Visit ${biz.name}'s website`}
              >
                🌐 Visit Website
              </a>
            )}

            <hr className={`divider ${styles.contactDivider}`} />

            {/* Address info */}
            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">📍</span>
              <div>
                <p className={styles.infoLabel}>Address</p>
                <p className={styles.infoValue}>{biz.address}, {biz.cityName}, {biz.stateName}</p>
              </div>
            </div>

            {biz.hours && (() => {
              const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }) as keyof BusinessHours;
              const todayHours = (biz.hours as BusinessHours)[today];
              return todayHours ? (
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon} aria-hidden="true">🕐</span>
                  <div>
                    <p className={styles.infoLabel}>Today&apos;s Hours</p>
                    <p className={`${styles.infoValue} ${todayHours === 'Closed' ? styles.closedText : styles.openText}`}>
                      {todayHours}
                    </p>
                  </div>
                </div>
              ) : null;
            })()}

            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">🏷️</span>
              <div>
                <p className={styles.infoLabel}>Category</p>
                <Link href={`/categories/${biz.categorySlug}`} className={styles.infoLink}>
                  {biz.categoryName}
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related businesses */}
      {related.length > 0 && (
        <section className={styles.relatedSection} aria-labelledby="related-heading">
          <div className="container">
            <h2 id="related-heading" className={styles.relatedTitle}>
              More {biz.categoryName} in {biz.stateName}
            </h2>
            <div className="grid-auto">
              {related.map((r) => (
                <BusinessCardComponent key={r.id} business={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
