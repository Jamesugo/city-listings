// Build-time Supabase client — used only inside generateStaticParams.
// Uses the standard JS client (no cookies) because generateStaticParams
// runs at build time and has no HTTP request context.
import { createClient } from '@supabase/supabase-js';

export function createBuildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
