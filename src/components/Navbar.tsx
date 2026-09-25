'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Building2, FolderOpen, KeyRound, Plus, MapPin, User as UserIcon } from '@/components/Icons';
import styles from './Navbar.module.css';

async function resolveDashboardHref(user: User): Promise<string> {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  if (user.email && adminEmails.includes(user.email)) return '/admin';
  return '/dashboard';
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardHref, setDashboardHref] = useState('/dashboard');
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const syncUser = async (nextUser: User | null) => {
      setUser(nextUser);
      if (nextUser) {
        setDashboardHref(await resolveDashboardHref(nextUser));
      }
      setAuthReady(true);
    };

    // Initial session check
    supabase.auth.getUser().then(({ data }) => {
      syncUser(data.user);
    });

    // Listen to auth changes — fires on sign in, sign out, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      syncUser(session?.user ?? null);
      // Force server components to re-render so the Navbar reflects the correct session
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Close menu on route change
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${isTransparent ? styles.transparent : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={`${styles.logo} ${isTransparent ? styles.transparentText : ''}`} onClick={closeMenu} aria-label="NaijaList home">
          <MapPin className={styles.logoIcon} size={24} style={{ color: isTransparent ? 'white' : 'var(--color-primary)' }} aria-hidden="true" />
          <span className={styles.logoText}>
            Naija<span className={styles.logoAccent} style={{ color: isTransparent ? 'white' : 'var(--color-primary)' }}>List</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form action="/businesses" method="GET" className={styles.searchForm} role="search">
          <div className={styles.searchInputWrapper}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              name="q"
              className={styles.searchInput}
              placeholder="Search businesses..."
              autoComplete="off"
              aria-label="Search businesses"
            />
          </div>
        </form>

        {/* Desktop nav links */}
        <div className={`${styles.links} ${isTransparent ? styles.transparentLinks : ''}`} role="menubar">
          <Link href="/about" className={styles.link} role="menuitem">
            About
          </Link>
          <Link href="/businesses" className={styles.link} role="menuitem">
            All Businesses
          </Link>
          <Link href="/categories" className={styles.link} role="menuitem">
            Categories
          </Link>
          <Link href="/states" className={styles.link} role="menuitem">
            States
          </Link>
          <Link href="/faq" className={styles.link} role="menuitem">
            FAQ
          </Link>
          <Link href="/contact" className={styles.link} role="menuitem">
            Contact
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className={styles.actions}>
          {!authReady ? null : user ? (
            <Link
              href={dashboardHref}
              className={styles.profileButton}
              id="nav-profile"
              aria-label="Go to your dashboard"
              title="My Dashboard"
            >
              <span className={styles.profileAvatar} aria-hidden="true">
                {(user.email?.[0] ?? 'U').toUpperCase()}
              </span>
              <span className={styles.profileLabel}>My Dashboard</span>
            </Link>
          ) : (
            <>
              <Link href="/admin/login" className={`${styles.link} ${isTransparent ? styles.transparentText : ''}`} id="nav-signin" style={{ marginRight: '0.5rem' }}>
                Sign In
              </Link>
              <Link href="/list-business" className={`btn btn-sm ${isTransparent ? 'btn-primary' : 'btn-outline'}`} id="nav-list-business">
                List Your Business
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          id="mobile-menu-toggle"
        >
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.open : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu} id="mobile-menu" role="menu">
          <Link href="/about" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            About
          </Link>
          <Link href="/businesses" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            <Building2 size={18} /> All Businesses
          </Link>
          <Link href="/categories" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            <FolderOpen size={18} /> Categories
          </Link>
          <Link href="/states" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            <MapPin size={18} /> States
          </Link>
          <Link href="/faq" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            FAQ
          </Link>
          <Link href="/contact" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            Contact
          </Link>
          <div className={styles.mobileDivider} />
          {!authReady ? null : user ? (
            <Link href={dashboardHref} className={`${styles.mobileLink} ${styles.mobileCta}`} onClick={closeMenu} role="menuitem" id="nav-profile-mobile">
              <UserIcon size={18} /> My Dashboard
            </Link>
          ) : (
            <>
              <Link href="/admin/login" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
                <KeyRound size={18} /> Sign In
              </Link>
              <Link href="/list-business" className={`${styles.mobileLink} ${styles.mobileCta}`} onClick={closeMenu} role="menuitem">
                <Plus size={18} /> List Your Business
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
