import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
// Assuming Firebase app and Firestore are initialized elsewhere
import { db } from './firebase'; // Example import

export interface GalleryImage {
}

// Define custom error classes
class GetGalleryImagesError extends Error {
  constructor(message: string) {
    super(`Failed to get gallery images: ${message}`);
    this.name = 'GetGalleryImagesError';
  }
}

class AddGalleryImageError extends Error {
  constructor(message: string) {
  id?: string; // Optional ID for document reference
  filename: string;
  downloadURL: string;
  uploadedAt: Date;
  // Add other metadata fields as needed, e.g.,
  // title?: string;
  // description?: string;
  // order?: number;
}

const galleryCollection = collection(db, 'gallery');

export const addGalleryImage = async (imageData: Omit<GalleryImage, 'id' | 'uploadedAt'>): Promise<GalleryImage> => {
  const newImageRef = await addDoc(galleryCollection, {
    ...imageData,
    uploadedAt: new Date(),
  });
  const newImageDoc = await getDocs(query(galleryCollection, orderBy('uploadedAt', 'desc'))); // Simple way to get the added doc, might need refinement for large collections
  const addedImage = newImageDoc.docs.find(doc => doc.id === newImageRef.id);

  if (!addedImage) {
    throw new Error("Failed to retrieve added document");
  }

  return { id: addedImage.id, ...addedImage.data() } as GalleryImage;
};

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  const gallerySnapshot = await getDocs(query(galleryCollection, orderBy('uploadedAt', 'desc'))); // Order by upload date descending
  return gallerySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as GalleryImage));
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
  const imageDoc = doc(galleryCollection, id);
  await deleteDoc(imageDoc);
};