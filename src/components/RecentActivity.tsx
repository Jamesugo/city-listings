import { Review } from '@/lib/types';
import ReviewCard from './ReviewCard';
import styles from './RecentActivity.module.css';

interface RecentActivityProps {
  reviews: Review[];
}

export default function RecentActivity({ reviews }: RecentActivityProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.title}>Recent Activity</h2>
          <p className={styles.emptyState}>No recent activity found. Be the first to leave a review!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>Recent Activity</h2>
        <div className={styles.grid}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
