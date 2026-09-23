import { redirect } from 'next/navigation';
import { getBusinessesAdmin, getCategories, getCities } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/admin/login');
  }

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  if (!user.email || !adminEmails.includes(user.email)) {
    redirect('/dashboard'); 
  }

  const businesses = await getBusinessesAdmin();
  const categories = await getCategories();
  const cities = await getCities();

  return (
    <AdminDashboard
      initialBusinesses={businesses}
      categories={categories}
      cities={cities}
    />
  );
}
