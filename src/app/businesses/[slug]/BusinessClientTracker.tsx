'use client';

import { useEffect } from 'react';
import { incrementPageViews } from '../actions';

export default function BusinessClientTracker({ businessId }: { businessId: string }) {
  useEffect(() => {
    // Increment page views once per mount
    incrementPageViews(businessId).catch(console.error);
  }, [businessId]);

  return null;
}
