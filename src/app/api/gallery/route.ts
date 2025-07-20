import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/lib/supabase';
import { validateFile, sanitizeFilename, generateSecureFilename, FileValidationError } from '@/lib/fileValidation';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { withRateLimit, apiRateLimit, uploadRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(req, apiRateLimit);
  if (rateLimitResult) return rateLimitResult;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  if (!session.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: 'Failed to load gallery images' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json({ error: 'Failed to load gallery images' }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  // Apply stricter rate limiting for uploads
  const rateLimitResult = await withRateLimit(req, uploadRateLimit);
  if (rateLimitResult) return rateLimitResult;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  if (!session.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate file
    try {
      await validateFile(file, {
        maxWidth: 4096,
        maxHeight: 4096,
        skipDimensionCheck: true // Skip in API context
      });
    } catch (error) {
      if (error instanceof FileValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name);
    const filePath = `gallery-images/${secureFilename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);

    // Save metadata to database with transaction
    const { data: galleryData, error: dbError } = await supabase
      .from('gallery')
      .insert([{
        title,
        description: description || null,
        image_url: urlData.publicUrl,
        alt_text: title,
        is_featured: false,
        display_order: 0
      }])
      .select()
      .single();

    if (dbError) {
      // Cleanup uploaded file on database error
      await supabase.storage
        .from('gallery-images')
        .remove([filePath]);

      console.error("Database error:", dbError);
      return NextResponse.json({ error: 'Failed to save image metadata' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Image added successfully',
      id: galleryData.id,
      imageUrl: urlData.publicUrl
    });
  } catch (error) {
    console.error("Error in POST /api/gallery:", error);
    return NextResponse.json({ error: 'Failed to add gallery image' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(req, apiRateLimit);
  if (rateLimitResult) return rateLimitResult;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  if (!session.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing gallery item ID' }, { status: 400 });
    }

    // Get image details first for cleanup
    const { data: imageData, error: fetchError } = await supabase
      .from('gallery')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }
      throw fetchError;
    }

    // Use the safe deletion function
    const { error: deleteError } = await supabase.rpc('delete_gallery_image_safe', {
      image_id: id
    });

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }

    // Extract storage path from URL and delete from storage
    if (imageData.image_url) {
      try {
        const url = new URL(imageData.image_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-1)[0]; // Get filename

        await supabase.storage
          .from('gallery-images')
          .remove([`gallery-images/${filePath}`]);
      } catch (storageError) {
        console.warn("Failed to delete from storage:", storageError);
        // Continue - database deletion succeeded
      }
    }

    return NextResponse.json({ message: 'Image removed successfully' });
  } catch (error) {
    console.error("Error in DELETE /api/gallery:", error);
    return NextResponse.json({ error: 'Failed to remove gallery image' }, { status: 500 });
  }
}
