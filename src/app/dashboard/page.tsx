import { redirect } from 'next/navigation';
import { getBusinessesAdmin, getCategories, getCities, getStates } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import type { Business } from '@/lib/types';
import OwnerDashboard from './OwnerDashboard';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: dbUser, error: profileLookupError } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileLookupError) {
    console.error('Failed to load user profile:', profileLookupError);
    redirect(`/admin/login?error=${encodeURIComponent('Your account is signed in, but your user profile could not be loaded.')}`);
  }

  let ownerProfile = dbUser;
  if (!ownerProfile) {
    const { data: createdProfile, error: profileCreateError } = await supabase
      .from('users')
      .upsert(
        { id: user.id, email: user.email, role: 'owner' },
        { onConflict: 'id' }
      )
      .select('business_id')
      .single();

    if (profileCreateError || !createdProfile) {
      console.error('Failed to create user profile:', {
        code: profileCreateError?.code,
        message: profileCreateError?.message,
        details: profileCreateError?.details,
        hint: profileCreateError?.hint,
      });
      redirect(`/admin/login?error=${encodeURIComponent('Your account is signed in, but your user profile could not be created.')}`);
    }

    ownerProfile = createdProfile;
  }

  const [businesses, categories, cities, states] = await Promise.all([
    ownerProfile.business_id ? getBusinessesAdmin(ownerProfile.business_id) : Promise.resolve([] as Business[]),
    getCategories(),
    getCities(),
    getStates(),
  ]);
  const initialTier = tier === 'pro' || tier === 'premium' ? tier : 'free';

  return (
    <OwnerDashboard
      key={`${businesses[0]?.id ?? 'new'}:${businesses[0]?.updatedAt ?? ''}`}
      initialBusinesses={businesses}
      categories={categories}
      cities={cities}
      states={states}
      initialTier={initialTier}
    />
  );
}
