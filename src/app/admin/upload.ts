'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const BUCKET = 'business-media';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadMedia(formData: FormData) {
  const file = formData.get('file') as File;
  const businessId = formData.get('businessId') as string;
  const mediaType = formData.get('mediaType') as string; // 'cover' | 'gallery'

  if (!file || !businessId) {
    return { error: 'Missing file or business ID' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large. Maximum size is 50MB.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Generate a unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const fileName = `${businessId}/${mediaType}-${timestamp}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { error: uploadError.message };
  }

  // Get the public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  // Update the business record
  if (mediaType === 'cover') {
    const { error: dbError } = await supabase
      .from('businesses')
      .update({ cover_image_url: publicUrl })
      .eq('id', businessId);

    if (dbError) return { error: dbError.message };
  } else {
    // Gallery: append to the existing array
    const { data: biz } = await supabase
      .from('businesses')
      .select('gallery')
      .eq('id', businessId)
      .single();

    const currentGallery = biz?.gallery || [];
    const { error: dbError } = await supabase
      .from('businesses')
      .update({ gallery: [...currentGallery, publicUrl] })
      .eq('id', businessId);

    if (dbError) return { error: dbError.message };
  }

  revalidatePath('/admin');
  revalidatePath(`/businesses`);
  return { success: true, url: publicUrl };
}

export async function deleteMedia(url: string, businessId: string, mediaType: 'cover' | 'gallery') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Extract the file path from the URL
  const bucketUrl = supabase.storage.from(BUCKET).getPublicUrl('').data.publicUrl;
  const filePath = url.replace(bucketUrl, '');

  if (filePath) {
    // Delete from storage (non-fatal if it fails)
    await supabase.storage.from(BUCKET).remove([filePath]);
  }

  // Update the business record
  if (mediaType === 'cover') {
    await supabase
      .from('businesses')
      .update({ cover_image_url: null })
      .eq('id', businessId);
  } else {
    const { data: biz } = await supabase
      .from('businesses')
      .select('gallery')
      .eq('id', businessId)
      .single();

    const updatedGallery = (biz?.gallery || []).filter((g: string) => g !== url);
    await supabase
      .from('businesses')
      .update({ gallery: updatedGallery })
      .eq('id', businessId);
  }

  revalidatePath('/admin');
  revalidatePath(`/businesses`);
  return { success: true };
}
