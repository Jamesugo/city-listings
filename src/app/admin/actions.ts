'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function upsertBusiness(formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  const role = dbUser?.role || 'owner';
  let businessId = dbUser?.business_id;

  // RBAC checks for business owners
  if (role === 'owner') {
    // If they already have a business, they can only edit their own
    if (businessId && formData.id && formData.id !== businessId) {
      return { error: 'Unauthorized: You can only edit your own business.' };
    }
    // Prevent owners from overriding admin settings
    delete formData.is_featured;
    delete formData.is_active;
    delete formData.verification_tier;
  }
  
  // Upsert business and return the inserted data to get the ID
  const { data: bizData, error } = await supabase
    .from('businesses')
    .upsert(formData, { onConflict: 'slug' })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error upserting business:', error);
    return { error: error.message };
  }

  // If this is an owner creating their first business, link it to their user account
  if (role === 'owner' && !businessId && bizData?.id) {
    await supabase
      .from('users')
      .update({ business_id: bizData.id })
      .eq('id', user.id);
  }
  
  revalidatePath('/admin');
  revalidatePath('/businesses');
  return { success: true };
}
