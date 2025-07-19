import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app as firebaseApp, getFirebaseStorage } from './firebase'; // Correctly import app as firebaseApp and getFirebaseStorage

// Asynchronously get the storage instance
let storageInstance: any; // Consider using a more specific type if possible
const initializeStorage = async () => {
  if (!storageInstance) {
    storageInstance = await getFirebaseStorage();
  }
  return storageInstance;
};

/**
 * Uploads an image file to Firebase Storage.
 * @param file The image file to upload.
 * @param filePath The path in Firebase Storage to upload the file to (e.g., 'gallery/image.jpg').
 * @returns A promise that resolves with the download URL of the uploaded image.
 */
export const uploadImageToFirebaseStorage = async (file: File, filePath: string): Promise<string> => {
  try {
    const storage = await initializeStorage();
    const storageRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading image to Firebase Storage:", error);
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Deletes an image file from Firebase Storage.
 * @param filePath The path in Firebase Storage of the file to delete (e.g., 'gallery/image.jpg').
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteImageFromFirebaseStorage = async (filePath: string): Promise<void> => {
  try {
    const storage = await initializeStorage();
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error("Error deleting image from Firebase Storage:", error);
    // It's common to not throw an error if the file doesn't exist, or to handle specific error codes.
    // For now, we re-throw to indicate failure.
    throw new Error(`Failed to delete image: ${error.message || 'Unknown error'}`);
  }
};
