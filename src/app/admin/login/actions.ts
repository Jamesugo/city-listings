'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: FormDataEntryValue | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

function isValidPassword(value: string, minLength = 8): boolean {
  return value.length >= minLength;
}

export async function login(formData: FormData) {
  const email = normalizeEmail(formData.get('email'));
  const passwordValue = formData.get('password');
  const password = typeof passwordValue === 'string' ? passwordValue : '';
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    return redirect('/admin/login?error=' + encodeURIComponent('Please provide a valid email address.'));
  }

  if (!isValidPassword(password)) {
    return redirect('/admin/login?error=' + encodeURIComponent('Password must be at least 8 characters long.'));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const tierValue = formData.get('tier');
  const tier = typeof tierValue === 'string' ? tierValue : '';
  const queryString = tier ? `?tier=${tier}` : '';

  if (error) {
    return redirect('/admin/login?error=' + encodeURIComponent('Invalid email or password.'));
  }

  return redirect(`/dashboard${queryString}`);
}

export async function signup(formData: FormData) {
  const email = normalizeEmail(formData.get('email'));
  const passwordValue = formData.get('password');
  const password = typeof passwordValue === 'string' ? passwordValue : '';
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    return redirect('/admin/login?error=' + encodeURIComponent('Please provide a valid email address.'));
  }

  if (!isValidPassword(password)) {
    return redirect('/admin/login?error=' + encodeURIComponent('Password must be at least 8 characters long.'));
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  const tierValue = formData.get('tier');
  const tier = typeof tierValue === 'string' ? tierValue : '';
  const queryString = tier ? `?tier=${tier}` : '';

  if (error) {
    return redirect('/admin/login?error=' + encodeURIComponent('Unable to create your account. Please try again.'));
  }

  if (authData.user) {
    await supabase.from('users').upsert({
      id: authData.user.id,
      email: authData.user.email,
      role: 'owner',
    });
  }

  return redirect(`/dashboard${queryString}`);
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const tier = formData?.get('tier');
  const next = typeof tier === 'string' && ['free', 'pro', 'premium'].includes(tier)
    ? `/dashboard?tier=${encodeURIComponent(tier)}`
    : '/dashboard';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    return redirect('/admin/login?error=' + encodeURIComponent('Google sign-in is unavailable right now.'));
  }

  return redirect('/admin/login?error=' + encodeURIComponent('Google sign-in could not be started.'));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/');
}

export async function resetPassword(formData: FormData) {
  const email = normalizeEmail(formData.get('email'));
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    return redirect('/admin/login?error=' + encodeURIComponent('Please provide a valid email address.'));
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/admin/update-password`,
  });

  if (error) {
    return redirect('/admin/login?error=' + encodeURIComponent('We could not send the reset link. Please try again later.'));
  }

  return redirect('/admin/login?message=' + encodeURIComponent('Password reset link sent to your email.'));
}
