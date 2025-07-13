import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where } from "firebase/firestore";
import { getFirebaseFirestore } from './firebase';
import { uploadImageToFirebaseStorage, deleteImageFromFirebaseStorage } from './storageService';

// Define the GalleryImage interface
export interface GalleryImage {
  id?: string;
  filename: string;
  downloadURL: string;
  uploadedAt: Timestamp;
  title?: string;
  description?: string;
  order?: number;
}

// Type for new gallery image data
export type NewGalleryImageData = Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'> &
                            { coverImageFile?: File | null };

// Type for updating gallery image data
export type UpdateGalleryImageData = Partial<Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt' | 'coverImagePath'> &
                                { coverImageFile?: File | null; deleteExistingCoverImage?: boolean }>;

// Custom error classes for better error handling
export class GalleryServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'GalleryServiceError';
  }
}

let dbInstance: any;
const initializeDb = async () => {
  if (!dbInstance) {
    try {
      dbInstance = await getFirebaseFirestore();
    } catch (error) {
      throw new GalleryServiceError('Failed to initialize database connection. Please try again later.');
    }
  }
  return dbInstance;
};

const getGalleryCollection = async () => {
  const db = await initializeDb();
  return collection(db, 'gallery');
};

/**
 * Creates a new gallery image in Firestore, optionally uploading a cover image.
 */
export const addGalleryImage = async (imageData: NewGalleryImageData): Promise<GalleryImage> => {
  try {
    const galleryCollectionRef = await getGalleryCollection();
    let coverImageUrl: string | undefined = undefined;
    let coverImagePath: string | undefined = undefined;

    if (imageData.coverImageFile) {
      try {
        const timestamp = Date.now();
        coverImagePath = `gallery/${timestamp}-${imageData.coverImageFile.name}`;
        coverImageUrl = await uploadImageToFirebaseStorage(imageData.coverImageFile, coverImagePath);
      } catch (error) {
        throw new GalleryServiceError('Failed to upload image. Please check your internet connection and try again.');
      }
    }

    const now = Timestamp.now();
    const { coverImageFile, ...dataToSave } = imageData;

    const newImageRef = await addDoc(galleryCollectionRef, {
      ...dataToSave,
      coverImageUrl,
      coverImagePath,
      createdAt: now,
      updatedAt: now,
      publishedAt: dataToSave.isPublished ? now : null,
    });

    return { id: newImageRef.id, ...dataToSave, coverImageUrl, coverImagePath, createdAt: now, updatedAt: now } as GalleryImage;
  } catch (error) {
    if (error instanceof GalleryServiceError) {
      throw error;
    }
    console.error("Error in addGalleryImage:", error);
    throw new GalleryServiceError('Failed to save image to gallery. Please try again.');
  }
};

/**
 * Fetches all gallery images, ordered by creation date.
 */
export const getAllGalleryImages = async (onlyPublished: boolean = false): Promise<GalleryImage[]> => {
  try {
    const galleryCollectionRef = await getGalleryCollection();
    const q = onlyPublished
      ? query(galleryCollectionRef, where("isPublished", "==", true), orderBy('publishedAt', 'desc'))
      : query(galleryCollectionRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
  } catch (error) {
    console.error("Error in getAllGalleryImages:", error);
    throw new GalleryServiceError('Failed to load gallery images. Please check your connection and try again.');
  }
};

/**
 * Fetches a single gallery image by its ID.
 */
export const getGalleryImageById = async (id: string): Promise<GalleryImage | null> => {
  try {
    if (!id || typeof id !== 'string') {
      throw new GalleryServiceError('Invalid image ID provided.');
    }

    const galleryCollectionRef = await getGalleryCollection();
    const imageDocRef = doc(galleryCollectionRef, id);
    const docSnap = await getDoc(imageDocRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as GalleryImage;
    }
    return null;
  } catch (error) {
    if (error instanceof GalleryServiceError) {
      throw error;
    }
    console.error("Error in getGalleryImageById:", error);
    throw new GalleryServiceError('Failed to load image details. Please try again.');
  }
};

/**
 * Deletes a gallery image and its associated cover image from Storage.
 */
export const deleteGalleryImage = async (id: string): Promise<void> => {
  try {
    if (!id || typeof id !== 'string') {
      throw new GalleryServiceError('Invalid image ID provided.');
    }

    const image = await getGalleryImageById(id);
    if (!image) {
      throw new GalleryServiceError('Image not found. It may have already been deleted.');
    }

    // Delete from storage first
    if (image.coverImagePath) {
      try {
        await deleteImageFromFirebaseStorage(image.coverImagePath);
      } catch (error) {
        console.warn(`Failed to delete image file ${image.coverImagePath} for gallery image ${id}:`, error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    const galleryCollectionRef = await getGalleryCollection();
    const imageDocRef = doc(galleryCollectionRef, id);
    await deleteDoc(imageDocRef);
  } catch (error) {
    if (error instanceof GalleryServiceError) {
      throw error;
    }
    console.error("Error in deleteGalleryImage:", error);
    throw new GalleryServiceError('Failed to delete image. Please try again.');
  }
};

// Legacy function names for backward compatibility
export const getGalleryImages = getAllGalleryImages;
export const getBlogPostById = getGalleryImageById; // This seems like a naming error in original code
