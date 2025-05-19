import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const galleryDirectory = path.join(process.cwd(), 'public', 'Images', 'Art');

  try {
    const filenames = await fs.promises.readdir(galleryDirectory);
    // Optional: Filter to include only image file extensions if necessary
    const imageFilenames = filenames.filter(filename => {
      const lowerFilename = filename.toLowerCase();
      return lowerFilename.endsWith('.jpg') || lowerFilename.endsWith('.jpeg') || lowerFilename.endsWith('.png') || lowerFilename.endsWith('.gif');
    });
    return NextResponse.json(imageFilenames.map(filename => ({ filename }))); // Return as array of objects with filename property
  } catch (error) {
    console.error("Error reading gallery directory:", error);
    return NextResponse.json({ error: 'Failed to load gallery images' }, { status: 500 });
  }
}