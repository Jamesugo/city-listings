interface Props {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

function toStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export default function StarRating({ rating, reviewCount, size = 'sm' }: Props) {
  const fontSizes: Record<string, string> = {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
  };

  return (
    <div
      className="star-rating"
      style={{ fontSize: fontSizes[size] }}
      aria-label={`Rating: ${rating.toFixed(1)} out of 5${reviewCount ? `, ${reviewCount} review${reviewCount !== 1 ? 's' : ''}` : ''}`}
    >
      <span className="star-rating__stars" aria-hidden="true">
        {toStars(rating)}
      </span>
      <span className="star-rating__score">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="star-rating__count">({reviewCount})</span>
      )}
    </div>
  );
}
