import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where } from "firebase/firestore";
import { getFirebaseFirestore } from './firebase';
import { uploadImageToFirebaseStorage, deleteImageFromFirebaseStorage } from './storageService'; // For cover images

// Define the BlogPost interface
export interface BlogPost {
  id?: string;
  slug: string; // URL-friendly identifier
  title: string;
  content: string; // HTML or Markdown content
  excerpt?: string; // Short summary
  coverImageUrl?: string;
  coverImagePath?: string; // To store the path in Firebase Storage for deletion
  authorId?: string; // Reference to a user ID if you have authors
  authorName?: string; // Denormalized author name
  tags?: string[];
  isPublished: boolean;
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Type for new blog post data (ID and timestamps are auto-generated/set)
export type NewBlogPostData = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'> &
                            { coverImageFile?: File | null }; // Include optional file for upload

// Type for updating blog post data
export type UpdateBlogPostData = Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'coverImagePath'> &
                                { coverImageFile?: File | null; deleteExistingCoverImage?: boolean }>;


let dbInstance: any; // Firestore instance
const initializeDb = async () => {
  if (!dbInstance) dbInstance = await getFirebaseFirestore();
  return dbInstance;
};

const getBlogCollection = async () => {
  const db = await initializeDb();
  return collection(db, 'blogs');
};

// --- CRUD Functions for Blog Posts ---

/**
 * Creates a new blog post in Firestore, optionally uploading a cover image.
 */
export const addBlogPost = async (postData: NewBlogPostData): Promise<BlogPost> => {
  const blogCollectionRef = await getBlogCollection();
  let coverImageUrl: string | undefined = undefined;
  let coverImagePath: string | undefined = undefined;

  if (postData.coverImageFile) {
    const timestamp = Date.now();
    coverImagePath = `blogs/${timestamp}-${postData.coverImageFile.name}`;
    coverImageUrl = await uploadImageToFirebaseStorage(postData.coverImageFile, coverImagePath);
  }

  const now = Timestamp.now();
  const { coverImageFile, ...dataToSave } = postData; // Exclude file from Firestore data

  const newPostRef = await addDoc(blogCollectionRef, {
    ...dataToSave,
    coverImageUrl,
    coverImagePath,
    createdAt: now,
    updatedAt: now,
    publishedAt: dataToSave.isPublished ? now : null,
  });

  return { id: newPostRef.id, ...dataToSave, coverImageUrl, coverImagePath, createdAt: now, updatedAt: now } as BlogPost;
};

/**
 * Fetches all blog posts, ordered by creation date.
 */
export const getAllBlogPosts = async (onlyPublished: boolean = false): Promise<BlogPost[]> => {
  const blogCollectionRef = await getBlogCollection();
  const q = onlyPublished
    ? query(blogCollectionRef, where("isPublished", "==", true), orderBy('publishedAt', 'desc'))
    : query(blogCollectionRef, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
};

/**
 * Fetches a single blog post by its ID.
 */
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const blogCollectionRef = await getBlogCollection();
  const postDocRef = doc(blogCollectionRef, id);
  const docSnap = await getDoc(postDocRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as BlogPost;
  }
  return null;
};

/**
 * Fetches a single blog post by its slug.
 */
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const blogCollectionRef = await getBlogCollection();
  const q = query(blogCollectionRef, where("slug", "==", slug), where("isPublished", "==", true));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0]; // Should be unique if slugs are managed well
    return { id: docSnap.id, ...docSnap.data() } as BlogPost;
  }
  return null;
};

/**
 * Updates an existing blog post.
 */
export const updateBlogPost = async (id: string, updateData: UpdateBlogPostData): Promise<void> => {
  const blogCollectionRef = await getBlogCollection();
  const postDocRef = doc(blogCollectionRef, id);
  const { coverImageFile, deleteExistingCoverImage, ...dataToUpdate } = updateData;
  let newCoverImageUrl: string | undefined = undefined;
  let newCoverImagePath: string | undefined = undefined;

  // Handle cover image update
  if (coverImageFile) {
    const existingPost = await getBlogPostById(id); // Get current image path for deletion
    if (existingPost?.coverImagePath && (deleteExistingCoverImage || !updateData.coverImageUrl)) { // Delete old only if new is uploaded or explicitly told
      await deleteImageFromFirebaseStorage(existingPost.coverImagePath).catch(err => console.warn("Failed to delete old cover image:", err));
    }
    const timestamp = Date.now();
    newCoverImagePath = `blogs/${timestamp}-${coverImageFile.name}`;
    newCoverImageUrl = await uploadImageToFirebaseStorage(coverImageFile, newCoverImagePath);
    (dataToUpdate as any).coverImageUrl = newCoverImageUrl;
    (dataToUpdate as any).coverImagePath = newCoverImagePath;
  } else if (deleteExistingCoverImage) {
    const existingPost = await getBlogPostById(id);
    if (existingPost?.coverImagePath) {
      await deleteImageFromFirebaseStorage(existingPost.coverImagePath).catch(err => console.warn("Failed to delete cover image:", err));
      (dataToUpdate as any).coverImageUrl = null;
      (dataToUpdate as any).coverImagePath = null;
    }
  }

  (dataToUpdate as any).updatedAt = Timestamp.now();
  if (dataToUpdate.isPublished && !(await getBlogPostById(id))?.publishedAt) {
    (dataToUpdate as any).publishedAt = Timestamp.now();
  } else if (dataToUpdate.isPublished === false) {
    (dataToUpdate as any).publishedAt = null;
  }

  await updateDoc(postDocRef, dataToUpdate);
};

/**
 * Deletes a blog post and its associated cover image from Storage.
 */
export const deleteBlogPost = async (id: string): Promise<void> => {
  const post = await getBlogPostById(id);
  if (post?.coverImagePath) {
    await deleteImageFromFirebaseStorage(post.coverImagePath).catch(err =>
        console.warn(`Failed to delete cover image ${post.coverImagePath} for blog post ${id}:`, err)
    );
  }
  const blogCollectionRef = await getBlogCollection();
  const postDocRef = doc(blogCollectionRef, id);
  await deleteDoc(postDocRef);
};
