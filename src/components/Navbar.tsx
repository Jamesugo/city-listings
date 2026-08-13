'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
          <span className={styles.logoIcon} aria-hidden="true">🇳🇬</span>
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
          <Link href="/admin" className="btn btn-outline btn-sm" id="nav-list-business">
            List Your Business
          </Link>
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
            🏢 All Businesses
          </Link>
          <Link href="/categories" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            📂 Categories
          </Link>
          <Link href="/cities" className={styles.mobileLink} onClick={closeMenu} role="menuitem">
            🌍 Cities
          </Link>
          <div className={styles.mobileDivider} />
          <Link href="/admin" className={`${styles.mobileLink} ${styles.mobileCta}`} onClick={closeMenu} role="menuitem">
            ➕ List Your Business
          </Link>
        </div>
      )}
    </nav>
  );
}
