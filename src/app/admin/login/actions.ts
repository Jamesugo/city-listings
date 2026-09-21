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

  const tier = formData.get('tier') as string;
  const queryString = tier ? `?tier=${tier}` : '';

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
      return redirect(`/dashboard${queryString}`);
    }
  }

  return redirect(`/admin${queryString}`);
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  const tier = formData.get('tier') as string;
  const queryString = tier ? `?tier=${tier}` : '';

  if (error) {
    return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  if (authData.user) {
    // Insert into public.users with role 'owner'
    await supabase.from('users').upsert({
      id: authData.user.id,
      email: authData.user.email,
      role: 'owner',
    });
  }

  return redirect(`/dashboard${queryString}`);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
  
  if (error) {
    return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }
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
