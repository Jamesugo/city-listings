'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '1.5rem' }}>⚠️</div>
      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        fontWeight: 800,
        color: 'var(--color-text-primary)',
        marginBottom: '0.75rem',
      }}>
        Something went wrong
      </h1>
      <p style={{
        color: 'var(--color-text-secondary)',
        maxWidth: '440px',
        lineHeight: 1.7,
        marginBottom: '2rem',
      }}>
        An unexpected error occurred. Our team has been notified. Please try again.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          className="btn btn-primary"
          id="error-retry-btn"
        >
          🔄 Try Again
        </button>
        <Link href="/" className="btn btn-outline" id="error-home-btn">
          Go Home
        </Link>
      </div>
    </div>
  );
}
