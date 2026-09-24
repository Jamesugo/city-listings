'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { NIGERIAN_STATES, groupStatesByLetter } from '@/lib/nigerianStates';
import type { City } from '@/lib/types';
import styles from './StatesDropdown.module.css';

interface StatesDropdownProps {
  variant?: 'hero' | 'page';
  cities?: City[];
}

export default function StatesDropdown({ variant = 'hero', cities = [] }: StatesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const grouped = groupStatesByLetter(NIGERIAN_STATES);
  const citiesByState = new Map<string, City[]>();
  for (const city of cities) {
    const stateCities = citiesByState.get(city.stateName) ?? [];
    stateCities.push(city);
    citiesByState.set(city.stateName, stateCities);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const isHero = variant === 'hero';

  return (
    <div className={`${styles.wrapper} ${isHero ? styles.wrapperHero : styles.wrapperPage}`} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isHero ? styles.triggerHero : styles.triggerPage}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        id="states-dropdown-trigger"
      >
        <svg className={styles.triggerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span className={styles.triggerLabel}>{isHero ? 'All Nigeria' : 'States'}</span>
        <svg className={`${styles.triggerChevron} ${open ? styles.triggerChevronOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <>
          {isHero && <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />}
          <div className={`${styles.panel} ${isHero ? styles.panelHero : styles.panelPage}`} role="listbox" aria-label="Select a state">
            <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>{isHero ? '🇳🇬 All Nigeria' : 'States & Cities'}</span>
            <button type="button" className={styles.panelClose} onClick={() => setOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div className={styles.panelGrid}>
            {Array.from(grouped.entries()).map(([letter, states]) => (
              <div key={letter} className={styles.letterGroup}>
                <span className={styles.letterLabel}>{letter}</span>
                <div className={styles.letterStates}>
                  {states.map((s) => (
                    <div key={s.slug} className={styles.stateItem}>
                      <button
                        type="button"
                        className={styles.stateLink}
                        aria-expanded={expandedState === s.slug}
                        onClick={() => setExpandedState((current) => current === s.slug ? null : s.slug)}
                        id={`state-option-${s.slug}`}
                      >
                        <span>{s.name} State</span>
                        <svg className={`${styles.stateArrow} ${expandedState === s.slug ? styles.stateArrowOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                      {expandedState === s.slug && (
                        <div className={styles.cityList}>
                          {(citiesByState.get(s.name) ?? []).map((city) => (
                            <Link
                              key={city.id}
                              href={`/cities/${city.slug}`}
                              className={styles.cityLink}
                              onClick={() => setOpen(false)}
                            >
                              {city.name}
                            </Link>
                          ))}
                          {(citiesByState.get(s.name) ?? []).length === 0 && (
                            <span className={styles.noCities}>No cities listed</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
