import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit as firestoreLimit, startAfter as firestoreStartAfter, QuerySnapshot, DocumentSnapshot, FirestoreError } from "firebase/firestore";
import { FirebaseStorage, getStorage, ref, deleteObject, StorageReference, StorageError } from "firebase/storage";
// Assuming Firebase app is initialized elsewhere
import { uploadImageToFirebaseStorage } from './storageService'; // Import the storage service
// import { app } from './firebase'; // Example import

const db = getFirestore(/* app */); // Initialize Firebase Firestore with your app

export interface Product {
  id?: string; // Firestore document ID
  name: string;
  description?: string;
  price: number;
  category: string; // Category ID or name
  imageUrl?: string; // URL of the product image in Firebase Storage
  available: boolean;
  // Add other product details as needed
}

// Define custom error classes
export class GetProductsError extends Error {
  constructor(message: string, public originalError?: any) {
    super(`Failed to get products: ${message}`);
    this.name = 'GetProductsError';
  }
}

export class AddProductError extends Error {
  constructor(message: string, public originalError?: any) {
    super(`Failed to add product: ${message}`);
    this.name = 'AddProductError';
  }
}

export class UpdateProductError extends Error {
  constructor(message: string, public originalError?: any) {
    super(`Failed to update product: ${message}`);
    this.name = 'UpdateProductError';
  }
}

export class DeleteProductError extends Error {
  constructor(message: string, public originalError?: any) {
    super(`Failed to delete product: ${message}`);
    this.name = 'DeleteProductError';
  }
}

const productsCollection = collection(db, "products");

interface PaginatedProducts {
 products: Product[];
 lastDoc: DocumentSnapshot | null;
}

export const addProduct = async (productData: Omit<Product, 'id' | 'imageUrl'>, imageFile?: File): Promise<string> => {
  try {
    let imageUrl: string | undefined = productData.imageUrl; // Allow adding with pre-existing URL if needed
    if (imageFile) {
      try {
        const storagePath = `products/${Date.now()}_${imageFile.name}`; // Unique filename
        imageUrl = await uploadImageToFirebaseStorage(imageFile, storagePath);
      } catch (storageError) {
        console.error("Error uploading product image:", storageError);
        throw new AddProductError("Failed to upload product image.", storageError);
      }
    }

    // Ensure price is a number
    const price = typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;

    const productDataWithImage = { ...productData, imageUrl };
    const docRef = await addDoc(productsCollection, productDataWithImage);
    console.log("Product added with ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding product:", e);
    if (e instanceof AddProductError) {
      throw e; // Re-throw custom errors
    }
    throw new AddProductError('An unknown error occurred while adding the product.', e);
  }
};

export const getProducts = async (limit = 10, startAfter?: DocumentSnapshot): Promise<PaginatedProducts> => {
  try {
    let productsQuery = query(productsCollection, firestoreLimit(limit));
    if (startAfter) {
 productsQuery = query(productsCollection, firestoreLimit(limit), firestoreStartAfter(startAfter));
    }

    const querySnapshot: QuerySnapshot = await getDocs(productsQuery);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    console.log("Retrieved products:", products);
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
 return { products, lastDoc };
  } catch (e) {
    console.error("Error fetching products:", e);
     if (e instanceof FirestoreError) {
       throw new GetProductsError(e.message, e);
    }
    throw new GetProductsError('An unknown error occurred while fetching products.', e);
  }
};

export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'imageUrl'>>, imageFile?: File): Promise<void> => {
  try {
    let imageUrl: string | undefined = productData.imageUrl; // Keep existing image if not replaced
    if (imageFile) {
      try {
        const storagePath = `products/${productId}_${Date.now()}_${imageFile.name}`; // Unique filename for update
        imageUrl = await uploadImageToFirebaseStorage(imageFile, storagePath);

        // Consider deleting the old image if a new one was uploaded and an old one existed
        if (productData.imageUrl) {
             try {
                const storage = getStorage();
                const oldImageRef = ref(storage, productData.imageUrl);
                await deleteObject(oldImageRef);
             } catch (deleteError: any) {
                 console.warn("Could not delete old product image:", deleteError);
                 // Continue update even if old image deletion fails
             }
        }
      } catch (storageError) {
         console.error("Error uploading new product image for update:", storageError);
         throw new UpdateProductError("Failed to upload new product image.", storageError);
      }
    }
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { ...productData, imageUrl });
    console.log("Product with ID", productId, "updated");
  } catch (e) {
    console.error("Error updating product:", e);
    throw e;
  }
   catch (e) {
    console.error("Error updating product:", e);
     if (e instanceof UpdateProductError) {
       throw e; // Re-throw custom errors
    }
    throw new UpdateProductError('An unknown error occurred while updating the product.', e);
  }
};

export const deleteProduct = async (productId: string, imageUrl?: string): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    console.log("Product with ID", productId, "deleted");
  } catch (e) {
    console.error("Error deleting product:", e);
    throw e;
  }
  // Attempt to delete the image from storage after successful database deletion
  if (imageUrl) {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (e: any) {
      console.warn("Could not delete product image from storage:", e);
    }
  }
};