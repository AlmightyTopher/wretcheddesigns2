import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Uploads an image file to Supabase Storage
 * @param file The image file to upload
 * @param filePath The path in Supabase Storage to upload the file to (e.g., 'gallery/image.jpg')
 * @returns A promise that resolves with the public URL of the uploaded image
 */
export const uploadImageToSupabaseStorage = async (file: File, filePath: string): Promise<string> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        upsert: false, // Don't overwrite existing files
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error("Error uploading image to Supabase Storage:", error);
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Deletes an image file from Supabase Storage
 * @param filePath The path in Supabase Storage of the file to delete (e.g., 'gallery/image.jpg')
 * @returns A promise that resolves when the image is deleted
 */
export const deleteImageFromSupabaseStorage = async (filePath: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting image from Supabase Storage:", error);
    // Don't throw an error if the file doesn't exist, as it might have been deleted already
    if (error?.message?.includes('not found')) {
      console.warn(`File ${filePath} not found, assuming already deleted`);
      return;
    }
    throw new Error(`Failed to delete image: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Gets the public URL for a file in Supabase Storage
 * @param filePath The path in Supabase Storage
 * @returns The public URL of the file
 */
export const getPublicUrl = (filePath: string): string => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning placeholder URL');
    return '/placeholder-image.jpg';
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Lists all files in a specific folder
 * @param folderPath The folder path to list files from (e.g., 'gallery')
 * @returns A promise that resolves with an array of file objects
 */
export const listFiles = async (folderPath: string = '') => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list(folderPath, {
        limit: 100,
        offset: 0,
      });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error listing files from Supabase Storage:", error);
    throw new Error(`Failed to list files: ${error.message || 'Unknown error'}`);
  }
};

// Legacy function names for backward compatibility
export const uploadImageToFirebaseStorage = uploadImageToSupabaseStorage;
export const deleteImageFromFirebaseStorage = deleteImageFromSupabaseStorage;
