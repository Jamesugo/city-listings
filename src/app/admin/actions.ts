'use server';

import { createClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/mock-data';
import { resolveBusinessCity, resolveReferenceId } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function upsertBusiness(formData: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  const role = dbUser?.role || 'owner';
  const businessId = dbUser?.business_id;

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
  
  const resolvedCategoryId = await resolveReferenceId(
    typeof formData.category_id === 'string' ? formData.category_id : undefined,
    'categories',
    CATEGORIES
  );
  const resolvedCity = await resolveBusinessCity(
    typeof formData.state_slug === 'string' ? formData.state_slug : undefined,
    typeof formData.city_id === 'string' ? formData.city_id : undefined
  );

  if (!resolvedCategoryId) return { error: 'Please select a valid category before saving.' };
  if (!resolvedCity.id) return { error: resolvedCity.error ?? 'Please select a valid state and city before saving.' };

  const cleanedFormData: Record<string, unknown> = {
    ...formData,
    category_id: resolvedCategoryId,
    city_id: resolvedCity.id,
  };
  delete cleanedFormData.state_slug;

  // Upsert business and return the inserted data to get the ID
  const { data: bizData, error } = await supabase
    .from('businesses')
    .upsert(cleanedFormData, { onConflict: 'slug' })
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

export async function deleteBusiness(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  const role = dbUser?.role || 'owner';

  // Owners can only delete their own business
  if (role === 'owner' && dbUser?.business_id !== id) {
    return { error: 'Unauthorized: You can only delete your own business.' };
  }

  // Soft-delete: set is_active = false
  const { error } = await supabase
    .from('businesses')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting business:', error);
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/businesses');
  return { success: true };
}

export async function toggleFeatured(id: string, currentValue: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only admins can toggle featured
  if (dbUser?.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can feature businesses.' };
  }

  const { error } = await supabase
    .from('businesses')
    .update({ is_featured: !currentValue })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin');
  revalidatePath('/businesses');
  return { success: true };
}

export async function submitOwnerResponse(reviewId: string, response: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify the user is the owner of the business linked to this review
  const { data: review } = await supabase
    .from('reviews')
    .select('business_id')
    .eq('id', reviewId)
    .single();

  if (!review) return { error: 'Review not found' };

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  if (dbUser?.role !== 'admin' && dbUser?.business_id !== review.business_id) {
    return { error: 'Unauthorized: You can only respond to reviews for your own business.' };
  }

  const { error } = await supabase
    .from('reviews')
    .update({ owner_response: response })
    .eq('id', reviewId);

  if (error) return { error: error.message };

  revalidatePath(`/businesses`);
  return { success: true };
}
