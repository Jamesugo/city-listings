'use client';

import { useState, useTransition } from 'react';
import { submitReview } from './actions';
import styles from './ReviewForm.module.css';

interface Props {
  businessId: string;
  slug: string;
  isAuthenticated: boolean;
}

export default function ReviewForm({ businessId, slug, isAuthenticated }: Props) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPrompt}>
        <span className={styles.loginIcon} aria-hidden="true">✍️</span>
        <p>
          <a href="/admin/login" className={styles.loginLink}>Sign in</a> to leave a review for this business.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      showToast('error', 'Please write something in your review.');
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append('business_id', businessId);
      formData.append('rating', rating.toString());
      formData.append('body', body);
      formData.append('slug', slug);

      const result = await submitReview(formData);
      if (result.error) {
        showToast('error', result.error);
      } else {
        showToast('success', 'Your review has been submitted!');
        setBody('');
        setRating(5);
      }
    });
  };

  const displayRating = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.title}>Leave a Review</h3>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`} role="alert">
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Star rating */}
      <div className="form-group">
        <label className="form-label">Your Rating</label>
        <div className={styles.stars} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              className={`${styles.star} ${star <= displayRating ? styles.starActive : ''}`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
          <span className={styles.ratingLabel}>
            {displayRating === 1 ? 'Terrible' : displayRating === 2 ? 'Poor' : displayRating === 3 ? 'Average' : displayRating === 4 ? 'Very Good' : 'Excellent'}
          </span>
        </div>
      </div>

      {/* Review body */}
      <div className="form-group">
        <label htmlFor="review-body" className="form-label">Your Review</label>
        <textarea
          id="review-body"
          className="form-input form-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others about your experience with this business…"
          rows={4}
          required
          minLength={10}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        id="submit-review-btn"
        disabled={isPending}
        style={{ minWidth: '160px' }}
      >
        {isPending ? '⏳ Submitting…' : '⭐ Submit Review'}
      </button>
    </form>
  );
}
