import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getCityBySlug, getBusinesses, CITIES } from '@/lib/data';
import type { City } from '@/lib/types';
import BusinessCardComponent from '@/components/BusinessCardComponent';

const getCity = cache(async (slug: string): Promise<City | undefined> => {
  return getCityBySlug(slug);
});

export async function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) return { title: 'City Not Found' };

  return {
    title: `Businesses in ${city.name}, ${city.stateName} State`,
    description: `Discover verified local businesses in ${city.name}, ${city.stateName} State, Nigeria. Browse all categories on NaijaList.`,
  };
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) notFound();

  const businesses = getBusinesses({ citySlug: slug });

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      <div style={{
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        paddingBlock: 'var(--space-8)',
        marginBottom: 'var(--space-8)',
      }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-3)',
          }}>
            <Link href="/" style={{ color: 'var(--color-primary)' }}>Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/cities" style={{ color: 'var(--color-primary)' }}>Cities</Link>
            <span aria-hidden="true">›</span>
            <span>{city.name}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '2.5rem' }} aria-hidden="true">📍</span>
            <h1 style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-extrabold)',
              color: 'var(--color-text-primary)',
            }}>
              Businesses in {city.name}
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {city.stateName} State, Nigeria
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
          </p>
        </div>
      </div>

      <div className="container">
        {businesses.length > 0 ? (
          <div className="grid-auto" role="list" aria-label={`Businesses in ${city.name}`}>
            {businesses.map((biz, i) => (
              <div key={biz.id} role="listitem" className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <BusinessCardComponent business={biz} priority={i < 3} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">📍</span>
            <p className="empty-state__title">No businesses listed in {city.name} yet</p>
            <p className="empty-state__desc">
              Know a business here?{' '}
              <Link href="/admin" style={{ color: 'var(--color-primary)' }}>
                Add it to NaijaList
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
