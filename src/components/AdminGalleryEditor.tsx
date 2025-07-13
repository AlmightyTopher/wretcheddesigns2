import React, { useState, useEffect } from 'react';
import { getAllGalleryImages, addGalleryImage, deleteGalleryImage, GalleryImage, NewGalleryImageData } from '../lib/supabaseGalleryService';
import { uploadImageToSupabaseStorage, deleteImageFromSupabaseStorage } from '../lib/supabaseStorageService';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const AdminGalleryEditor: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageTitle, setImageTitle] = useState<string>("");
  const [imageDescription, setImageDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (status === 'loading') return;
    if (isAdmin) {
      fetchGalleryImages();
    } else {
      setLoading(false);
      if (status === 'authenticated') {
        setError("You do not have administrator access to this feature.");
      }
    }
  }, [isAdmin, status]);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const images = await getAllGalleryImages();
      setGalleryImages(images);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching gallery images:', err);
      setError(err.message || 'Failed to load gallery images.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!isAdmin) {
      setError('You are not authorized to perform this action.');
      return;
    }
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uniqueFilename = `${Date.now()}-${selectedFile.name}`;
      const storagePath = `gallery/${uniqueFilename}`;
      const downloadURL = await uploadImageToSupabaseStorage(selectedFile, storagePath);

      const newImageData: NewGalleryImageData = {
        filename: uniqueFilename,
        download_url: downloadURL,
        title: imageTitle || selectedFile.name,
        description: imageDescription || "",
      };
      await addGalleryImage(newImageData);

      await fetchGalleryImages();
      setSelectedFile(null);
      setImageTitle("");
      setImageDescription("");
      const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      console.log('Image uploaded and metadata added successfully.');
    } catch (err: any) {
      console.error('Error uploading image or adding metadata:', err);
      setError(err.message || 'Failed to upload image or save metadata.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string, filename: string) => {
    if (!isAdmin) {
      setError('You are not authorized to perform this action.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${filename}? This action cannot be undone.`)) {
      setError(null);
      try {
        await deleteGalleryImage(imageId);
        const storagePath = `gallery/${filename}`;
        await deleteImageFromSupabaseStorage(storagePath);

        console.log(`Image file ${filename} deleted from storage and database.`);
        setGalleryImages(currentImages => currentImages.filter(img => img.id !== imageId));
      } catch (err: any) {
        console.error('Error deleting gallery image:', err);
        setError(err.message || `Failed to delete image ${filename}.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <span className="inline-block animate-spin mr-2">&#9696;</span>
        Loading gallery editor...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || "You do not have permission to access this page."}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-700">Admin Gallery Editor</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}
      <div className="mb-4 p-4 border rounded shadow-sm bg-gray-50">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Upload New Image</h3>
        <div className="space-y-3">
          <input
            id="gallery-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            placeholder="Image Title (optional)"
            value={imageTitle}
            onChange={(e) => setImageTitle(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          />
          <textarea
            placeholder="Image Description (optional)"
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          />
        </div>
        {selectedFile && (
          <div className="mt-3">
            <p className="text-sm text-gray-700">Selected file: {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2) } KB)</p>
            <div className="relative mt-2 max-h-40 w-fit">
              <Image
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                width={200}
                height={160}
                className="rounded border object-contain max-h-40"
                unoptimized={true}
              />
            </div>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`mt-4 w-full sm:w-auto px-6 py-2.5 rounded-md text-white font-semibold transition-all duration-150 ease-in-out ${selectedFile && !uploading ? 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : 'Upload Image'}
        </button>
      </div>

      <div className="p-4 border rounded shadow-sm bg-gray-50 mt-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Existing Gallery Images</h3>
        <ul className="space-y-4">
          {galleryImages.map((image) => (
            <li key={image.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative w-10 h-10">
                  <Image
                    src={image.download_url}
                    alt={image.filename}
                    fill
                    className="rounded object-cover"
                    unoptimized={true}
                  />
                </div>
                <div className="ml-2">
                  <p className="text-sm text-gray-700">{image.filename}</p>
                  {image.title && <p className="text-xs text-gray-500">{image.title}</p>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(image.id!, image.filename)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminGalleryEditor;
