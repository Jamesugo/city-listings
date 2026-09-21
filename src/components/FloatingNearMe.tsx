'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from '@/components/Icons';
import styles from './FloatingNearMe.module.css';

export default function FloatingNearMe() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const params = new URLSearchParams();
        params.set('lat', position.coords.latitude.toString());
        params.set('lng', position.coords.longitude.toString());
        router.push(`/businesses?${params.toString()}`);
      },
      () => {
        setIsLoading(false);
        alert('Unable to retrieve your location. Please check your browser permissions.');
      }
    );
  };

  return (
    <button 
      onClick={handleNearMe} 
      className={styles.floatingBtn}
      disabled={isLoading}
      aria-label="Find businesses near me"
      title="Find businesses near me"
    >
      <MapPin size={24} className={styles.icon} />
      <span className={styles.tooltip}>{isLoading ? 'Locating...' : 'Near Me'}</span>
    </button>
  );
}
