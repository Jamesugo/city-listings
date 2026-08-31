/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
import { CATEGORIES, STATES, CITIES, BUSINESSES } from '../src/lib/mock-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Seeding data to Supabase...');

  // 1. STATES
  console.log('Inserting states...');
  const statesToInsert = STATES.map((s: { name: string; slug: string }) => ({ name: s.name, slug: s.slug }));
  await supabase.from('states').upsert(statesToInsert, { onConflict: 'slug' });
  
  const { data: dbStates } = await supabase.from('states').select('id, slug');
  const stateIdMap = Object.fromEntries((dbStates as { id: string; slug: string }[]).map((s) => [s.slug, s.id]));

  // 2. CITIES
  console.log('Inserting cities...');
  // The mock data links city to state via stateId: 'state-1', which is ENUGU. We know the slug is 'enugu'.
  const citiesToInsert = CITIES.map((c: { name: string; slug: string }) => ({
    name: c.name,
    slug: c.slug,
    state_id: stateIdMap['enugu']
  }));
  await supabase.from('cities').upsert(citiesToInsert, { onConflict: 'slug' });

  const { data: dbCities } = await supabase.from('cities').select('id, slug');
  const cityIdMap = Object.fromEntries((dbCities as { id: string; slug: string }[]).map((c) => [c.slug, c.id]));

  // 3. CATEGORIES
  console.log('Inserting categories...');
  const categoriesToInsert = CATEGORIES.map((c: { name: string; slug: string; icon: string; description: string }) => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    description: c.description
  }));
  await supabase.from('categories').upsert(categoriesToInsert, { onConflict: 'slug' });

  const { data: dbCategories } = await supabase.from('categories').select('id, slug');
  const categoryIdMap = Object.fromEntries((dbCategories as { id: string; slug: string }[]).map((c) => [c.slug, c.id]));

  // 4. BUSINESSES
  console.log('Inserting businesses...');
  const businessesToInsert = BUSINESSES.map(b => {
    return {
      name: b.name,
      slug: b.slug,
      category_id: categoryIdMap[b.categorySlug],
      city_id: cityIdMap[b.citySlug],
      address: b.address,
      phone: b.phone,
      whatsapp: b.whatsapp,
      email: b.email,
      website: b.website,
      description: b.description,
      hours: b.hours,
      verification_tier: b.verificationTier,
      is_featured: b.isFeatured,
      is_active: b.isActive,
      cover_image_url: b.coverImageUrl,
      gallery: b.gallery || [],
      last_confirmed_at: b.lastConfirmedAt,
      created_at: b.createdAt || new Date().toISOString(),
      updated_at: b.updatedAt || new Date().toISOString()
    };
  });

  const { error: bizError } = await supabase.from('businesses').upsert(businessesToInsert, { onConflict: 'slug' });
  if (bizError) console.error('Error inserting businesses:', bizError);
  else console.log('Successfully seeded all businesses!');

  console.log('Seeding complete.');
}

seed();
