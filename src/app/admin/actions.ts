'use server';

import { createClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/mock-data';
import { resolveBusinessCity, resolveReferenceId } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function upsertBusiness(formData: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { data: dbUser, error: userLookupError } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .maybeSingle();

  if (userLookupError) {
    console.error('Error fetching user profile for business save:', userLookupError);
    return { error: 'Could not verify your account permissions.' };
  }

  const role = dbUser?.role || 'owner';
  const businessId = dbUser?.business_id;
  const requestedBusinessId = typeof formData.id === 'string' ? formData.id : undefined;

  if (role === 'owner') {
    if (requestedBusinessId && requestedBusinessId !== businessId) {
      return { error: 'Unauthorized: You can only edit your own business.' };
    }
    if (!requestedBusinessId && businessId) {
      return { error: 'Your account already has a business profile.' };
    }
  }

  const cleanedFormData: Record<string, unknown> = {
    ...formData,
  };
  delete cleanedFormData.id;
  delete cleanedFormData.state_slug;

  if (role === 'owner') {
    delete cleanedFormData.is_featured;
    delete cleanedFormData.is_active;
    delete cleanedFormData.verification_tier;
  }

  if ('category_id' in formData || !requestedBusinessId) {
    const resolvedCategoryId = await resolveReferenceId(
      typeof formData.category_id === 'string' ? formData.category_id : undefined,
      'categories',
      CATEGORIES
    );
    if (!resolvedCategoryId) return { error: 'Please select a valid category before saving.' };
    cleanedFormData.category_id = resolvedCategoryId;
  }

  if ('state_slug' in formData || 'city_id' in formData || !requestedBusinessId) {
    const resolvedCity = await resolveBusinessCity(
      typeof formData.state_slug === 'string' ? formData.state_slug : undefined,
      typeof formData.city_id === 'string' ? formData.city_id : undefined
    );
    if (!resolvedCity.id) {
      return { error: resolvedCity.error ?? 'Please select a valid state and city before saving.' };
    }
    cleanedFormData.city_id = resolvedCity.id;
  }

  const saveQuery = requestedBusinessId
    ? supabase.from('businesses').update(cleanedFormData).eq('id', requestedBusinessId)
    : supabase.from('businesses').insert(cleanedFormData);
  const { data: bizData, error } = await saveQuery.select('id').maybeSingle();

  if (error) {
    console.error('Error upserting business:', error);
    return { error: error.message };
  }
  if (!bizData) return { error: 'Business not found or could not be saved.' };

  if (role === 'owner' && !businessId) {
    const { error: linkError } = await supabase
      .from('users')
      .update({ business_id: bizData.id })
      .eq('id', user.id);

    if (linkError) {
      console.error('Error linking business to owner profile:', linkError);
      return { error: 'The business was saved, but could not be linked to your account. Please contact support.' };
    }
  }
  
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/businesses');
  return { success: true, id: bizData.id };
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
