import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'List Your Business on NaijaList — Reach Thousands of Customers',
  description:
    'Add your business to NaijaList and connect with thousands of customers in Enugu State. Free listing, WhatsApp contact, verified badges, and real reviews.',
};

const TIERS = [
  {
    icon: '🆓',
    name: 'Free Listing',
    price: 'Free forever',
    badge: null,
    features: [
      'Business name, address & phone',
      'Category & city listing',
      'WhatsApp contact button',
      'Appear in search results',
      'Customer reviews',
    ],
    cta: 'Get Started Free',
    ctaHref: '/admin/login',
    highlight: false,
  },
  {
    icon: '📞',
    name: 'Phone Verified',
    price: 'Coming soon',
    badge: 'Popular',
    features: [
      'Everything in Free',
      'Phone Verified badge ✓',
      'Higher search ranking',
      'Priority in category pages',
      'Cover image upload',
    ],
    cta: 'Join Waitlist',
    ctaHref: '/admin/login',
    highlight: true,
  },
  {
    icon: '🏛️',
    name: 'CAC Verified',
    price: 'Coming soon',
    badge: 'Premium',
    features: [
      'Everything in Phone Verified',
      'CAC Verified badge ✓',
      'Featured listing option',
      'Photo gallery (up to 10)',
      'Business hours display',
      'Analytics dashboard',
    ],
    cta: 'Join Waitlist',
    ctaHref: '/admin/login',
    highlight: false,
  },
];

const STEPS = [
  { step: '1', icon: '✍️', title: 'Create an account', desc: 'Sign up free with your email address in under a minute.' },
  { step: '2', icon: '📝', title: 'Fill in your details', desc: 'Add your business name, address, phone, WhatsApp, and description.' },
  { step: '3', icon: '🚀', title: 'Go live instantly', desc: 'Your listing goes live immediately and is searchable by customers.' },
];

export default function ListBusinessPage() {
  return (
    <div style={{ paddingBottom: 'var(--space-20)' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#fff',
        paddingBlock: 'var(--space-20)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 740 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)',
            padding: '0.4rem 1rem', fontSize: 'var(--font-size-sm)',
            fontWeight: 600, marginBottom: '1.5rem', backdropFilter: 'blur(8px)',
          }}>
            🇳🇬 NaijaList Business Directory
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
            lineHeight: 1.15, marginBottom: '1.25rem',
          }}>
            Grow Your Business<br />
            <span style={{ color: '#6ee7b7' }}>Reach Thousands of Customers</span>
          </h1>
          <p style={{
            fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 2rem',
          }}>
            Join hundreds of businesses already listed on NaijaList. Get discovered by customers searching for services in Enugu State — for free.
          </p>
          <Link
            href="/admin/login"
            className="btn btn-primary"
            id="list-hero-cta"
            style={{ fontSize: '1.1rem', padding: '0.9rem 2rem', background: '#fff', color: '#064e3b', fontWeight: 700 }}
          >
            🚀 List My Business Free
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section style={{ paddingBlock: 'var(--space-16)', background: 'var(--color-gray-50)' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'var(--font-size-3xl)',
            fontWeight: 800, marginBottom: 'var(--space-12)',
            color: 'var(--color-text-primary)',
          }}>
            Get Listed in 3 Steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-8)' }}>
            {STEPS.map((s) => (
              <div key={s.step} style={{
                background: 'var(--color-white)', borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-8)', textAlign: 'center',
                border: '1px solid var(--color-border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #064e3b, #047857)',
                  color: '#fff', fontSize: '1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', fontWeight: 900,
                }}>{s.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{s.title}</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section style={{ paddingBlock: 'var(--space-16)' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'var(--font-size-3xl)',
            fontWeight: 800, marginBottom: 'var(--space-3)',
            color: 'var(--color-text-primary)',
          }}>
            Choose Your Plan
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-12)' }}>
            Start free. Upgrade as your business grows.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
            {TIERS.map((tier) => (
              <div key={tier.name} style={{
                background: 'var(--color-white)',
                borderRadius: 'var(--radius-2xl)',
                border: tier.highlight ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)',
                padding: 'var(--space-8)',
                display: 'flex', flexDirection: 'column',
                boxShadow: tier.highlight ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                position: 'relative',
              }}>
                {tier.badge && (
                  <div style={{
                    position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--color-primary)', color: '#fff',
                    padding: '0.25rem 0.875rem', borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)', fontWeight: 700,
                  }}>{tier.badge}</div>
                )}
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{tier.icon}</div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{tier.name}</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '1.5rem' }}>{tier.price}</p>
                <ul style={{ listStyle: 'none', padding: 0, flex: 1, marginBottom: '1.5rem' }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                      fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)',
                      marginBottom: '0.625rem', lineHeight: 1.5,
                    }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.ctaHref}
                  className={`btn ${tier.highlight ? 'btn-primary' : 'btn-outline'}`}
                  id={`list-tier-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ textAlign: 'center', justifyContent: 'center' }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        background: 'var(--color-gray-50)',
        borderTop: '1px solid var(--color-border)',
        paddingBlock: 'var(--space-16)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 620 }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            Ready to grow your business?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Join hundreds of businesses already connecting with customers daily on NaijaList.
          </p>
          <Link href="/admin/login" className="btn btn-primary" id="list-bottom-cta" style={{ fontSize: '1.05rem', padding: '0.85rem 2rem' }}>
            Create Free Listing →
          </Link>
        </div>
      </section>
    </div>
  );
}
