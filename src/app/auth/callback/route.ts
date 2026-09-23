import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next') ?? '/dashboard'
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard'
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, '')

  // Handle OAuth error params (e.g. from Supabase or Google)
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  if (errorParam) {
    const msg = errorDescription || errorParam || 'OAuth sign-in failed'
    return NextResponse.redirect(`${siteUrl}/admin/login?error=${encodeURIComponent(msg)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && sessionData.user) {
      const user = sessionData.user
      // Ensure the user exists in the public.users table (for OAuth sign-ups)
      const { error: profileError } = await supabase.from('users').upsert(
        {
          id: user.id,
          email: user.email,
          role: 'owner',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      if (profileError) {
        console.error('Failed to provision OAuth user profile:', profileError)
        return NextResponse.redirect(
          `${siteUrl}/admin/login?error=${encodeURIComponent('Your account was authenticated, but your user profile could not be created.')}`
        )
      }

      return NextResponse.redirect(`${siteUrl}${next}`)
    }

    // Code exchange failed
    const msg = error?.message || 'Unable to sign in. Please try again.'
    return NextResponse.redirect(`${siteUrl}/admin/login?error=${encodeURIComponent(msg)}`)
  }

  // No code and no error — invalid request
  return NextResponse.redirect(`${siteUrl}/admin/login?error=Invalid%20or%20expired%20auth%20link`)
}

