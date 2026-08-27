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
  // Phase 2+
  averageRating?: number;
  reviewCount?: number;
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
>;

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
}
