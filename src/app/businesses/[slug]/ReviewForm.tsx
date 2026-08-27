'use client';

import { useState, useTransition } from 'react';
import { submitReview } from './actions';
import styles from './page.module.css';

export default function ReviewForm({ businessId, slug, isAuthenticated }: { businessId: string; slug: string, isAuthenticated: boolean }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <div className={styles.reviewsPlaceholder}>
        <p>Please <a href="/admin/login" style={{ color: 'var(--color-primary)' }}>log in</a> to leave a review.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append('business_id', businessId);
      formData.append('rating', rating.toString());
      formData.append('body', body);
      formData.append('slug', slug);
      
      const result = await submitReview(formData);
      if (result.error) {
        alert('Failed to submit review: ' + result.error);
      } else {
        alert('Review submitted successfully!');
        setBody('');
        setRating(5);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>Leave a Review</h3>
      
      <div className="form-group">
        <label className="form-label">Rating</label>
        <select 
          className="form-input form-select" 
          value={rating} 
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>5 - Excellent ⭐⭐⭐⭐⭐</option>
          <option value={4}>4 - Very Good ⭐⭐⭐⭐</option>
          <option value={3}>3 - Average ⭐⭐⭐</option>
          <option value={2}>2 - Poor ⭐⭐</option>
          <option value={1}>1 - Terrible ⭐</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Your Review</label>
        <textarea
          className="form-input form-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={3}
          required
        />
      </div>
      
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
