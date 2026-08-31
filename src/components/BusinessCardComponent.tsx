'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { BusinessCard } from '@/lib/types';
import styles from './BusinessCardComponent.module.css';
import VerifiedBadge from './VerifiedBadge';
import StarRating from './StarRating';
import { Star } from '@/components/Icons';

interface Props {
  business: BusinessCard;
  priority?: boolean;
}

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  'food-restaurants': '🍽️',
  'retail-shopping': '🛍️',
  'health-wellness': '🏥',
  'professional-services': '💼',
  'auto-transport': '🚗',
  'home-services': '🏠',
  'beauty-personal-care': '💅',
  'education-tutoring': '📚',
  'hotels-lodging': '🏨',
  'events-entertainment': '🎉',
  'finance-insurance': '🏦',
  'tech-digital': '💻',
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function BusinessCardComponent({ business, priority = false }: Props) {
  const placeholder = CATEGORY_PLACEHOLDERS[business.categorySlug] ?? '🏢';
  const waUrl = business.whatsapp ? `https://wa.me/${business.whatsapp}` : null;

  return (
    <article className={`card ${styles.card}`} id={`biz-card-${business.id}`}>
      {/* Image */}
      <Link
        href={`/businesses/${business.slug}`}
        className={styles.imageLink}
        aria-label={`View details for ${business.name}`}
        tabIndex={-1}
      >
        <div className={styles.imageWrapper}>
          {business.coverImageUrl && !business.coverImageUrl.startsWith('/images/placeholder') ? (
            <Image
              src={business.coverImageUrl}
              alt={`${business.name} cover photo`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.image}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true">
              <span className={styles.placeholderEmoji}>{placeholder}</span>
            </div>
          )}
          {business.isFeatured && (
            <span className={styles.featuredBadge} aria-label="Featured listing">
              <Star size={12} style={{ marginRight: '0.25rem' }} /> Featured
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className={styles.content}>
        {/* Category & verification */}
        <div className={styles.topRow}>
          <Link
            href={`/categories/${business.categorySlug}`}
            className="badge badge-green"
            onClick={(e) => e.stopPropagation()}
          >
            {business.categoryName}
          </Link>
          <VerifiedBadge tier={business.verificationTier} />
        </div>

        {/* Name */}
        <Link href={`/businesses/${business.slug}`} className={styles.nameLink}>
          <h2 className={styles.name}>{business.name}</h2>
        </Link>

        {/* Rating */}
        {(business.averageRating !== undefined) && (
          <StarRating
            rating={business.averageRating}
            reviewCount={business.reviewCount}
          />
        )}

        {/* Location */}
        <div className={styles.location}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <Link href={`/cities/${business.citySlug}`} className={styles.cityLink}>
            {business.cityName}
          </Link>
          <span className={styles.locationSep}>·</span>
          <span className={styles.address}>{business.address}</span>
        </div>

        {/* Last confirmed */}
        {business.lastConfirmedAt && (
          <p className={styles.confirmed}>
            ✓ Confirmed active {timeAgo(business.lastConfirmedAt)}
          </p>
        )}

        {/* CTAs */}
        <div className={styles.ctas}>
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-whatsapp btn-sm ${styles.waCta}`}
              id={`wa-cta-${business.id}`}
              aria-label={`Chat with ${business.name} on WhatsApp`}
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          ) : (
            <a
              href={`tel:${business.phone}`}
              className="btn btn-outline btn-sm"
              id={`call-cta-${business.id}`}
              aria-label={`Call ${business.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              📞 Call
            </a>
          )}
          <Link
            href={`/businesses/${business.slug}`}
            className="btn btn-ghost btn-sm"
            id={`view-cta-${business.id}`}
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}
