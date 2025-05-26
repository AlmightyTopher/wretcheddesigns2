import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { uploadImageToFirebaseStorage } from './storageService'; // Import the storage service
// Assuming Firebase app is initialized elsewhere
// import { app } from './firebase'; // Example import

const db = getFirestore(/* app */); // Initialize Firebase Firestore with your app

interface BlogPost {
  id?: string; // Firestore document ID
  title: string;
  content: string;
  imageUrl?: string; // Optional image URL
  slug: string; // Unique identifier for the blog post URL
  date: string; // Date of the blog post
  // Add other blog post fields as needed
}

const blogPostsCollection = collection(db, "blogs");

export const addBlogPost = async (blogPostData: Omit<BlogPost, 'id'>, imageFile?: File): Promise<string> => {
  try {
    let imageUrl: string | undefined;
    if (imageFile) {
      // Upload image to Firebase Storage
      const storagePath = `blogs/${imageFile.name}`; // Define storage path
      imageUrl = await uploadImageToFirebaseStorage(imageFile, storagePath);
    }

    const docRef = await addDoc(blogPostsCollection, { ...blogPostData, imageUrl });
    console.log("Blog post added with ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding blog post:", e);
    throw e;
  }
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const querySnapshot = await getDocs(blogPostsCollection);
    const blogPosts: BlogPost[] = [];
    querySnapshot.forEach((doc) => {
      blogPosts.push({ id: doc.id, ...doc.data() } as BlogPost);
    });
    console.log("Retrieved blog posts:", blogPosts);
    return blogPosts;
  } catch (e) {
    console.error("Error getting blog posts:", e);
    throw e;
  }
};

export const updateBlogPost = async (blogPostId: string, blogPostData: Partial<Omit<BlogPost, 'id'>>, imageFile?: File): Promise<void> => {
  try {
    let imageUrl: string | undefined;
    if (imageFile) {
      // Upload image to Firebase Storage
      const storagePath = `blogs/${blogPostId}/${imageFile.name}`; // Define storage path (consider unique naming)
      imageUrl = await uploadImageToFirebaseStorage(imageFile, storagePath);
    }

    const blogPostRef = doc(db, "blogs", blogPostId);
    await updateDoc(blogPostRef, { ...blogPostData, ...(imageUrl && { imageUrl }) });
    console.log("Blog post with ID", blogPostId, "updated");
  } catch (e) {
    console.error("Error updating blog post:", e);
    throw e;
  }
};

export const deleteBlogPost = async (blogPostId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "blogs", blogPostId));
    console.log("Blog post with ID", blogPostId, "deleted");
  } catch (e) {
    console.error("Error deleting blog post:", e);
    throw e;
  }
};