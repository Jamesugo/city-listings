// ============================================================
// Core TypeScript types for NaijaList
// Designed to map 1:1 to the Supabase/PostgreSQL schema
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // emoji or icon name
  description: string;
  businessCount?: number;
}

export interface State {
  id: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  stateId: string;
  stateName: string;
  businessCount?: number;
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type BusinessHours = {
  [key in DayOfWeek]?: string; // e.g. "8am–6pm" or "Closed"
};

export type VerificationTier = 'none' | 'phone' | 'cac';

export interface Business {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  cityId: string;
  cityName: string;
  citySlug: string;
  stateId: string;
  stateName: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  description: string;
  hours?: BusinessHours;
  verificationTier: VerificationTier;
  isFeatured: boolean;
  isActive: boolean;
  coverImageUrl?: string;
  gallery?: string[];
  lastConfirmedAt?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  pageViews?: number;
  whatsappClicks?: number;
  // Advanced Features
  averageRating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
  // Subscriptions & Leads
  subscriptionTier?: 'free' | 'pro' | 'premium';
  callClicks?: number;
  videoGallery?: string[];
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  business_id?: string;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  body: string;
  owner_response?: string;
  is_flagged: boolean;
  created_at: string;
  // Joined fields
  user?: User;
  business?: BusinessCard;
}

export interface BusinessPromo {
  id: string;
  business_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  active_until?: string;
}

// Lightweight card variant used in listing grids
export type BusinessCard = Pick<
  Business,
  | 'id'
  | 'name'
  | 'slug'
  | 'categoryName'
  | 'categorySlug'
  | 'cityName'
  | 'citySlug'
  | 'stateName'
  | 'address'
  | 'phone'
  | 'whatsapp'
  | 'verificationTier'
  | 'isFeatured'
  | 'coverImageUrl'
  | 'averageRating'
  | 'reviewCount'
  | 'lastConfirmedAt'
  | 'lat'
  | 'lng'
  | 'subscriptionTier'
> & { distance_km?: number };

// Admin form payload
export interface BusinessFormData {
  name: string;
  slug: string;
  categoryId: string;
  cityId: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  description: string;
  hours?: BusinessHours;
  verificationTier?: VerificationTier;
  isFeatured?: boolean;
  isActive?: boolean;
  coverImageUrl?: string;
  gallery?: string[];
}

// Filter params for business list pages
export interface BusinessFilters {
  category?: string; // slug
  city?: string; // slug
  state?: string; // slug
  query?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  openNow?: boolean;
}
