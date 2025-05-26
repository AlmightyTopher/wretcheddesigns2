import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
// Assuming Firebase app is initialized elsewhere
// import { app } from './firebase'; // Example import

const db = getFirestore(/* app */); // Initialize Firebase Firestore with your app

interface Category {
  id?: string; // Firestore document ID
  name: string;
  description?: string;
  imageUrl?: string;
  // Add other category fields as needed
}

const categoriesCollection = collection(db, "categories");

export const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(categoriesCollection, categoryData);
    console.log("Category added with ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding category:", e);
    throw e;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(categoriesCollection);
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    console.log("Retrieved categories:", categories);
    return categories;
  } catch (e) {
    console.error("Error getting categories:", e);
    throw e;
  }
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<void> => {
  try {
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, categoryData);
    console.log("Category with ID", categoryId, "updated");
  } catch (e) {
    console.error("Error updating category:", e);
    throw e;
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "categories", categoryId));
    console.log("Category with ID", categoryId, "deleted");
  } catch (e) {
    console.error("Error deleting category:", e);
    throw e;
  }
};