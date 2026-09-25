/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from './supabase/server';
import type { Category, State, City, Business, BusinessCard, Review } from './types';
import { BUSINESSES, CATEGORIES, CITIES } from './mock-data';

// ============================================================
// Helper functions — data access layer (Supabase Phase 2/3)
// ============================================================

export function isOpenNow(hoursObj?: Record<string, string>): boolean {
  if (!hoursObj) return false;
  
  const now = new Date();
  // Simple check for Nigerian time UTC+1
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = days[now.getDay()];
  
  const todayHours = hoursObj[currentDay];
  if (!todayHours || todayHours === 'Closed') return false;
  if (todayHours.toLowerCase() === '24 hours' || todayHours.toLowerCase() === 'open 24 hours') return true;
  
  // Basic parsing for "8am-5pm" or "8:00 AM - 5:00 PM"
  try {
    const parts = todayHours.split(/[-–to]/i).map(s => s.trim());
    if (parts.length !== 2) return true; // Can't parse, assume open to be safe or false? Let's say true to not hide it unnecessarily.
    
    const parseTime = (timeStr: string) => {
      let [time, modifier] = [timeStr, ''];
      if (timeStr.toLowerCase().includes('am')) modifier = 'am';
      if (timeStr.toLowerCase().includes('pm')) modifier = 'pm';
      time = time.replace(/am|pm/i, '').trim();
      
      let [hours, minutes] = time.split(':').map(Number);
      if (isNaN(minutes)) minutes = 0;
      
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };
    
    const startMins = parseTime(parts[0]);
    const endMins = parseTime(parts[1]);
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    return currentMins >= startMins && currentMins <= endMins;
  } catch {
    return true; // Fallback
  }
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, businesses(count)')
    .order('name');

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('categories')
      .select('id, name, slug, icon, description')
      .order('name');

    if (fallbackError) {
      console.error('Error fetching categories:', fallbackError);
      return [];
    }

    const categories = fallbackData.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      businessCount: 0,
    }));

    return categories.length > 0 ? categories : CATEGORIES;
  }

  const categories = data.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    description: cat.description,
    businessCount: cat.businesses?.[0]?.count || 0,
  }));

  return categories.length > 0 ? categories : CATEGORIES;
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

  if (error) {
    return CITIES.map((city) => ({
      ...city,
      businessCount: BUSINESSES.filter((business) => business.cityId === city.id).length,
    }));
  }

  const cities = data.map((city: any) => ({
    id: city.id,
    name: city.name,
    slug: city.slug,
    stateId: city.state_id,
    stateName: city.states?.name || '',
    businessCount: city.businesses?.[0]?.count || 0,
  }));

  return cities.length > 0 ? cities : CITIES;
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

export async function getCitiesGroupedByState(): Promise<Map<string, City[]>> {
  const cities = await getCities();
  const grouped = new Map<string, City[]>();
  for (const city of cities) {
    const stateName = city.stateName || 'Unknown';
    if (!grouped.has(stateName)) grouped.set(stateName, []);
    grouped.get(stateName)!.push(city);
  }
  return grouped;
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
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  openNow?: boolean;
} = {}): Promise<BusinessCard[]> {
  const supabase = await createClient();

  const pageSize = filters.limit ?? PAGE_SIZE;
  const page = filters.page ?? 1;
  const offset = (page - 1) * pageSize;

  // We attempt to use the new RPC function for geospatial and advanced filtering
  // If lat/lng are provided, we MUST use it. Otherwise, we can still use it for minRating.
  const { data: rpcData, error: rpcError } = await supabase.rpc('search_businesses_geo', {
    p_lat: filters.lat || null,
    p_lng: filters.lng || null,
    p_radius_km: filters.radius || 10,
    p_category_slug: filters.categorySlug || null,
    p_city_slug: filters.citySlug || null,
    p_search_query: filters.searchQuery?.trim() || null,
    p_min_rating: filters.minRating || 0,
    p_limit: 100, // Fetch more to allow for openNow JS filtering
    p_offset: 0     // We'll paginate in memory if openNow is true, or let SQL handle it if false.
  });

  if (!rpcError && rpcData) {
    let results = rpcData;
    
    // JS Filtering for openNow
    if (filters.openNow) {
       // Since the RPC doesn't return hours, we need to fetch hours for these IDs
       const ids = results.map((r: any) => r.id);
       const { data: hoursData } = await supabase.from('businesses').select('id, hours').in('id', ids);
       const hoursMap = new Map(hoursData?.map(h => [h.id, h.hours]) || []);
       
       results = results.filter((r: any) => isOpenNow(hoursMap.get(r.id)));
    }
    
    // In-memory pagination
    results = results.slice(offset, offset + pageSize);

    return results.map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      categoryName: b.category_name,
      categorySlug: b.category_slug,
      cityName: b.city_name,
      citySlug: b.city_slug,
      stateName: b.state_name || '',
      address: b.address,
      phone: b.phone,
      whatsapp: b.whatsapp,
      verificationTier: b.verification_tier,
      isFeatured: b.is_featured,
      coverImageUrl: b.cover_image_url,
      averageRating: b.average_rating,
      reviewCount: b.review_count,
      lastConfirmedAt: b.last_confirmed_at,
      lat: b.lat,
      lng: b.lng,
      distance_km: b.distance_km,
      subscriptionTier: b.subscription_tier || 'free',
    }));
  }

  // Fallback to original query if RPC fails (e.g., script not run yet)
  console.warn("Falling back to standard query. Ensure geo_search_update.sql is run in Supabase.");
  const from = offset;
  const to = from + pageSize - 1;

  // Two-step lookups to avoid invalid PostgREST dot-notation filter
  let categoryId: string | undefined;
  if (filters.categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', filters.categorySlug).single();
    categoryId = cat?.id;
    if (!categoryId) return [];
  }

  let cityId: string | undefined;
  if (filters.citySlug) {
    const { data: city } = await supabase.from('cities').select('id').eq('slug', filters.citySlug).single();
    cityId = city?.id;
    if (!cityId) return [];
  }

  let query = supabase
    .from('businesses')
    .select(`
      id, name, slug, address, phone, whatsapp,
      verification_tier, is_featured, cover_image_url, last_confirmed_at,
      category_id, city_id, hours, lat, lng, average_rating, review_count, subscription_tier,
      categories!inner(name, slug),
      cities!inner(name, slug, states(name))
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);
  if (cityId) query = query.eq('city_id', cityId);
  if (filters.featured !== undefined) query = query.eq('is_featured', filters.featured);
  if (filters.minRating) query = query.gte('average_rating', filters.minRating);

  if (filters.searchQuery && filters.searchQuery.trim()) {
    query = (query as any).textSearch('search_vector', filters.searchQuery.trim(), {
      type: 'websearch',
      config: 'english',
    });
  }

  const result = await query;
  let data = result.data;
  const { error } = result;
  if (error || !data) return [];
  
  if (filters.openNow) {
    data = data.filter((b: any) => isOpenNow(b.hours));
  }
  
  data = data.slice(from, to + 1);

  return data.map((b: any) => ({
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
    averageRating: b.average_rating || 0,
    reviewCount: b.review_count || 0,
    lastConfirmedAt: b.last_confirmed_at,
    lat: b.lat,
    lng: b.lng,
    subscriptionTier: b.subscription_tier || 'free',
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
    callClicks: data.call_clicks || 0,
    averageRating: data.average_rating || 0,
    reviewCount: data.review_count || 0,
    lat: data.lat,
    lng: data.lng,
    subscriptionTier: data.subscription_tier || 'free',
    videoGallery: data.video_gallery || [],
  };
}

export async function getFeaturedBusinesses(limit: number = 6): Promise<BusinessCard[]> {
  const featured = await getBusinesses({ featured: true, limit });
  if (featured.length >= 2) return featured;

  return getBusinesses({ limit });
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

export async function getRecentReviews(limit: number = 6): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users(id, email, phone),
      business:businesses(id, name, slug, category_id, city_id, address, phone, verification_tier, is_featured, is_active, cover_image_url)
    `)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent reviews:', error);
    return [];
  }

  return data.map((r: any) => ({
    id: r.id,
    business_id: r.business_id,
    user_id: r.user_id,
    rating: r.rating,
    body: r.body,
    owner_response: r.owner_response,
    is_flagged: r.is_flagged,
    created_at: r.created_at,
    user: r.user ? {
      id: r.user.id,
      email: r.user.email,
      phone: r.user.phone,
      created_at: r.user.created_at || new Date().toISOString(),
    } : undefined,
    business: r.business ? {
      id: r.business.id,
      name: r.business.name,
      slug: r.business.slug,
      categoryName: '', // omitted for brevity unless needed
      categorySlug: '',
      cityName: '',
      citySlug: '',
      stateName: '',
      address: r.business.address,
      phone: r.business.phone,
      verificationTier: r.business.verification_tier,
      isFeatured: r.business.is_featured,
      coverImageUrl: r.business.cover_image_url,
    } : undefined,
  }));
}

