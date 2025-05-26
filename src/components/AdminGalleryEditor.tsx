import React, { useState, useEffect } from 'react';
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '../lib/galleryService'; // Assuming you have galleryService
import { uploadImageToFirebaseStorage } from '../lib/storageService'; // Assuming you have storageService
import { useSession } from 'next-auth/react';
import { deleteObject, ref, getStorage } from 'firebase/storage'; // Import necessary Firebase Storage functions

interface GalleryImage {
  id?: string;
  filename: string;
  downloadURL: string;
  // Add other metadata as needed
}

const AdminGalleryEditor: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const storage = getStorage(); // Initialize Firebase Storage

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while session is loading

    if (isAdmin) {
      fetchGalleryImages();
    } else {
      setLoading(false);
    }
  }, [isAdmin, status]);
 
  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      // Ensure getGalleryImages is implemented to fetch from your database
      const images = await getGalleryImages();
      setGalleryImages(images);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      setError('Failed to load gallery images.');
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null); // Clear previous error messages
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!isAdmin) {
      setError('You are not authorized to perform this action.');
    }

    if (!selectedFile) { // Check if file is selected
      setError('Please select a file to upload.');
      return;
    }

    // Basic client-side file type validation
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setUploading(true); // Set uploading state to true
    setError(null);

    try {
      // Upload image to Firebase Storage
      const storagePath = `gallery/${selectedFile.name}`; // Using original filename for simplicity, consider a unique ID
      const downloadURL = await uploadImageToFirebaseStorage(selectedFile, storagePath);

      // Add image metadata to Firestore
      const newImage: Omit<GalleryImage, 'id'> = {
        filename: selectedFile.name,
        downloadURL: downloadURL,
        // TODO: Add more comprehensive validation and sanitization for other potential input fields here
        // Ensure metadata fields match your Firestore document structure
        uploadedAt: new Date(),
        // Add other metadata here
      };
      await addGalleryImage(newImage);

      // Refresh the gallery image list
      await fetchGalleryImages();

      // Clear selected file
      setSelectedFile(null);
      setUploading(false);
      console.log('Image uploaded and metadata added successfully.');

    } catch (err: any) { // Catch and display specific upload errors
      console.error('Error uploading image or adding metadata:', err);
      setError('Failed to upload image or save metadata.');
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string, filename: string) => {
    if (!isAdmin) {
      setError('You are not authorized to perform this action.');
    } else if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      setError(null); // Clear previous error messages
      try {
        // Delete metadata from Firestore
        await deleteGalleryImage(imageId);

        // Delete the image from Firebase Storage
        // Construct the storage path - assuming filename is used for the storage path
        const storagePath = `gallery/${filename}`; 
        const imageRef = ref(storage, storagePath);
        
        // Use deleteObject from firebase/storage
        await deleteObject(imageRef);
        
        console.log(`Image file ${filename} deleted from storage.`);

        // Refresh the gallery image list
        setGalleryImages(galleryImages.filter(img => img.id !== imageId));
        setError(null); // Clear error on successful deletion
        console.log(`Image ${filename} deleted successfully.`);

      } catch (err) {
        console.error('Error deleting gallery image:', err);
        setError(`Failed to delete image ${filename}.`);
      }
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!isAdmin) return <div className="text-red-500">You do not have administrator access to this feature.</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Gallery Editor</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4 p-4 border rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Upload New Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-700">Selected file: {selectedFile.name}</p>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`mt-4 px-4 py-2 rounded text-white ${selectedFile && !uploading ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>

      <div className="p-4 border rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Existing Gallery Images</h3>
        {loading ? (
          <p>Loading images...</p>
        ) : galleryImages.length === 0 ? (
          <p>No gallery images found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="border rounded p-2 flex flex-col items-center">
                <img
                  src={image.downloadURL}
                  alt={image.filename}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-sm text-center mb-2 truncate w-full">{image.filename}</p>
                <button
                  onClick={() => image.id && handleDelete(image.id, image.filename)}
                  className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGalleryEditor;