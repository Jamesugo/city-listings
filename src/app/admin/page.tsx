import { getBusinessesAdmin, getCategories, getCities } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role = 'owner';
  let businessId = null;
  
  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('role, business_id')
      .eq('id', user.id)
      .single();
      
    if (dbUser) {
      role = dbUser.role;
      businessId = dbUser.business_id;
    }
  }

  let businesses: any[] = [];
  if (role === 'admin') {
    businesses = await getBusinessesAdmin();
  } else if (businessId) {
    // For owners with a business, fetch just theirs using the existing full admin fetch
    // (A more optimized query could be used here, but this works for MVP)
    const all = await getBusinessesAdmin();
    businesses = all.filter(b => b.id === businessId);
  }

  const categories = await getCategories();
  const cities = await getCities();

  return (
    <AdminDashboard
      initialBusinesses={businesses}
      categories={categories}
      cities={cities}
      userRole={role}
    />
  );
}
