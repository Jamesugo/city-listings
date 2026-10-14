'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const BUCKET = 'business-media';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

function getSafeFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export async function uploadMedia(formData: FormData) {
  const file = formData.get('file') as File | null;
  const businessId = formData.get('businessId') as string | null;
  const mediaType = formData.get('mediaType') as string | null; // 'cover' | 'gallery'

  if (!file || !businessId || businessId === 'null' || businessId === 'undefined') {
    return { error: 'Please save the business profile before uploading photos.' };
  }

  if (!['cover', 'gallery'].includes(mediaType || '')) {
    return { error: 'Invalid media type.' };
  }

  const extension = getSafeFileExtension(file.name);
  const contentType = file.type || 'image/jpeg';
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large. Maximum size is 50MB.' };
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType) && !ALLOWED_EXTENSIONS.has(extension)) {
    return { error: 'Unsupported file type. Please upload JPG, PNG, or WEBP images only.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated. Please sign in.' };

  const adminEmails = [
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []),
    ...(process.env.ADMIN_EMAILS?.split(',') || []),
  ].map((e) => e.trim().toLowerCase()).filter(Boolean);

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = (user.email && adminEmails.includes(user.email.toLowerCase())) || dbUser?.role === 'admin';

  if (!isAdmin && dbUser?.business_id && dbUser.business_id !== businessId) {
    return { error: 'Unauthorized: You can only upload media for your own business.' };
  }

  // If user does not have business_id linked yet, link it
  if (!isAdmin && !dbUser?.business_id) {
    await supabase.from('users').update({ business_id: businessId }).eq('id', user.id);
  }

  // Generate a safe unique filename
  const ext = extension || 'jpg';
  const timestamp = Date.now();
  const safeBusinessId = businessId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeBusinessId}/${mediaType}-${timestamp}.${ext}`;

  let publicUrl = '';

  // 1. Attempt to upload to Supabase Storage
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
    } else {
      console.warn('Supabase storage upload bypassed:', uploadError?.message);
    }
  } catch (err) {
    console.warn('Supabase storage upload exception:', err);
  }

  // 2. Resilient Base64 Fallback (works on Vercel without storage bucket or filesystem write)
  if (!publicUrl) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = contentType || 'image/jpeg';
      publicUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    } catch (conversionErr) {
      console.error('Buffer conversion error:', conversionErr);
      return { error: 'Failed to process the uploaded image.' };
    }
  }

  // 3. Update the business record in the database
  if (mediaType === 'cover') {
    const { error: dbError } = await supabase
      .from('businesses')
      .update({ cover_image_url: publicUrl })
      .eq('id', businessId);

    if (dbError) {
      console.error('DB update error for cover image:', dbError);
      return { error: dbError.message };
    }
  } else {
    // Gallery: append to the existing array
    const { data: biz, error: fetchError } = await supabase
      .from('businesses')
      .select('gallery')
      .eq('id', businessId)
      .single();

    if (fetchError) {
      console.error('DB fetch error for gallery:', fetchError);
      return { error: fetchError.message };
    }

    const currentGallery = biz?.gallery || [];
    const { error: dbError } = await supabase
      .from('businesses')
      .update({ gallery: [...currentGallery, publicUrl] })
      .eq('id', businessId);

    if (dbError) {
      console.error('DB update error for gallery:', dbError);
      return { error: dbError.message };
    }
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/businesses');
  return { success: true, url: publicUrl };
}

export async function deleteMedia(url: string, businessId: string, mediaType: 'cover' | 'gallery') {
  if (!businessId || businessId === 'null' || businessId === 'undefined') {
    return { error: 'Invalid business ID.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const adminEmails = [
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []),
    ...(process.env.ADMIN_EMAILS?.split(',') || []),
  ].map((e) => e.trim().toLowerCase()).filter(Boolean);

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = (user.email && adminEmails.includes(user.email.toLowerCase())) || dbUser?.role === 'admin';

  if (!isAdmin && dbUser?.business_id !== businessId) {
    return { error: 'Unauthorized: You can only delete media from your own business.' };
  }

  // Handle Supabase cloud storage removal (if not a data URL)
  if (!url.startsWith('data:')) {
    try {
      const bucketUrl = supabase.storage.from(BUCKET).getPublicUrl('').data.publicUrl;
      const filePath = url.replace(bucketUrl, '').replace(/^\/+/, '');
      if (filePath) {
        await supabase.storage.from(BUCKET).remove([filePath]);
      }
    } catch (storageErr) {
      console.warn('Storage delete warning:', storageErr);
    }
  }

  // Update database record
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
  revalidatePath('/dashboard');
  revalidatePath('/businesses');
  return { success: true };
}
