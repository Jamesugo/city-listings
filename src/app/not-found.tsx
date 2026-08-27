import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'This page does not exist. Browse NaijaList to find local businesses.',
};

export default function NotFound() {
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
      <div style={{
        fontSize: '6rem',
        lineHeight: 1,
        marginBottom: '1.5rem',
        animation: 'float 3s ease-in-out infinite',
      }}>
        🗺️
      </div>
      <h1 style={{
        fontSize: 'clamp(1.75rem, 5vw, 3rem)',
        fontWeight: 800,
        color: 'var(--color-text-primary)',
        marginBottom: '0.75rem',
      }}>
        Page Not Found
      </h1>
      <p style={{
        fontSize: '1.1rem',
        color: 'var(--color-text-secondary)',
        maxWidth: '480px',
        lineHeight: 1.7,
        marginBottom: '2rem',
      }}>
        We couldn&apos;t find what you were looking for. Try browsing our business directory instead.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary" id="not-found-home">
          🏠 Go Home
        </Link>
        <Link href="/businesses" className="btn btn-outline" id="not-found-browse">
          Browse Businesses
        </Link>
      </div>
    </div>
  );
}
