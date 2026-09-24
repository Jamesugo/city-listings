'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BusinessCard } from '@/lib/types';
import styles from './HeroSlider.module.css';

interface HeroSliderProps {
  businesses: BusinessCard[];
}

const getCatchphrase = (categorySlug: string): string => {
  const slug = categorySlug.toLowerCase();
  
  if (['restaurants', 'food', 'cafes', 'dining', 'bakeries'].some(k => slug.includes(k))) {
    return 'Craving great food?';
  }
  if (['plumbers', 'handyman', 'mechanics', 'electricians', 'repairs', 'auto', 'services'].some(k => slug.includes(k))) {
    return 'Leave it to the pros';
  }
  if (['hospitals', 'clinics', 'pharmacy', 'health', 'medical', 'doctors'].some(k => slug.includes(k))) {
    return 'Your health, our priority';
  }
  if (['shops', 'boutique', 'fashion', 'shopping', 'retail'].some(k => slug.includes(k))) {
    return 'Find what you need locally';
  }
  if (['beauty', 'salon', 'spa', 'barbershop', 'hair'].some(k => slug.includes(k))) {
    return 'Look and feel your best';
  }
  if (['real-estate', 'housing', 'rentals', 'apartments', 'properties'].some(k => slug.includes(k))) {
    return 'Find your dream space';
  }
  if (['tech', 'software', 'it', 'computers', 'phones'].some(k => slug.includes(k))) {
    return 'Expert tech solutions near you';
  }

  // Fallback
  return 'Find the best local services';
};

const getCategoryImage = (categorySlug: string): string => {
  const slug = categorySlug.toLowerCase();
  
  if (['restaurants', 'food', 'cafes', 'dining', 'bakeries'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80'; // Restaurant/Food
  }
  if (['plumbers', 'handyman', 'mechanics', 'electricians', 'repairs', 'auto', 'services'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80'; // Tools/Repairs
  }
  if (['hospitals', 'clinics', 'pharmacy', 'health', 'medical', 'doctors'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1200&q=80'; // Health/Medical
  }
  if (['shops', 'boutique', 'fashion', 'shopping', 'retail'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'; // Shop/Retail
  }
  if (['beauty', 'salon', 'spa', 'barbershop', 'hair'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80'; // Beauty/Salon
  }
  if (['real-estate', 'housing', 'rentals', 'apartments', 'properties'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'; // Real Estate
  }
  if (['tech', 'software', 'it', 'computers', 'phones'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80'; // Tech/Laptop
  }
  if (['education', 'tutoring', 'school'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80'; // Education
  }
  if (['events', 'entertainment', 'party'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80'; // Events
  }
  if (['finance', 'insurance', 'bank'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80'; // Finance/Business
  }
  if (['hotels', 'lodging', 'accommodation'].some(k => slug.includes(k))) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'; // Hotel
  }

  // Generic fallback
  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80';
};

export default function HeroSlider({ businesses }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (businesses.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % businesses.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [businesses.length]);

  if (!businesses || businesses.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={`${styles.imageWrapper} ${styles.activeImage}`}>
          <div className={styles.imagePlaceholder} />
          <div className={styles.overlay} />
        </div>
        <div className={styles.contentWrapper}>
          <h1 className={styles.heroTitle}>Find trusted local businesses</h1>
          <Link href="/businesses" className={styles.actionBtn}>
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Explore businesses
          </Link>
        </div>
      </div>
    );
  }

  const currentBusiness = businesses[currentIndex];

  return (
    <div className={styles.sliderContainer}>
      {/* Background Section (No Images) */}
      {businesses.map((biz, index) => {
        return (
          <div
            key={biz.id}
            className={`${styles.imageWrapper} ${index === currentIndex ? styles.activeImage : ''}`}
          >
            <div
              className={styles.imagePlaceholder}
              style={{
                backgroundImage: `url(${biz.coverImageUrl || getCategoryImage(biz.categorySlug || '')})`,
              }}
            />
            <div className={styles.overlay} />
          </div>
        );
      })}

      {/* Main Content Overlay */}
      <div className={styles.contentWrapper}>
        <h1 className={styles.heroTitle}>{getCatchphrase(currentBusiness.categorySlug || '')}</h1>
        
        <Link href={`/categories/${currentBusiness.categorySlug}`} className={styles.actionBtn}>
          <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {currentBusiness.categoryName}
        </Link>
      </div>

      {/* Left Navigation Indicators */}
      <div className={styles.indicators}>
        {businesses.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.activeIndicator : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom Left Credit */}
      <div className={styles.credit}>
        <Link href={`/businesses/${currentBusiness.slug}`} className={styles.creditLink}>
          <strong>{currentBusiness.name}</strong>
        </Link>
        <span>Photo from the business owner</span>
      </div>
    </div>
  );
}
