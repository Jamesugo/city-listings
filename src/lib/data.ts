import { createClient } from './supabase/server';
import type { Category, State, City, Business, BusinessCard } from './types';

// ============================================================
// Helper functions — data access layer (Supabase Phase 2)
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, businesses(count)')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    description: cat.description,
    businessCount: cat.businesses?.[0]?.count || 0,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return undefined;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    description: data.description,
  };
}

export async function getStates(): Promise<State[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('states').select('*').order('name');

  if (error) return [];

  return data.map((state: any) => ({
    id: state.id,
    name: state.name,
    slug: state.slug,
  }));
}

export async function getCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cities')
    .select('*, states(name), businesses(count)')
    .order('name');

  if (error) return [];

  return data.map((city: any) => ({
    id: city.id,
    name: city.name,
    slug: city.slug,
    stateId: city.state_id,
    stateName: city.states?.name || '',
    businessCount: city.businesses?.[0]?.count || 0,
  }));
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cities')
    .select('*, states(name)')
    .eq('slug', slug)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    stateId: data.state_id,
    stateName: data.states?.name || '',
  };
}

export async function getBusinesses(filters: {
  categorySlug?: string;
  citySlug?: string;
  featured?: boolean;
  limit?: number;
} = {}): Promise<BusinessCard[]> {
  const supabase = await createClient();
  let query = supabase
    .from('businesses')
    .select(`
      *,
      categories!inner(name, slug),
      cities!inner(name, slug, states(name))
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters.categorySlug) {
    query = query.eq('categories.slug', filters.categorySlug);
  }
  if (filters.citySlug) {
    query = query.eq('cities.slug', filters.citySlug);
  }
  if (filters.featured !== undefined) {
    query = query.eq('is_featured', filters.featured);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return data.map((b: any) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    categoryName: b.categories.name,
    categorySlug: b.categories.slug,
    cityName: b.cities.name,
    citySlug: b.cities.slug,
    stateName: b.cities.states?.name || '',
    address: b.address,
    phone: b.phone,
    whatsapp: b.whatsapp,
    verificationTier: b.verification_tier,
    isFeatured: b.is_featured,
    coverImageUrl: b.cover_image_url,
    averageRating: b.averageRating || 0,
    reviewCount: b.reviewCount || 0,
  }));
}

// Full Business[] fetch for the admin dashboard (includes inactive + all fields)
export async function getBusinessesAdmin(): Promise<Business[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select(`*, categories(id, name, slug), cities(id, name, slug, state_id, states(name))`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching businesses (admin):', error);
    return [];
  }

  return data.map((b: any) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    categoryId: b.category_id,
    categoryName: b.categories?.name || '',
    categorySlug: b.categories?.slug || '',
    cityId: b.city_id,
    cityName: b.cities?.name || '',
    citySlug: b.cities?.slug || '',
    stateId: b.cities?.state_id || '',
    stateName: b.cities?.states?.name || '',
    address: b.address,
    phone: b.phone,
    whatsapp: b.whatsapp,
    email: b.email,
    website: b.website,
    description: b.description,
    hours: b.hours,
    verificationTier: b.verification_tier,
    isFeatured: b.is_featured,
    isActive: b.is_active,
    coverImageUrl: b.cover_image_url,
    gallery: b.gallery,
    lastConfirmedAt: b.last_confirmed_at,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    pageViews: b.page_views || 0,
    whatsappClicks: b.whatsapp_clicks || 0,
  }));
}


export async function getBusinessBySlug(slug: string): Promise<Business | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      categories(name, slug),
      cities(name, slug, states(id, name))
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    categoryId: data.category_id,
    categoryName: data.categories?.name || '',
    categorySlug: data.categories?.slug || '',
    cityId: data.city_id,
    cityName: data.cities?.name || '',
    citySlug: data.cities?.slug || '',
    stateId: data.cities?.states?.id || '',
    stateName: data.cities?.states?.name || '',
    address: data.address,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    website: data.website,
    description: data.description,
    hours: data.hours,
    verificationTier: data.verification_tier,
    isFeatured: data.is_featured,
    isActive: data.is_active,
    coverImageUrl: data.cover_image_url,
    gallery: data.gallery,
    lastConfirmedAt: data.last_confirmed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pageViews: data.page_views || 0,
    whatsappClicks: data.whatsapp_clicks || 0,
    averageRating: data.averageRating || 0,
    reviewCount: data.reviewCount || 0,
  };
}

export async function getFeaturedBusinesses(limit: number = 6): Promise<BusinessCard[]> {
  return getBusinesses({ featured: true, limit });
}

export async function getRelatedBusinesses(business: Business, limit: number = 3): Promise<BusinessCard[]> {
  const businesses = await getBusinesses({ categorySlug: business.categorySlug, limit: limit + 1 });
  return businesses.filter((b) => b.id !== business.id).slice(0, limit);
}

export async function getReviews(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, body, created_at, users(email)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return data || [];
}
