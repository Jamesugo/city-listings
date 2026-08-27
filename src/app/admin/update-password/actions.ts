'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    return redirect('/admin/update-password?error=' + encodeURIComponent('Passwords do not match'));
  }

  if (password.length < 6) {
    return redirect('/admin/update-password?error=' + encodeURIComponent('Password must be at least 6 characters'));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return redirect('/admin/update-password?error=' + encodeURIComponent(error.message));
  }

  // On success, redirect back to the dashboard
  return redirect('/admin');
}
