'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Building2, FolderOpen, Globe2, LayoutDashboard, KeyRound, Plus, MapPin } from '@/components/Icons';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  // Close menu on route change
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={closeMenu} aria-label="NaijaList home">
          <MapPin className={styles.logoIcon} size={24} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <span className={styles.logoText}>
            Naija<span className={styles.logoAccent}>List</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className={styles.links} role="menubar">
          <Link href="/businesses" className={styles.link} role="menuitem">
            All Businesses
          </Link>
          <Link href="/categories" className={styles.link} role="menuitem">
            Categories
          </Link>
          <Link href="/cities" className={styles.link} role="menuitem">
            Cities
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className={styles.actions}>
          {isLoggedIn ? (
            <Link href="/admin" className="btn btn-outline btn-sm" id="nav-dashboard">
              My Dashboard
            </Link>
          ) : (
            <>
              <Link href="/admin/login" className={styles.link} id="nav-signin" style={{ marginRight: '0.5rem' }}>
                Sign In
              </Link>
              <Link href="/list-business" className="btn btn-outline btn-sm" id="nav-list-business">
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
          <Link href="/businesses" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            <Building2 size={18} /> All Businesses
          </Link>
          <Link href="/categories" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            <FolderOpen size={18} /> Categories
          </Link>
          <Link href="/cities" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            <Globe2 size={18} /> Cities
          </Link>
          <div className={styles.mobileDivider} />
          {isLoggedIn ? (
            <Link href="/admin" className={`${styles.mobileLink} ${styles.mobileCta}`} onClick={closeMenu} role="menuitem">
              <LayoutDashboard size={18} /> My Dashboard
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
