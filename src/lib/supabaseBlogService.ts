import { supabase, supabaseAdmin, BlogPost } from './supabase';

// Type for new blog post data
export type NewBlogPostData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & {
  coverImageFile?: File | null;
};

// Type for updating blog post data
export type UpdateBlogPostData = Partial<Omit<BlogPost, 'id' | 'created_at'>> & {
  coverImageFile?: File | null;
  deleteExistingCoverImage?: boolean;
};

// Custom error classes for better error handling
export class BlogServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BlogServiceError';
  }
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

/**
 * Creates a new blog post in Supabase
 */
export const addBlogPost = async (postData: NewBlogPostData): Promise<BlogPost> => {
  if (!isSupabaseConfigured()) {
    throw new BlogServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    let cover_image_url: string | undefined = undefined;
    let cover_image_path: string | undefined = undefined;

    // Handle cover image upload if provided
    if (postData.coverImageFile) {
      const timestamp = Date.now();
      const filename = `${timestamp}-${postData.coverImageFile.name}`;
      cover_image_path = `blogs/${filename}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(cover_image_path, postData.coverImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(cover_image_path);

      cover_image_url = publicUrl;
    }

    const { coverImageFile, ...dataToSave } = postData;

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...dataToSave,
        cover_image_url,
        cover_image_path,
        published_at: dataToSave.is_published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in addBlogPost:", error);
    throw new BlogServiceError('Failed to save blog post. Please try again.');
  }
};

/**
 * Fetches all blog posts, ordered by creation date
 */
export const getAllBlogPosts = async (onlyPublished: boolean = false): Promise<BlogPost[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty blog posts');
    return [];
  }

  try {
    let query = supabase.from('blog_posts').select('*');

    if (onlyPublished) {
      query = query.eq('is_published', true).order('published_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error in getAllBlogPosts:", error);
    console.warn('Falling back to empty blog posts due to database error');
    return [];
  }
};

/**
 * Fetches a single blog post by its ID
 */
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  if (!isSupabaseConfigured()) {
    throw new BlogServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    if (!id || typeof id !== 'string') {
      throw new BlogServiceError('Invalid blog post ID provided.');
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data || null;
  } catch (error) {
    if (error instanceof BlogServiceError) throw error;
    console.error("Error in getBlogPostById:", error);
    throw new BlogServiceError('Failed to load blog post details. Please try again.');
  }
};

/**
 * Fetches a single blog post by its slug
 */
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning null for blog post');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error("Error in getBlogPostBySlug:", error);
    console.warn('Falling back to null due to database error');
    return null;
  }
};

/**
 * Updates an existing blog post
 */
export const updateBlogPost = async (id: string, updateData: UpdateBlogPostData): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new BlogServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    if (!id || typeof id !== 'string') {
      throw new BlogServiceError('Invalid blog post ID provided.');
    }

    const { coverImageFile, deleteExistingCoverImage, ...dataToUpdate } = updateData;

    // Handle cover image update
    if (coverImageFile) {
      // Delete existing image if it exists
      const existingPost = await getBlogPostById(id);
      if (existingPost?.cover_image_path) {
        await supabase.storage
          .from('images')
          .remove([existingPost.cover_image_path]);
      }

      // Upload new image
      const timestamp = Date.now();
      const filename = `${timestamp}-${coverImageFile.name}`;
      const newCoverImagePath = `blogs/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(newCoverImagePath, coverImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(newCoverImagePath);

      (dataToUpdate as any).cover_image_url = publicUrl;
      (dataToUpdate as any).cover_image_path = newCoverImagePath;
    } else if (deleteExistingCoverImage) {
      const existingPost = await getBlogPostById(id);
      if (existingPost?.cover_image_path) {
        await supabase.storage
          .from('images')
          .remove([existingPost.cover_image_path]);
        (dataToUpdate as any).cover_image_url = null;
        (dataToUpdate as any).cover_image_path = null;
      }
    }

    (dataToUpdate as any).updated_at = new Date().toISOString();

    if (dataToUpdate.is_published) {
      const existingPost = await getBlogPostById(id);
      if (!existingPost?.published_at) {
        (dataToUpdate as any).published_at = new Date().toISOString();
      }
    } else if (dataToUpdate.is_published === false) {
      (dataToUpdate as any).published_at = null;
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(dataToUpdate)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    if (error instanceof BlogServiceError) throw error;
    console.error("Error in updateBlogPost:", error);
    throw new BlogServiceError('Failed to update blog post. Please try again.');
  }
};

/**
 * Deletes a blog post and its associated cover image
 */
export const deleteBlogPost = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new BlogServiceError('Supabase is not configured. Please set up your Supabase project first.');
  }

  try {
    if (!id || typeof id !== 'string') {
      throw new BlogServiceError('Invalid blog post ID provided.');
    }

    const post = await getBlogPostById(id);
    if (!post) {
      throw new BlogServiceError('Blog post not found. It may have already been deleted.');
    }

    // Delete cover image if it exists
    if (post.cover_image_path) {
      await supabase.storage
        .from('images')
        .remove([post.cover_image_path]);
    }

    // Delete blog post from database
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    if (error instanceof BlogServiceError) throw error;
    console.error("Error in deleteBlogPost:", error);
    throw new BlogServiceError('Failed to delete blog post. Please try again.');
  }
};
