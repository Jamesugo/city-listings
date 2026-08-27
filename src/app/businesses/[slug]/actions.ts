'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to submit a review' };
  }

  const business_id = formData.get('business_id') as string;
  const rating = parseInt(formData.get('rating') as string, 10);
  const body = formData.get('body') as string;
  const slug = formData.get('slug') as string;

  if (!business_id || !rating || rating < 1 || rating > 5) {
    return { error: 'Invalid review data' };
  }

  // Ensure the user exists in public.users
  await supabase.from('users').upsert(
    { id: user.id, email: user.email, role: 'user' },
    { onConflict: 'id' }
  );

  const { error } = await supabase.from('reviews').upsert({
    business_id,
    user_id: user.id,
    rating,
    body,
  }, { onConflict: 'business_id, user_id' });

  if (error) {
    console.error('Error submitting review:', error);
    return { error: error.message };
  }

  revalidatePath(`/businesses/${slug}`);
  return { success: true };
}
