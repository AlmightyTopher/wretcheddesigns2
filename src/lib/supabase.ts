import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Type definitions for database tables
export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  cover_image_path?: string;
  author_id?: string;
  author_name?: string;
  tags?: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id?: string;
  filename: string;
  download_url: string;
  title?: string;
  description?: string;
  order?: number;
  uploaded_at: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  gradient?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlogPost, 'id' | 'created_at'>>;
      };
      gallery_images: {
        Row: GalleryImage;
        Insert: Omit<GalleryImage, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<GalleryImage, 'id' | 'uploaded_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
    };
  };
}

// Create Supabase client for client-side operations
// Note: This will work even with placeholder values, but operations will fail gracefully
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create Supabase client with service role for admin operations (server-side only)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
  );
};

// Auth helper functions
export const supabaseAuth = {
  signIn: async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Return mock response for demo mode
      return {
        data: { user: null },
        error: { message: 'Supabase not configured - demo mode only' }
      };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  getUser: async () => {
    if (!isSupabaseConfigured()) {
      return { data: { user: null }, error: null };
    }
    return await supabase.auth.getUser();
  }
};
