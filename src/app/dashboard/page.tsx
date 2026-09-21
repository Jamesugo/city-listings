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

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  if (!dbUser || dbUser.role !== 'owner') {
    redirect('/admin/login');
  }

  let businesses: Business[] = [];
  if (dbUser.business_id) {
    const all = await getBusinessesAdmin();
    businesses = all.filter(b => b.id === dbUser.business_id);
  }

  const categories = await getCategories();
  const cities = await getCities();
  const states = await getStates();

  return (
    <OwnerDashboard
      initialBusinesses={businesses}
      categories={categories}
      cities={cities}
      states={states}
      initialTier={tier}
    />
  );
}
