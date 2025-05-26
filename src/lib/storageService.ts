import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from './firebase'; // Assuming firebaseApp is exported from your firebase.ts

const storage = getStorage(firebaseApp);

/**
 * Uploads an image file to Firebase Storage.
 * @param file The image file to upload.
 * @param filePath The path in Firebase Storage to upload the file to (e.g., 'gallery/image.jpg').
 * @returns A promise that resolves with the download URL of the uploaded image.
 */
export const uploadImageToFirebaseStorage = async (file: File, filePath: string): Promise<string> => {
  const storageRef = ref(storage, filePath);
  const uploadResult = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(uploadResult.ref);
  return downloadURL;
};