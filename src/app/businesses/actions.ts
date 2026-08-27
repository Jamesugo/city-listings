'use server';

import { createClient } from '@/lib/supabase/server';

export async function incrementPageViews(businessId: string) {
  const supabase = await createClient();
  
  // Note: For high traffic, you'd use a postgres function (RPC) to atomically increment:
  // e.g. await supabase.rpc('increment_page_views', { business_id: businessId })
  // But for now, we'll fetch and update since we're keeping the schema simple.
  
  const { data, error } = await supabase
    .from('businesses')
    .select('page_views')
    .eq('id', businessId)
    .single();

  if (error || !data) {
    console.error('Error fetching business for page_views increment:', error);
    return;
  }

  const newCount = (data.page_views || 0) + 1;

  await supabase
    .from('businesses')
    .update({ page_views: newCount })
    .eq('id', businessId);
}

export async function incrementWhatsappClicks(businessId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('businesses')
    .select('whatsapp_clicks')
    .eq('id', businessId)
    .single();

  if (error || !data) {
    console.error('Error fetching business for whatsapp_clicks increment:', error);
    return { success: false };
  }

  const newCount = (data.whatsapp_clicks || 0) + 1;

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ whatsapp_clicks: newCount })
    .eq('id', businessId);
    
  if (updateError) {
    console.error('Error updating whatsapp_clicks:', updateError);
    return { success: false };
  }

  return { success: true };
}
