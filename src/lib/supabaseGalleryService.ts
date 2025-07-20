import { supabase, GalleryImage } from './supabase';

// Type for new gallery image data
export type NewGalleryImageData = Omit<GalleryImage, 'id' | 'uploaded_at'>;

// Custom error classes for better error handling
export class GalleryServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'GalleryServiceError';
  }
}

// Check if Supabase is configured - client-side safe version
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[Gallery Service] Checking Supabase config:', {
    hasUrl: !!url,
    hasKey: !!key,
    url: url?.substring(0, 20) + '...',
    urlIsPlaceholder: url === 'https://placeholder.supabase.co',
    keyIsPlaceholder: key === 'placeholder-key'
  });

  const isConfigured = !!(
    url &&
    key &&
    url !== 'https://placeholder.supabase.co' &&
    key !== 'placeholder-key'
  );

  console.log('[Gallery Service] Supabase configured:', isConfigured);
  return isConfigured;
};

// Demo gallery data for when Supabase isn't configured
const getDemoGalleryImages = (): GalleryImage[] => {
  console.log('[Gallery Service] Generating demo gallery images');

  const artImages = [
    "0e24c8e1-ad42-4b6c-b538-672c737cec86.jpg",
    "212c84dc-0494-4fb2-950d-1a450d86abf6.jpg",
    "36f583e6-dae6-4858-a57e-b25c34e3b0da.jpg",
    "478cb881-8222-440c-9f67-e3e39fb24e5d.jpg",
    "4fb77fbe-3d28-40ce-9243-a683afc07b50.jpg",
    "51eb4dbf-9652-4c3b-8c35-0934874ec938.jpg",
    "56961627-4033-4cb0-a2ac-e6bd5315788d.jpg",
    "6d986137-e20f-4f93-b67b-a8daa5870786.jpg",
    "87d3c5db-9cb0-4b1e-b039-af2a2bec69b1.jpg",
    "97cf6413-a320-4ba1-9d79-657133be2631.jpg",
    "c8805ead-8f45-4031-bdc8-ada903582fba.jpg",
    "ca028ff7-530d-4d1f-9599-a5121425a313.jpg",
    "f121373f-f6f9-4c19-a8c2-a774c43fbb71.jpg",
    "f1e6e2ad-a738-4382-ab87-18e819284d2c.jpg"
  ];

  const demoImages = artImages.map((filename, index) => ({
    id: `demo-${index + 1}`,
    filename,
    download_url: `/Images/Art/${filename}`,
    title: `Artwork ${index + 1}`,
    description: "Custom digital artwork - Part of the Wretched Designs collection",
    uploaded_at: new Date(Date.now() - (index * 86400000)).toISOString(), // Spread over last 14 days
    order: index
  }));

  console.log('[Gallery Service] Generated', demoImages.length, 'demo images');
  return demoImages;
};

/**
 * Creates a new gallery image in Supabase
 */
export const addGalleryImage = async (imageData: NewGalleryImageData): Promise<GalleryImage> => {
  if (!isSupabaseConfigured()) {
    throw new GalleryServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert(imageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in addGalleryImage:", error);
    throw new GalleryServiceError('Failed to save image to gallery. Please try again.');
  }
};

/**
 * Fetches all gallery images, ordered by upload date
 */
export const getAllGalleryImages = async (): Promise<GalleryImage[]> => {
  console.log('[Gallery Service] getAllGalleryImages called');

  if (!isSupabaseConfigured()) {
    console.log('[Gallery Service] Supabase not configured, returning demo gallery images');
    return getDemoGalleryImages();
  }

  try {
    console.log('[Gallery Service] Attempting to fetch from Supabase...');
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    console.log('[Gallery Service] Fetched', data?.length || 0, 'images from Supabase');
    return data || [];
  } catch (error) {
    console.error("[Gallery Service] Error in getAllGalleryImages:", error);
    console.warn('[Gallery Service] Falling back to demo gallery due to database error');
    return getDemoGalleryImages();
  }
};

/**
 * Fetches a single gallery image by its ID
 */
export const getGalleryImageById = async (id: string): Promise<GalleryImage | null> => {
  if (!isSupabaseConfigured()) {
    const demoImages = getDemoGalleryImages();
    return demoImages.find(img => img.id === id) || null;
  }

  try {
    if (!id || typeof id !== 'string') {
      throw new GalleryServiceError('Invalid image ID provided.');
    }

    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    if (error instanceof GalleryServiceError) throw error;
    console.error("Error in getGalleryImageById:", error);
    throw new GalleryServiceError('Failed to load image details. Please try again.');
  }
};

/**
 * Updates an existing gallery image
 */
export const updateGalleryImage = async (id: string, updateData: Partial<Omit<GalleryImage, 'id' | 'uploaded_at'>>): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new GalleryServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    if (!id || typeof id !== 'string') {
      throw new GalleryServiceError('Invalid image ID provided.');
    }

    const { error } = await supabase
      .from('gallery_images')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    if (error instanceof GalleryServiceError) throw error;
    console.error("Error in updateGalleryImage:", error);
    throw new GalleryServiceError('Failed to update image. Please try again.');
  }
};

/**
 * Deletes a gallery image from database with transaction safety
 */
export const deleteGalleryImage = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new GalleryServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    if (!id || typeof id !== 'string') {
      throw new GalleryServiceError('Invalid image ID provided.');
    }

    // Use transaction to ensure atomicity
    const { data, error } = await supabase.rpc('delete_gallery_image_safe', {
      image_id: id
    });

    if (error) {
      // Fallback to non-transactional delete if RPC doesn't exist
      const image = await getGalleryImageById(id);
      if (!image) {
        throw new GalleryServiceError('Image not found. It may have already been deleted.');
      }

      const { error: deleteError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    }
  } catch (error) {
    if (error instanceof GalleryServiceError) throw error;
    console.error("Error in deleteGalleryImage:", error);
    throw new GalleryServiceError('Failed to delete image. Please try again.');
  }
};

/**
 * Creates a new gallery image with transaction safety
 */
export const createGalleryImage = async (imageData: NewGalleryImageData): Promise<GalleryImage> => {
  if (!isSupabaseConfigured()) {
    throw new GalleryServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    // Validate required fields
    if (!imageData.title || !imageData.image_url) {
      throw new GalleryServiceError('Title and image URL are required.');
    }

    const { data, error } = await supabase
      .from('gallery')
      .insert([imageData])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new GalleryServiceError('Failed to create image record.');

    return data;
  } catch (error) {
    if (error instanceof GalleryServiceError) throw error;
    console.error("Error in createGalleryImage:", error);
    throw new GalleryServiceError('Failed to create image. Please try again.');
  }
};

// Legacy function names for backward compatibility
export const getGalleryImages = getAllGalleryImages;
