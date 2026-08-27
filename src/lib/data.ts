import { createClient } from './supabase/server';
import type { Category, State, City, Business, BusinessCard } from './types';

// ============================================================
// Helper functions — data access layer (Supabase Phase 2/3)
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

// ============================================================
// Business listing — supports FTS, pagination, filters
// ============================================================

const PAGE_SIZE = 24;

export async function getBusinesses(filters: {
  categorySlug?: string;
  citySlug?: string;
  featured?: boolean;
  limit?: number;
  searchQuery?: string;
  page?: number;
} = {}): Promise<BusinessCard[]> {
  const supabase = await createClient();

  const pageSize = filters.limit ?? PAGE_SIZE;
  const page = filters.page ?? 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Two-step lookups to avoid invalid PostgREST dot-notation filter
  let categoryId: string | undefined;
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .single();
    categoryId = cat?.id;
    // If slug not found, return nothing
    if (!categoryId) return [];
  }

  let cityId: string | undefined;
  if (filters.citySlug) {
    const { data: city } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', filters.citySlug)
      .single();
    cityId = city?.id;
    if (!cityId) return [];
  }

  let query = supabase
    .from('businesses')
    .select(`
      id, name, slug, address, phone, whatsapp,
      verification_tier, is_featured, cover_image_url, last_confirmed_at,
      category_id, city_id,
      categories!inner(name, slug),
      cities!inner(name, slug, states(name)),
      reviews(rating)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (categoryId) query = query.eq('category_id', categoryId);
  if (cityId) query = query.eq('city_id', cityId);
  if (filters.featured !== undefined) query = query.eq('is_featured', filters.featured);

  // Server-side full-text search using the search_vector GIN index
  if (filters.searchQuery && filters.searchQuery.trim()) {
    query = (query as any).textSearch('search_vector', filters.searchQuery.trim(), {
      type: 'websearch',
      config: 'english',
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return data.map((b: any) => {
    const ratings: number[] = b.reviews?.map((r: any) => r.rating) ?? [];
    const reviewCount = ratings.length;
    const averageRating =
      reviewCount > 0
        ? Math.round((ratings.reduce((s: number, r: number) => s + r, 0) / reviewCount) * 10) / 10
        : 0;

    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      categoryName: (b.categories as any).name,
      categorySlug: (b.categories as any).slug,
      cityName: (b.cities as any).name,
      citySlug: (b.cities as any).slug,
      stateName: (b.cities as any).states?.name || '',
      address: b.address,
      phone: b.phone,
      whatsapp: b.whatsapp,
      verificationTier: b.verification_tier,
      isFeatured: b.is_featured,
      coverImageUrl: b.cover_image_url,
      averageRating,
      reviewCount,
      lastConfirmedAt: b.last_confirmed_at,
    };
  });
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
      cities(name, slug, states(id, name)),
      reviews(rating)
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) return undefined;

  const ratings: number[] = (data.reviews ?? []).map((r: any) => r.rating);
  const reviewCount = ratings.length;
  const averageRating =
    reviewCount > 0
      ? Math.round((ratings.reduce((s: number, r: number) => s + r, 0) / reviewCount) * 10) / 10
      : 0;

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
    averageRating,
    reviewCount,
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
    .select('id, rating, body, owner_response, created_at, users(email)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getBusinessCount(filters: {
  categorySlug?: string;
  citySlug?: string;
  searchQuery?: string;
} = {}): Promise<number> {
  const supabase = await createClient();

  let categoryId: string | undefined;
  if (filters.categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', filters.categorySlug).single();
    categoryId = cat?.id;
    if (!categoryId) return 0;
  }

  let cityId: string | undefined;
  if (filters.citySlug) {
    const { data: city } = await supabase.from('cities').select('id').eq('slug', filters.citySlug).single();
    cityId = city?.id;
    if (!cityId) return 0;
  }

  let query = supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('is_active', true);

  if (categoryId) query = query.eq('category_id', categoryId);
  if (cityId) query = query.eq('city_id', cityId);
  if (filters.searchQuery?.trim()) {
    query = (query as any).textSearch('search_vector', filters.searchQuery.trim(), {
      type: 'websearch',
      config: 'english',
    });
  }

  const { count } = await query;
  return count ?? 0;
}
