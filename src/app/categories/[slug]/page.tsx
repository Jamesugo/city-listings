import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getBusinesses } from '@/lib/data';
import { createBuildClient } from '@/lib/supabase/build-client';
import type { Category } from '@/lib/types';
import BusinessCardComponent from '@/components/BusinessCardComponent';

const getCategory = cache(async (slug: string): Promise<Category | undefined> => {
  return getCategoryBySlug(slug);
});

export async function generateStaticParams() {
  const supabase = createBuildClient();
  const { data } = await supabase.from('categories').select('slug');
  return (data ?? []).map((c: { slug: string }) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return { title: 'Category Not Found' };

  return {
    title: `${cat.name} — Businesses in Enugu State`,
    description: `Find the best ${cat.name.toLowerCase()} in Enugu State, Nigeria. Browse verified listings with WhatsApp contact on NaijaList.`,
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();

  const businesses = await getBusinesses({ categorySlug: slug });

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
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
            <Link href="/categories" style={{ color: 'var(--color-primary)' }}>Categories</Link>
            <span aria-hidden="true">›</span>
            <span>{cat.name}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '2.5rem' }} aria-hidden="true">{cat.icon}</span>
            <h1 style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-extrabold)',
              color: 'var(--color-text-primary)',
            }}>
              {cat.name}
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600 }}>{cat.description}</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
          </p>
        </div>
      </div>

      <div className="container">
        {businesses.length > 0 ? (
          <div className="grid-auto" role="list" aria-label={`${cat.name} businesses`}>
            {businesses.map((biz, i) => (
              <div key={biz.id} role="listitem" className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <BusinessCardComponent business={biz} priority={i < 3} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">{cat.icon}</span>
            <p className="empty-state__title">No {cat.name.toLowerCase()} listed yet</p>
            <p className="empty-state__desc">
              Know a business in this category?{' '}
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
