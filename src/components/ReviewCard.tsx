import Link from 'next/link';
import { Review } from '@/lib/types';
import styles from './ReviewCard.module.css';
import { Lightbulb, Heart, Hand, Smile } from '@/components/Icons';

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.rating}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={16}
          height={16}
          className={i < rating ? styles.starFilled : styles.starEmpty}
          aria-hidden="true"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i < rating ? '#f59e0b' : '#e5e7eb'}
            stroke="none"
          />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({ review }: { review: Review }) {
  const business = review.business;
  if (!business) return null;

  const timeAgo = getRelativeTime(review.created_at);
  const userName = review.user?.email?.split('@')[0] || 'A User';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <span className={styles.avatar}>{initial}</span>
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>
            <strong>{userName}</strong> wrote a review
          </p>
          <p className={styles.timeAgo}>{timeAgo}</p>
        </div>
      </div>

      {/* Business Image & Name */}
      <div className={styles.businessSection}>
        <Link href={`/businesses/${business.slug}`} className={styles.businessLink}>
          {business.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.coverImageUrl} alt={business.name} className={styles.businessImage} />
          ) : (
            <div className={styles.businessImagePlaceholder} />
          )}
          <h3 className={styles.businessName}>{business.name}</h3>
        </Link>
      </div>

      {/* Rating & Review */}
      <div className={styles.reviewContent}>
        <StarRating rating={review.rating} />
        
        <p className={styles.reviewBody}>
          {review.body.length > 120 ? `${review.body.substring(0, 120)}...` : review.body}
          {review.body.length > 120 && (
            <Link href={`/businesses/${business.slug}#reviews`} className={styles.readMore}>
              Read more
            </Link>
          )}
        </p>
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <button className={styles.actionBtn} aria-label="Helpful" title="Helpful">
          <Lightbulb size={18} />
        </button>
        <button className={styles.actionBtn} aria-label="Thanks" title="Thanks">
          <Hand size={18} />
        </button>
        <button className={styles.actionBtn} aria-label="Love this" title="Love this">
          <Heart size={18} />
        </button>
        <button className={styles.actionBtn} aria-label="Oh no" title="Oh no">
          <Smile size={18} />
        </button>
      </div>
    </div>
  );
}
