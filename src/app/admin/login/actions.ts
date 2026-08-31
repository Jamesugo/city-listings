'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  // Check user role to redirect appropriately
  if (authData.user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (dbUser?.role === 'user') {
      return redirect('/');
    } else if (dbUser?.role === 'owner') {
      return redirect('/dashboard');
    }
  }

  return redirect('/admin');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const accountType = (formData.get('accountType') as string) || 'owner';
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  if (authData.user) {
    // Insert into public.users with role based on account type selection
    await supabase.from('users').upsert({
      id: authData.user.id,
      email: authData.user.email,
      role: accountType === 'user' ? 'user' : 'owner',
    });
  }

  // Visitors go to homepage, business owners go to their dashboard
  if (accountType === 'user') {
    return redirect('/');
  }
  return redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/admin/login');
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/admin/update-password`,
  });

  if (error) {
    return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect(`/admin/login?message=${encodeURIComponent('Password reset link sent to your email.')}`);
}
