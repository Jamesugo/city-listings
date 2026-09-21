'use server';

import { createClient } from '@/lib/supabase/server';

export async function incrementPageViews(businessId: string) {
  const supabase = await createClient();
  
  // Try atomic RPC first, fall back to manual increment
  const { error: rpcError } = await supabase.rpc('increment_page_views', { biz_id: businessId });
  
  if (rpcError) {
    // Fallback: manual fetch-and-update
    const { data } = await supabase
      .from('businesses')
      .select('page_views')
      .eq('id', businessId)
      .single();

    if (data) {
      await supabase
        .from('businesses')
        .update({ page_views: (data.page_views || 0) + 1 })
        .eq('id', businessId);
    }
  }
}

export async function incrementWhatsappClicks(businessId: string) {
  const supabase = await createClient();
  
  const { error: rpcError } = await supabase.rpc('increment_whatsapp_clicks', { biz_id: businessId });
  
  if (rpcError) {
    const { data } = await supabase
      .from('businesses')
      .select('whatsapp_clicks')
      .eq('id', businessId)
      .single();

    if (data) {
      await supabase
        .from('businesses')
        .update({ whatsapp_clicks: (data.whatsapp_clicks || 0) + 1 })
        .eq('id', businessId);
    }
  }

  return { success: true };
}

export async function incrementCallClicks(businessId: string) {
  const supabase = await createClient();
  
  const { error: rpcError } = await supabase.rpc('increment_call_clicks', { biz_id: businessId });
  
  if (rpcError) {
    const { data } = await supabase
      .from('businesses')
      .select('call_clicks')
      .eq('id', businessId)
      .single();

    if (data) {
      await supabase
        .from('businesses')
        .update({ call_clicks: (data.call_clicks || 0) + 1 })
        .eq('id', businessId);
    }
  }

  return { success: true };
}
